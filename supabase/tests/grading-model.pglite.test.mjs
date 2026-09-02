import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const packageDir = process.env.PGLITE_PACKAGE_DIR || "";

function moduleUrl(...segments) {
  return pathToFileURL(join(packageDir, "node_modules", ...segments)).href;
}

test("aplica todas las migraciones y ejecuta las pruebas de corrección en PostgreSQL local", {
  skip: !packageDir && "PGLITE_PACKAGE_DIR no está configurado",
}, async () => {
  const [{ PGlite }, { pgtap }] = await Promise.all([
    import(moduleUrl("@electric-sql", "pglite", "dist", "index.js")),
    import(moduleUrl("@electric-sql", "pglite-pgtap", "dist", "index.js")),
  ]);
  const db = await PGlite.create({ extensions: { pgtap } });

  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      create table auth.users (
        id uuid primary key,
        email text unique
      );
    `);

    const migrationsDir = join(process.cwd(), "supabase", "migrations");
    const migrationNames = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const name of migrationNames) {
      const sql = await readFile(join(migrationsDir, name), "utf8");
      try {
        await db.exec(sql);
      } catch (error) {
        throw new Error(`Falló la migración ${name}: ${error.message}`, { cause: error });
      }
    }

    await db.exec("create extension if not exists pgtap;");
    const testSql = await readFile(
      join(process.cwd(), "supabase", "tests", "grading_model_security_test.sql"),
      "utf8",
    );
    const results = await db.exec(testSql);
    const tapLines = results.flatMap((result) => result.rows || [])
      .flatMap((row) => Object.values(row))
      .filter((value) => typeof value === "string");
    const failures = tapLines.filter((line) => line.startsWith("not ok"));

    assert.deepEqual(failures, [], tapLines.join("\n"));
    assert.ok(tapLines.some((line) => line === "1..76"), tapLines.join("\n"));

    const seedSql = await readFile(
      join(process.cwd(), "supabase", "seed.sql"),
      "utf8",
    );
    await db.exec(seedSql);
    const seeded = await db.query(`
      select
        count(*) filter (where q.kind = 'essay')::integer as essay_count,
        count(rc.id)::integer as criterion_count
      from exam_private.exams e
      join exam_private.questions q on q.exam_id = e.id
      left join exam_private.rubrics rubric
        on rubric.exam_id = e.id and rubric.is_active = true
      left join exam_private.rubric_criteria rc
        on rc.rubric_id = rubric.id and rc.question_id = q.id
      where e.slug = 'parcial-demo'
    `);
    assert.deepEqual(seeded.rows[0], {
      essay_count: 2,
      criterion_count: 2,
    });
  } finally {
    await db.close();
  }
});
