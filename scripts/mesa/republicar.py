"""Lleva la corrección de la mesa (artefacto) a la plataforma y la vuelve a publicar.

Uso: python republicar.py <dir_mesa> <db.json> <salida.sql> <modo: prueba|aplicar> <attemptId> [...]

<db.json> es la salida de `supabase db query -o json` de consulta_db.sql para esos
intentos. Imprime qué cambia respecto de lo publicado y escribe el SQL: reabrir,
guardar, marcar revisada, lista y publicar, como Blas (coordinación). En modo
«prueba» el bloque termina con una excepción y no queda nada escrito.
"""
import json, sys, os

BLAS = "dfca77b7-4ef4-4426-8430-3cc562f004a8"
mesa, db_json, salida, modo, *ids = sys.argv[1:]
filas = {r["attempt_id"]: r for r in json.load(open(db_json, encoding="utf-8"))["rows"]}


def leer(col, i):
    p = os.path.join(mesa, col, f"{i}.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None


def clave(a):
    return (a["kind"], a["startOffset"], a["endOffset"], a.get("suggestion") or "", a.get("comment") or "")


bloques, resumen = [], []
for aid in ids:
    al, rev, mk, db = leer("alumnos", aid), leer("revision", aid) or {}, leer("marcas", aid) or {}, filas[aid]
    descartadas = set(mk.get("descartadas") or [])
    items = sorted(db["items"], key=lambda x: x["position"])
    publicadas = {e["itemId"]: e for e in db["snapshot"]["essays"]}
    ensayos, cambios = [], []
    for k, (c, it) in enumerate(zip(al["consignas"], items), start=1):
        cid = c["id"]
        ta, td = c.get("texto") or "", it["text"] or ""
        corr = td.find(ta) if ta else 0
        if corr < 0:
            corr = td.find(ta.strip())
        if corr < 0:
            raise SystemExit(f"{al['nombre']} {cid}: el texto de la mesa no está en la base")
        marcas = []
        for m in (al.get("ortografia") or {}).get(cid, []):
            if f"{cid}:{m['i']}" in descartadas:
                continue
            a = corr + m["i"]
            sel = td[a:a + m["n"]]
            if sel != m["mal"]:
                raise SystemExit(f"{al['nombre']} {cid}: la marca «{m['mal']}» no coincide con «{sel}»")
            marcas.append({"kind": "accent" if m["tipo"] == "tilde" else "spelling", "startOffset": a,
                           "endOffset": a + m["n"], "selectedText": sel, "suggestion": m["bien"], "comment": "",
                           "visibleToStudent": True})
        for x in mk.get("comentarios") or []:
            if x["c"] != cid:
                continue
            a = corr + x["i"]
            marcas.append({"kind": "comment", "startOffset": a, "endOffset": a + x["n"],
                           "selectedText": td[a:a + x["n"]], "suggestion": None, "comment": x["texto"],
                           "visibleToStudent": True})
        nota = rev.get(cid, c.get("propuesta"))
        dev = rev.get("dev" + cid[1:], c.get("devolucion") or "")
        ensayos.append({"itemId": it["itemId"], "score": nota, "generalFeedback": dev, "internalNote": "",
                        "annotations": marcas})
        pub = publicadas.get(it["itemId"], {})
        if float(pub.get("score") or 0) != float(nota):
            cambios.append(f"consigna {k}: puntaje {pub.get('score')} → {nota}")
        if (pub.get("generalFeedback") or "").strip() != dev.strip():
            cambios.append(f"consigna {k}: devolución nueva")
        antes = {clave(a) for a in pub.get("annotations") or []}
        ahora = {clave(a) for a in marcas}
        if antes != ahora:
            cambios.append(f"consigna {k}: marcas {len(antes)} → {len(ahora)} "
                           f"(+{len(ahora - antes)} / -{len(antes - ahora)})")
    resultado = rev.get("resultado") or al.get("resultadoPropuesto")
    total = round(al["mc"] + sum(e["score"] for e in ensayos), 2)
    nota_final = 2 if resultado == "desaprobado" else total
    if (resultado, float(nota_final)) != (db["result"], float(db["final_score"])):
        cambios.append(f"resultado {db['result']} {db['final_score']} → {resultado} {nota_final}")
    resumen.append((al["nombre"], cambios))
    if not cambios:
        continue
    datos = json.dumps(ensayos, ensure_ascii=False).replace("$x$", "")
    salida_res = json.dumps({"result": resultado, "finalScore": nota_final})
    bloques.append(f"""
  select public_id, grading_version into v_a from exam_private.attempts where public_id = '{aid}';
  perform public.grading_reopen('{BLAS}', v_a.public_id, v_a.grading_version);
  select grading_version into v_v from exam_private.attempts where public_id = '{aid}';
  perform public.grading_save_draft('{BLAS}', v_a.public_id, v_v, $x${datos}$x$::jsonb, '{salida_res}'::jsonb);
  select grading_version into v_v from exam_private.attempts where public_id = '{aid}';
  perform public.grading_mark_reviewed('{BLAS}', v_a.public_id, v_v);
  select grading_version into v_v from exam_private.attempts where public_id = '{aid}';
  perform public.grading_mark_ready('{BLAS}', v_a.public_id, v_v);
  select grading_version into v_v from exam_private.attempts where public_id = '{aid}';
  perform public.grading_publish('{BLAS}', v_a.public_id, v_v);
  v_log := v_log || ' | ' || (select display_name || ': ' || result || ' ' || final_score || ', devolución v' ||
    (select max(version) from exam_private.feedback_releases where attempt_id = a.id)
    from exam_private.attempts a where public_id = '{aid}');""")

for nombre, cambios in resumen:
    print(f"{nombre}: " + ("; ".join(cambios) if cambios else "sin cambios respecto de lo publicado"))

final = "raise exception 'PRUEBA (se deshace todo):%', v_log;" if modo == "prueba" else "raise notice 'APLICADO:%', v_log;"
sql = f"""do $do$
declare v_a record; v_v bigint; v_log text := '';
begin{''.join(bloques)}
  {final}
end;
$do$;
select 'listo' as fin;
"""
open(salida, "w", encoding="utf-8").write(sql if bloques else "select 'nada que publicar' as fin;\n")
print(f"{len(bloques)} para republicar")
