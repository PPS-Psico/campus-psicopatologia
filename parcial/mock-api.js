const INTERNAL_DEMO_KEY = "psicopato-exam-demo-v2";

const ANSWER_KEY = Object.freeze({
  "a1111111-1111-4111-8111-111111111111": "b1111111-1111-4111-8111-111111111111",
  "a2222222-2222-4222-8222-222222222222": "c2222222-2222-4222-8222-222222222222",
  "a3333333-3333-4333-8333-333333333333": "d3333333-3333-4333-8333-333333333333",
  "a4444444-4444-4444-8444-444444444444": "e4444444-4444-4444-8444-444444444444",
  "a5555555-5555-4555-8555-555555555555": "f2222222-2222-4222-8222-222222222222",
  "a6666666-6666-4666-8666-666666666666": "63333333-3333-4333-8333-333333333333",
  "a7777777-7777-4777-8777-777777777777": "71111111-1111-4111-8111-111111111111",
  "a8888888-8888-4888-8888-888888888888": "84444444-4444-4444-8444-444444444444",
  "a9999999-9999-4999-8999-999999999999": "92222222-2222-4222-8222-222222222222",
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa": "a0333333-3333-4333-8333-333333333333",
  "b0000000-0000-4000-8000-000000000011": "c0000000-0000-4000-8000-000000000112",
  "b0000000-0000-4000-8000-000000000012": "c0000000-0000-4000-8000-000000000123",
  "b0000000-0000-4000-8000-000000000013": "c0000000-0000-4000-8000-000000000131",
  "b0000000-0000-4000-8000-000000000014": "c0000000-0000-4000-8000-000000000144",
  "b0000000-0000-4000-8000-000000000015": "c0000000-0000-4000-8000-000000000152",
  "b0000000-0000-4000-8000-000000000016": "c0000000-0000-4000-8000-000000000161",
  "b0000000-0000-4000-8000-000000000017": "c0000000-0000-4000-8000-000000000173",
  "b0000000-0000-4000-8000-000000000018": "c0000000-0000-4000-8000-000000000184",
  "b0000000-0000-4000-8000-000000000019": "c0000000-0000-4000-8000-000000000192",
  "b0000000-0000-4000-8000-000000000020": "c0000000-0000-4000-8000-000000000201",
  "b0000000-0000-4000-8000-000000000021": "c0000000-0000-4000-8000-000000000212",
  "b0000000-0000-4000-8000-000000000022": "c0000000-0000-4000-8000-000000000223",
  "b0000000-0000-4000-8000-000000000023": "c0000000-0000-4000-8000-000000000231",
  "b0000000-0000-4000-8000-000000000024": "c0000000-0000-4000-8000-000000000244",
  "b0000000-0000-4000-8000-000000000025": "c0000000-0000-4000-8000-000000000251",
  "b0000000-0000-4000-8000-000000000026": "c0000000-0000-4000-8000-000000000262",
  "b0000000-0000-4000-8000-000000000027": "c0000000-0000-4000-8000-000000000273",
  "b0000000-0000-4000-8000-000000000028": "c0000000-0000-4000-8000-000000000284",
  "b0000000-0000-4000-8000-000000000029": "c0000000-0000-4000-8000-000000000291",
  "b0000000-0000-4000-8000-000000000030": "c0000000-0000-4000-8000-000000000304",
  "b0000000-0000-4000-8000-000000000031": "c0000000-0000-4000-8000-000000000312",
  "b0000000-0000-4000-8000-000000000032": "c0000000-0000-4000-8000-000000000321",
  "b0000000-0000-4000-8000-000000000033": "c0000000-0000-4000-8000-000000000333",
  "b0000000-0000-4000-8000-000000000034": "c0000000-0000-4000-8000-000000000344",
  "b0000000-0000-4000-8000-000000000035": "c0000000-0000-4000-8000-000000000352",
  "b0000000-0000-4000-8000-000000000036": "c0000000-0000-4000-8000-000000000363",
  "b0000000-0000-4000-8000-000000000037": "c0000000-0000-4000-8000-000000000371",
  "b0000000-0000-4000-8000-000000000038": "c0000000-0000-4000-8000-000000000384",
  "b0000000-0000-4000-8000-000000000039": "c0000000-0000-4000-8000-000000000392",
  "b0000000-0000-4000-8000-000000000040": "c0000000-0000-4000-8000-000000000403",
  "b0000000-0000-4000-8000-000000000041": "c0000000-0000-4000-8000-000000000412",
  "b0000000-0000-4000-8000-000000000042": "c0000000-0000-4000-8000-000000000421",
  "b0000000-0000-4000-8000-000000000043": "c0000000-0000-4000-8000-000000000433",
  "b0000000-0000-4000-8000-000000000044": "c0000000-0000-4000-8000-000000000441",
  "b0000000-0000-4000-8000-000000000045": "c0000000-0000-4000-8000-000000000454",
  "b0000000-0000-4000-8000-000000000046": "c0000000-0000-4000-8000-000000000462",
  "b0000000-0000-4000-8000-000000000047": "c0000000-0000-4000-8000-000000000473",
  "b0000000-0000-4000-8000-000000000048": "c0000000-0000-4000-8000-000000000484",
});

const ITEMS = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    position: 1,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cómo distingue Jaspers la psicopatología de la psiquiatría?",
    points: 1,
    options: [
      { id: "b1111111-1111-4111-8111-111111111111", label: "La psicopatología es una ciencia teórica; la psiquiatría, una profesión práctica orientada al individuo" },
      { id: "b2222222-2222-4222-8222-222222222222", label: "La psicopatología se ocupa sólo del cerebro; la psiquiatría, sólo de la conducta" },
      { id: "b3333333-3333-4333-8333-333333333333", label: "La psicopatología trata pacientes; la psiquiatría produce conceptos generales" },
      { id: "b4444444-4444-4444-8444-444444444444", label: "No establece ninguna diferencia entre ambas" },
    ],
    response: null,
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    position: 2,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "En el binomio metodológico de Jaspers, comprender significa:",
    points: 1,
    options: [
      { id: "c1111111-1111-4111-8111-111111111111", label: "Buscar exclusivamente la lesión cerebral que causa una conducta" },
      { id: "c2222222-2222-4222-8222-222222222222", label: "Captar desde dentro cómo una vivencia se enlaza con otra en una relación de sentido" },
      { id: "c3333333-3333-4333-8333-333333333333", label: "Clasificar síntomas sin atender a la experiencia del paciente" },
      { id: "c4444444-4444-4444-8444-444444444444", label: "Aplicar una regla estadística sin reconstruir conexiones" },
    ],
    response: null,
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    position: 3,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué operación designa explicar para Jaspers?",
    points: 1,
    options: [
      { id: "d1111111-1111-4111-8111-111111111111", label: "Reproducir afectivamente la experiencia del paciente" },
      { id: "d2222222-2222-4222-8222-222222222222", label: "Encontrar un sentido consciente en toda vivencia sin excepción" },
      { id: "d3333333-3333-4333-8333-333333333333", label: "Suponer reglas causales, como en las ciencias naturales, para lo que resiste a la comprensión" },
      { id: "d4444444-4444-4444-8444-444444444444", label: "Suspender cualquier pregunta por la causalidad" },
    ],
    response: null,
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    position: 4,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cuál de estas descripciones corresponde a un desarrollo?",
    points: 1,
    options: [
      { id: "e1111111-1111-4111-8111-111111111111", label: "Una lista de síntomas sin continuidad biográfica" },
      { id: "e2222222-2222-4222-8222-222222222222", label: "Una irrupción acotada que transforma irreversiblemente la personalidad previa" },
      { id: "e3333333-3333-4333-8333-333333333333", label: "Una lesión anatómica demostrable que explica por sí sola el cuadro" },
      { id: "e4444444-4444-4444-8444-444444444444", label: "Una cadena de relaciones de sentido que, a lo largo de una biografía, constituye una personalidad" },
    ],
    response: null,
  },
  {
    id: "a5555555-5555-4555-8555-555555555555",
    position: 5,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué caracteriza a un proceso en la organización clínica jaspersiana?",
    points: 1,
    options: [
      { id: "f1111111-1111-4111-8111-111111111111", label: "Mantiene una continuidad completa de sentido durante toda la biografía" },
      { id: "f2222222-2222-4222-8222-222222222222", label: "Irrumpe en un tiempo acotado e introduce una transformación irreversible en la personalidad" },
      { id: "f3333333-3333-4333-8333-333333333333", label: "Sólo puede estudiarse mediante la comprensión y nunca mediante la explicación" },
      { id: "f4444444-4444-4444-8444-444444444444", label: "Es equivalente a cualquier cambio de opinión consciente" },
    ],
    response: null,
  },
  {
    id: "a6666666-6666-4666-8666-666666666666",
    position: 6,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué llama Jaspers un prejuicio?",
    points: 1,
    options: [
      { id: "61111111-1111-4111-8111-111111111111", label: "Una emoción intensa del observador" },
      { id: "62222222-2222-4222-8222-222222222222", label: "Cualquier afirmación que luego resulta falsa" },
      { id: "63333333-3333-4333-8333-333333333333", label: "Un procedimiento que dejó de ser consciente de sí mismo" },
      { id: "64444444-4444-4444-8444-444444444444", label: "Toda hipótesis formulada antes de una entrevista" },
    ],
    response: null,
  },
  {
    id: "a7777777-7777-4777-8777-777777777777",
    position: 7,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Cuál es el riesgo del prejuicio psicológico señalado por Jaspers?",
    points: 1,
    options: [
      { id: "71111111-1111-4111-8111-111111111111", label: "Querer comprender todo y perder el sentido crítico de los límites de lo comprensible" },
      { id: "72222222-2222-4222-8222-222222222222", label: "Explicar demasiado y abandonar por completo la empatía" },
      { id: "73333333-3333-4333-8333-333333333333", label: "Confundir una profesión práctica con una ciencia teórica" },
      { id: "74444444-4444-4444-8444-444444444444", label: "Negar que existan vivencias conscientes" },
    ],
    response: null,
  },
  {
    id: "a8888888-8888-4888-8888-888888888888",
    position: 8,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿Qué exige el programa de imparcialidad fenomenológica de Jaspers?",
    points: 1,
    options: [
      { id: "81111111-1111-4111-8111-111111111111", label: "Aceptar como verdadera toda interpretación afectiva del clínico" },
      { id: "82222222-2222-4222-8222-222222222222", label: "Elegir de antemano una única teoría causal y aplicarla a todos los casos" },
      { id: "83333333-3333-4333-8333-333333333333", label: "Renunciar a describir la experiencia del paciente" },
      { id: "84444444-4444-4444-8444-444444444444", label: "Poner en suspenso hipótesis y construcciones para atender al hecho tal como aparece en la experiencia" },
    ],
    response: null,
  },
  {
    id: "a9999999-9999-4999-8999-999999999999",
    position: 9,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "En la 16.ª conferencia, ¿dónde ubica Freud la diferencia principal entre psiquiatría y psicoanálisis?",
    points: 1,
    options: [
      { id: "91111111-1111-4111-8111-111111111111", label: "La psiquiatría atiende el malestar; el psicoanálisis no lo considera" },
      { id: "92222222-2222-4222-8222-222222222222", label: "La psiquiatría clasifica la forma del síntoma; el psicoanálisis interroga su contenido" },
      { id: "93333333-3333-4333-8333-333333333333", label: "El psicoanálisis reemplaza el diagnóstico por una explicación neurológica" },
      { id: "94444444-4444-4444-8444-444444444444", label: "La psiquiatría estudia casos; el psicoanálisis sólo formula argumentos abstractos" },
    ],
    response: null,
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    position: 10,
    section: "Clase 3",
    kind: "single_choice",
    prompt: "¿En qué punto se separan Jaspers y Freud respecto del campo psíquico?",
    points: 1,
    options: [
      { id: "a0111111-1111-4111-8111-111111111111", label: "Jaspers estudia sólo individuos; Freud estudia exclusivamente conceptos generales" },
      { id: "a0222222-2222-4222-8222-222222222222", label: "Jaspers reduce lo psíquico al cerebro; Freud rechaza toda causalidad" },
      { id: "a0333333-3333-4333-8333-333333333333", label: "Jaspers limita su objeto hasta las fronteras de la conciencia; Freud sostiene que lo consciente es una cualidad contingente de lo psíquico" },
      { id: "a0444444-4444-4444-8444-444444444444", label: "No existe una diferencia metodológica entre ambos" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000011",
    position: 11,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "Según la 23.ª conferencia, ¿por qué el síntoma neurótico puede resultar tan resistente?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000111", label: "Porque elimina por completo el conflicto que le dio origen" },
      { id: "c0000000-0000-4000-8000-000000000112", label: "Porque las dos fuerzas enfrentadas encuentran en él una formación de compromiso" },
      { id: "c0000000-0000-4000-8000-000000000113", label: "Porque conserva sin cambios la satisfacción que la realidad permitió" },
      { id: "c0000000-0000-4000-8000-000000000114", label: "Porque su forma visible permite reconocer inmediatamente su causa" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000012",
    position: 12,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué recorrido sigue la libido cuando la satisfacción queda frustrada, según la 23.ª conferencia?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000121", label: "Abandona toda búsqueda de satisfacción y queda sin investidura" },
      { id: "c0000000-0000-4000-8000-000000000122", label: "Se dirige de manera inmediata desde la realidad hacia el síntoma" },
      { id: "c0000000-0000-4000-8000-000000000123", label: "Se introversa hacia las fantasías y desde allí regresa a puntos de fijación" },
      { id: "c0000000-0000-4000-8000-000000000124", label: "Se transforma primero en conciencia moral y después en recuerdo" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000013",
    position: 13,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Cómo organiza Freud la causación en las series complementarias?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000131", label: "Articula predisposición por fijación, vivenciar accidental y magnitud cuantitativa" },
      { id: "c0000000-0000-4000-8000-000000000132", label: "Elige entre una causa hereditaria o una causa ambiental excluyente" },
      { id: "c0000000-0000-4000-8000-000000000133", label: "Reduce cada neurosis a un único acontecimiento sexual infantil" },
      { id: "c0000000-0000-4000-8000-000000000134", label: "Ordena los síntomas según su gravedad sin formular una etiología" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000014",
    position: 14,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué debe agregarse a la frustración y a la regresión para que se forme una neurosis?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000141", label: "Una lesión orgánica que confirme la enfermedad" },
      { id: "c0000000-0000-4000-8000-000000000142", label: "Una explicación consciente aceptada por el paciente" },
      { id: "c0000000-0000-4000-8000-000000000143", label: "Una clasificación previa entre neurosis y psicosis" },
      { id: "c0000000-0000-4000-8000-000000000144", label: "Un conflicto entre la satisfacción buscada y las exigencias del yo" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000015",
    position: 15,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "En «La represión», ¿qué condición explica que una moción pulsional sea reprimida?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000151", label: "Que la satisfacción pulsional sea siempre displacentera por sí misma" },
      { id: "c0000000-0000-4000-8000-000000000152", label: "Que la satisfacción produzca más displacer por ser inconciliable con otras exigencias" },
      { id: "c0000000-0000-4000-8000-000000000153", label: "Que la representación haya perdido previamente todo monto de afecto" },
      { id: "c0000000-0000-4000-8000-000000000154", label: "Que el sujeto conozca la causa y decida mantenerla fuera de la conciencia" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000016",
    position: 16,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué distingue a la represión primordial de la represión propiamente dicha?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000161", label: "La primordial funda un núcleo fijado; la segunda recae sobre sus retoños" },
      { id: "c0000000-0000-4000-8000-000000000162", label: "La primordial forma síntomas; la segunda los elimina de manera definitiva" },
      { id: "c0000000-0000-4000-8000-000000000163", label: "La primordial actúa sólo en adultos; la segunda pertenece a la infancia" },
      { id: "c0000000-0000-4000-8000-000000000164", label: "La primordial afecta el monto; la segunda afecta únicamente la conducta" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000017",
    position: 17,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Qué obliga a estudiar por separado la representación y el monto de afecto?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000171", label: "Que ambos desaparecen siempre de manera simultánea después de la represión" },
      { id: "c0000000-0000-4000-8000-000000000172", label: "Que sólo el afecto puede permanecer activo dentro del inconsciente" },
      { id: "c0000000-0000-4000-8000-000000000173", label: "Que la representación es rechazada y el afecto puede seguir destinos diferentes" },
      { id: "c0000000-0000-4000-8000-000000000174", label: "Que la representación pertenece al cuerpo y el afecto a la conciencia" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000018",
    position: 18,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "¿Cómo se relacionan formación sustitutiva y formación de síntoma?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000181", label: "Son dos nombres equivalentes para cualquier resultado de la represión" },
      { id: "c0000000-0000-4000-8000-000000000182", label: "La formación de síntoma ocurre primero y la sustitución siempre después" },
      { id: "c0000000-0000-4000-8000-000000000183", label: "La formación sustitutiva sólo existe cuando no interviene la represión" },
      { id: "c0000000-0000-4000-8000-000000000184", label: "Todo síntoma es sustitutivo, pero no toda formación sustitutiva constituye un síntoma" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000019",
    position: 19,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "En «Mis tesis sobre el papel de la sexualidad…», ¿qué corrige Freud de su teoría anterior?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000191", label: "Abandona por completo la sexualidad infantil como problema etiológico" },
      { id: "c0000000-0000-4000-8000-000000000192", label: "Deja de considerar universal la seducción real y reconoce el papel de la fantasía" },
      { id: "c0000000-0000-4000-8000-000000000193", label: "Sustituye el mecanismo psíquico por una explicación exclusivamente hereditaria" },
      { id: "c0000000-0000-4000-8000-000000000194", label: "Rechaza que las vivencias accidentales participen en la serie causal" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000020",
    position: 20,
    section: "Clase 4",
    kind: "single_choice",
    prompt: "Según Mazzuca, ¿cómo debe entenderse la tripartición neurosis, psicosis y perversión?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000201", label: "Como una sistematización lacaniana construida a partir de oposiciones presentes en Freud" },
      { id: "c0000000-0000-4000-8000-000000000202", label: "Como una clasificación explícita e invariable formulada por Freud desde sus primeros textos" },
      { id: "c0000000-0000-4000-8000-000000000203", label: "Como un conjunto de diagnósticos descriptivos aplicable por igual en cualquier orientación" },
      { id: "c0000000-0000-4000-8000-000000000204", label: "Como tres grados sucesivos de gravedad dentro de una única enfermedad" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000021",
    position: 21,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "Según Inhibición, síntoma y angustia, ¿qué constituye un «triunfo» de la formación de síntoma en la neurosis obsesiva?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000211", label: "Que el síntoma elimine definitivamente las prohibiciones del yo" },
      { id: "c0000000-0000-4000-8000-000000000212", label: "Que se logre enlazar la prohibición con la satisfacción, de modo que el mandato también satisfaga" },
      { id: "c0000000-0000-4000-8000-000000000213", label: "Que los síntomas positivos aparezcan antes que los negativos" },
      { id: "c0000000-0000-4000-8000-000000000214", label: "Que el síntoma se descargue en el cuerpo sin participación del yo" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000022",
    position: 22,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿Cómo explica Freud en 1926 que el yo del obsesivo se sienta culpable aunque se sabe inocente?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000221", label: "Porque el yo conoce el texto verdadero de la moción agresiva y decide castigarse" },
      { id: "c0000000-0000-4000-8000-000000000222", label: "Porque la culpa proviene de una falta real cometida en la vida adulta" },
      { id: "c0000000-0000-4000-8000-000000000223", label: "Porque el superyó se comporta como si no hubiera habido represión y castiga al yo por la moción agresiva" },
      { id: "c0000000-0000-4000-8000-000000000224", label: "Porque la represión elimina tanto el contenido agresivo como el sentimiento de culpa" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000023",
    position: 23,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿Qué diferencia hay entre el lugar de la regresión en la 23.ª conferencia y en Inhibición, síntoma y angustia?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000231", label: "En 1926, en la neurosis obsesiva, la regresión es la primera defensa del yo frente al peligro edípico" },
      { id: "c0000000-0000-4000-8000-000000000232", label: "En la 23.ª conferencia la regresión es una defensa del yo y en 1926 desaparece del esquema" },
      { id: "c0000000-0000-4000-8000-000000000233", label: "En los dos textos la regresión se dirige a objetos actuales y no a fijaciones" },
      { id: "c0000000-0000-4000-8000-000000000234", label: "En 1926 la regresión ya no depende de los puntos de fijación de la libido" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000024",
    position: 24,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿Qué distingue la regresión propia de la neurosis obsesiva de la que se observa en la histeria?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000241", label: "En la histeria se pierde el objeto de amor; en la obsesión se conserva intacto el deseo genital" },
      { id: "c0000000-0000-4000-8000-000000000242", label: "En la obsesión retrocede el objeto de amor; en la histeria retrocede el modo de satisfacción" },
      { id: "c0000000-0000-4000-8000-000000000243", label: "En la histeria la regresión es libidinal y en la obsesión no hay regresión" },
      { id: "c0000000-0000-4000-8000-000000000244", label: "En la obsesión cambia el modo de satisfacción (regresión libidinal); en la histeria la libido vuelve a los objetos infantiles" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000025",
    position: 25,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿Por qué las formaciones reactivas no son síntomas?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000251", label: "Porque son anteriores al síntoma, no hacen sufrir y son acordes con el yo" },
      { id: "c0000000-0000-4000-8000-000000000252", label: "Porque sólo aparecen en la histeria y nunca en la neurosis obsesiva" },
      { id: "c0000000-0000-4000-8000-000000000253", label: "Porque expresan directamente la moción reprimida sin ninguna desfiguración" },
      { id: "c0000000-0000-4000-8000-000000000254", label: "Porque se forman en la pubertad, después del retorno de lo reprimido" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000026",
    position: 26,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "En el Hombre de las Ratas, sacar una piedra del camino del carruaje de la dama y después volver a ponerla es un ejemplo de…",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000261", label: "Aislamiento: se interpola una pausa en la que no debe ocurrir nada" },
      { id: "c0000000-0000-4000-8000-000000000262", label: "Anulación de lo acontecido: un segundo acto cancela al primero, aunque los dos ocurrieron" },
      { id: "c0000000-0000-4000-8000-000000000263", label: "Formación reactiva: un rasgo opuesto a la moción rechazada" },
      { id: "c0000000-0000-4000-8000-000000000264", label: "Conversión: el conflicto se descarga en una inervación corporal" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000027",
    position: 27,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿En qué consiste el aislamiento como técnica defensiva de la neurosis obsesiva?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000271", label: "En olvidar por completo la vivencia traumática, como en la amnesia histérica" },
      { id: "c0000000-0000-4000-8000-000000000272", label: "En desplazar el afecto a una zona del cuerpo investida en la infancia" },
      { id: "c0000000-0000-4000-8000-000000000273", label: "En conservar el recuerdo pero despojado de afecto y de sus vínculos asociativos" },
      { id: "c0000000-0000-4000-8000-000000000274", label: "En repetir una acción para que otra anterior no haya ocurrido" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000028",
    position: 28,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "Según Lacan en el Seminario 5, ¿cómo resuelve el obsesivo la evanescencia de su deseo?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000281", label: "Satisfaciéndolo de inmediato para que no se extinga" },
      { id: "c0000000-0000-4000-8000-000000000282", label: "Renunciando a todo deseo para evitar la angustia" },
      { id: "c0000000-0000-4000-8000-000000000283", label: "Identificándose con el objeto que sostiene el deseo de otro" },
      { id: "c0000000-0000-4000-8000-000000000284", label: "Produciendo un deseo prohibido, que le hace sostener al Otro mediante su prohibición" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000029",
    position: 29,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "Frente al enigma de lo que el capitán desea, el paciente se aferra a la orden de devolver el dinero. Según Lacan, ¿qué estrategia muestra esto?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000291", label: "La reducción del deseo del Otro a una demanda que se puede cumplir" },
      { id: "c0000000-0000-4000-8000-000000000292", label: "La identificación viril propia de la pregunta histérica" },
      { id: "c0000000-0000-4000-8000-000000000293", label: "La satisfacción directa del deseo del Otro" },
      { id: "c0000000-0000-4000-8000-000000000294", label: "La pérdida de la realidad característica de la psicosis" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000030",
    position: 30,
    section: "Clase 6",
    kind: "single_choice",
    prompt: "¿Qué busca el obsesivo en la hazaña, según Lacan?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000301", label: "Vencer efectivamente a su rival, aunque arriesgue la vida" },
      { id: "c0000000-0000-4000-8000-000000000302", label: "Liberarse de toda dependencia respecto del Otro" },
      { id: "c0000000-0000-4000-8000-000000000303", label: "Mostrar su deseo sin que intervenga ningún testigo" },
      { id: "c0000000-0000-4000-8000-000000000304", label: "El permiso del Otro que registra la proeza, más que el triunfo sobre el rival" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000031",
    position: 31,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "En la fobia de Juanito, ¿qué es síntoma y qué es inhibición, según Freud en 1926?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000311", label: "El miedo a los caballos es una inhibición y no poder salir a la calle es el síntoma" },
      { id: "c0000000-0000-4000-8000-000000000312", label: "La angustia frente al caballo es el síntoma; no poder andar por la calle es una inhibición que el yo se impone para no provocar la angustia" },
      { id: "c0000000-0000-4000-8000-000000000313", label: "Los dos son síntomas de conversión, porque se expresan en el cuerpo" },
      { id: "c0000000-0000-4000-8000-000000000314", label: "Ninguno es síntoma: los dos son formaciones reactivas" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000032",
    position: 32,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "¿Qué conflicto intenta solucionar la fobia de Juanito, según Freud en 1926?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000321", label: "Un conflicto de ambivalencia: un amor bien fundado y un odio no menos justificado hacia el padre" },
      { id: "c0000000-0000-4000-8000-000000000322", label: "Un conflicto entre la percepción de los caballos y el recuerdo de un accidente en la calle" },
      { id: "c0000000-0000-4000-8000-000000000323", label: "Un conflicto entre la ternura hacia la madre y los celos hacia la hermana" },
      { id: "c0000000-0000-4000-8000-000000000324", label: "Un conflicto entre el yo y la realidad exterior, como en la psicosis" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000033",
    position: 33,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "En «Obsesiones y fobias» (1895), ¿qué separa a las fobias de las obsesiones?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000331", label: "Las fobias se explican por un trauma infantil y las obsesiones por la herencia" },
      { id: "c0000000-0000-4000-8000-000000000332", label: "Las obsesiones aparecen sólo en niños y las fobias en adultos" },
      { id: "c0000000-0000-4000-8000-000000000333", label: "En las fobias el estado emotivo es siempre la angustia, sin la sustitución de una representación que Freud encuentra en las obsesiones" },
      { id: "c0000000-0000-4000-8000-000000000334", label: "En las fobias hay delirio y en las obsesiones no" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000034",
    position: 34,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "En Juanito, ¿qué contenido sustituye, desfigurado, la idea de ser mordido por el caballo?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000341", label: "El temor a perder el amor de la madre" },
      { id: "c0000000-0000-4000-8000-000000000342", label: "Una caída que presenció en la calle, sin otro sentido" },
      { id: "c0000000-0000-4000-8000-000000000343", label: "La llegada de su hermana Hanna" },
      { id: "c0000000-0000-4000-8000-000000000344", label: "Ser castrado por el padre" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000035",
    position: 35,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "En 1926 Freud revisa su tesis anterior sobre la relación entre angustia y represión. ¿Qué afirma ahora?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000351", label: "Que la libido reprimida se muda directamente en angustia" },
      { id: "c0000000-0000-4000-8000-000000000352", label: "Que la angustia crea la represión, y no la represión a la angustia" },
      { id: "c0000000-0000-4000-8000-000000000353", label: "Que la angustia de las zoofobias no tiene relación con la castración" },
      { id: "c0000000-0000-4000-8000-000000000354", label: "Que en las fobias no interviene la represión" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000036",
    position: 36,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "¿Qué es la angustia señal?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000361", label: "Una descarga masiva de angustia que desborda al yo, como en el trauma" },
      { id: "c0000000-0000-4000-8000-000000000362", label: "El afecto que resulta de la transformación de la libido reprimida" },
      { id: "c0000000-0000-4000-8000-000000000363", label: "Una señal que el yo emite ante una situación de peligro para poner en marcha la defensa" },
      { id: "c0000000-0000-4000-8000-000000000364", label: "Un síntoma corporal que reemplaza a la representación reprimida" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000037",
    position: 37,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "¿Qué ventajas tiene para Juanito que el caballo ocupe el lugar del padre?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000371", label: "Esquiva el conflicto de ambivalencia y le permite suspender la angustia evitando ver caballos" },
      { id: "c0000000-0000-4000-8000-000000000372", label: "Le permite odiar abiertamente al padre sin sentir culpa" },
      { id: "c0000000-0000-4000-8000-000000000373", label: "Hace desaparecer la angustia de castración" },
      { id: "c0000000-0000-4000-8000-000000000374", label: "Lo libera de toda restricción en su vida cotidiana" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000038",
    position: 38,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "Freud había dicho que la fobia es una proyección porque cambia un peligro pulsional interior por uno exterior. En 1926 dice que eso «se quedaba en la superficie». ¿Por qué?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000381", label: "Porque en la fobia no hay ningún objeto exterior" },
      { id: "c0000000-0000-4000-8000-000000000382", label: "Porque en la fobia el peligro es siempre la pérdida de la madre" },
      { id: "c0000000-0000-4000-8000-000000000383", label: "Porque la proyección es el mecanismo de la paranoia y no aparece en la fobia" },
      { id: "c0000000-0000-4000-8000-000000000384", label: "Porque la exigencia pulsional es peligrosa sólo porque conlleva un peligro exterior, la castración: se sustituye un peligro exterior por otro" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000039",
    position: 39,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "¿Cómo llega a Freud el material del caso Juanito?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000391", label: "Freud analiza al niño en sesiones diarias durante varios meses" },
      { id: "c0000000-0000-4000-8000-000000000392", label: "Por los registros y las conversaciones del padre, que lleva adelante el tratamiento con la guía de Freud" },
      { id: "c0000000-0000-4000-8000-000000000393", label: "Por el relato que Juanito hace de adulto, años después" },
      { id: "c0000000-0000-4000-8000-000000000394", label: "Por las notas del médico de la familia" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000040",
    position: 40,
    section: "Clase 7",
    kind: "single_choice",
    prompt: "Según la lectura de Lacan en el Seminario 4, ¿por qué no conviene reducir el caballo a «el padre»?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000401", label: "Porque el caballo no tiene ninguna relación con el padre" },
      { id: "c0000000-0000-4000-8000-000000000402", label: "Porque el caballo representa siempre a la madre" },
      { id: "c0000000-0000-4000-8000-000000000403", label: "Porque el caballo funciona como significante: toma distintos valores dentro de una red de sustituciones" },
      { id: "c0000000-0000-4000-8000-000000000404", label: "Porque Lacan considera que Juanito no tenía una fobia sino una psicosis" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000041",
    position: 41,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "¿Qué mecanismo le asigna Freud a la paranoia en 1896?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000411", label: "La conversión del afecto en una inervación corporal" },
      { id: "c0000000-0000-4000-8000-000000000412", label: "La proyección: el reproche se reprime erigiendo el síntoma de la desconfianza hacia los otros" },
      { id: "c0000000-0000-4000-8000-000000000413", label: "La formación reactiva, igual que en la neurosis obsesiva" },
      { id: "c0000000-0000-4000-8000-000000000414", label: "La sustitución de una representación por otra, como en las obsesiones" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000042",
    position: 42,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "En el caso de paranoia de 1896, ¿cómo retornan los reproches reprimidos?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000421", label: "Como pensamientos enunciados en voz alta (voces), con una doble desfiguración" },
      { id: "c0000000-0000-4000-8000-000000000422", label: "Como actos compulsivos que la paciente reconoce como absurdos" },
      { id: "c0000000-0000-4000-8000-000000000423", label: "Como síntomas de conversión en el cuerpo" },
      { id: "c0000000-0000-4000-8000-000000000424", label: "Sin ninguna desfiguración, tal como fueron vividos" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000043",
    position: 43,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "En Schreber, Freud corrige su forma de describir la proyección. ¿Qué fórmula propone?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000431", label: "Lo sofocado adentro es proyectado hacia afuera" },
      { id: "c0000000-0000-4000-8000-000000000432", label: "Lo rechazado afuera retorna adentro" },
      { id: "c0000000-0000-4000-8000-000000000433", label: "Lo cancelado adentro retorna desde afuera" },
      { id: "c0000000-0000-4000-8000-000000000434", label: "Lo reprimido retorna como una formación reactiva" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000044",
    position: 44,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "¿Por qué Freud no toma la proyección como lo específico de la paranoia en el caso Schreber?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000441", label: "Porque no cumple el mismo papel en todas las formas de paranoia y también ocurre fuera de ella, incluso en la vida normal" },
      { id: "c0000000-0000-4000-8000-000000000442", label: "Porque Schreber nunca atribuyó a otros lo que sentía" },
      { id: "c0000000-0000-4000-8000-000000000443", label: "Porque la proyección es exclusiva de la neurosis obsesiva" },
      { id: "c0000000-0000-4000-8000-000000000444", label: "Porque la reemplaza por la desmentida de la castración" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000045",
    position: 45,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "¿En qué tres fases descompone Freud el proceso de la represión en el caso Schreber?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000451", label: "Frustración, regresión y formación de síntoma" },
      { id: "c0000000-0000-4000-8000-000000000452", label: "Proyección, alucinación y delirio de grandeza" },
      { id: "c0000000-0000-4000-8000-000000000453", label: "Trauma, latencia y estallido de la neurosis" },
      { id: "c0000000-0000-4000-8000-000000000454", label: "Fijación, represión propiamente dicha y retorno de lo reprimido desde el lugar de la fijación" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000046",
    position: 46,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "¿Qué quiere decir Freud cuando afirma que el desasimiento de la libido «se cumple mudo»?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000461", label: "Que el paciente deja de hablar durante la enfermedad" },
      { id: "c0000000-0000-4000-8000-000000000462", label: "Que no recibimos noticia directa de él: hay que inferirlo de lo que sigue; lo ruidoso es el proceso de restablecimiento" },
      { id: "c0000000-0000-4000-8000-000000000463", label: "Que la libido se retira sin dejar ninguna consecuencia" },
      { id: "c0000000-0000-4000-8000-000000000464", label: "Que sólo se lo observa en las alucinaciones auditivas" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000047",
    position: 47,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "¿Qué es la formación delirante para Freud en el análisis de Schreber?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000471", label: "La producción patológica que termina de destruir el vínculo con el mundo" },
      { id: "c0000000-0000-4000-8000-000000000472", label: "Una formación reactiva contra los deseos homosexuales" },
      { id: "c0000000-0000-4000-8000-000000000473", label: "Un intento de restablecimiento, una reconstrucción del mundo" },
      { id: "c0000000-0000-4000-8000-000000000474", label: "Un error de juicio sin relación con la libido" },
    ],
    response: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000048",
    position: 48,
    section: "Clase 8",
    kind: "single_choice",
    prompt: "Según «Introducción del narcisismo», ¿qué destino tiene en la parafrenia la libido sustraída de los objetos?",
    points: 1,
    options: [
      { id: "c0000000-0000-4000-8000-000000000481", label: "Queda retenida en objetos de la fantasía (introversión), como en la neurosis" },
      { id: "c0000000-0000-4000-8000-000000000482", label: "Se transforma directamente en angustia" },
      { id: "c0000000-0000-4000-8000-000000000483", label: "Se sublima en intereses intelectuales" },
      { id: "c0000000-0000-4000-8000-000000000484", label: "Es conducida al yo, y de ahí surge el delirio de grandeza" },
    ],
    response: null,
  },
];

export const DEMO_ITEMS = ITEMS;
export const DEMO_ANSWER_KEY = ANSWER_KEY;

function delay(ms = 180) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// Una práctica de diez preguntas por clase. Para sumar otra: sus preguntas en
// ITEMS con su sección, su clave en ANSWER_KEY, una entrada acá y el número en
// la lista de config.js.
const PRACTICES = {
  "3": "Respondé diez preguntas sobre Jaspers, el método psicopatológico y la discusión con Freud.",
  "4": "Respondé diez preguntas sobre formación de síntoma, represión y etiología.",
  "6": "Respondé diez preguntas sobre la neurosis obsesiva en Freud (1926) y en Lacan (Seminario 5).",
  "7": "Respondé diez preguntas sobre la fobia de Juanito, la angustia señal y el cambio de la teoría entre 1895, 1909 y 1926.",
  "8": "Respondé ocho preguntas sobre el mecanismo de la paranoia en 1896 y en Schreber y sobre el narcisismo.",
};
export const PRACTICE_CLASSES = Object.freeze(Object.keys(PRACTICES));
// Sube cuando cambian las preguntas de una práctica, para no retomar una versión vieja.
const PRACTICE_STORAGE_VERSION = { "8": 2 };

export function buildDemoDefinition(practiceClass = null) {
  const normalizedClass = PRACTICE_CLASSES.includes(String(practiceClass))
    ? String(practiceClass)
    : null;
  if (normalizedClass) {
    return {
      storageKey: `psicopato-practice-clase-${normalizedClass}-v${PRACTICE_STORAGE_VERSION[normalizedClass] ?? 1}`,
      title: `Práctica para el parcial · Clase ${normalizedClass}`,
      instructions: `${PRACTICES[normalizedClass]} Podés repetir esta práctica y revisar las respuestas al finalizar.`,
      durationMinutes: 20,
      items: ITEMS.filter((item) => item.section === `Clase ${normalizedClass}`),
    };
  }
  return {
    storageKey: INTERNAL_DEMO_KEY,
    title: "Simulacro seguro de prueba · Clases 3 y 4",
    instructions: "Respondé las veinte preguntas para probar el recorrido completo, el guardado y la entrega dentro de Safe Exam Browser. Esta actividad técnica no registra una nota ni anticipa el formato definitivo.",
    durationMinutes: 30,
    items: ITEMS.filter((item) => item.section === "Clase 3" || item.section === "Clase 4"),
  };
}

export function buildDemoReview(items, answerKey = ANSWER_KEY) {
  const reviewedItems = items.map((item) => {
    const correctOptionId = answerKey[item.id];
    const selectedOptionId = item.response?.selectedOptionId || null;
    return {
      itemId: item.id,
      selectedOptionId,
      correctOptionId,
      isCorrect: Boolean(correctOptionId && selectedOptionId === correctOptionId),
      points: Number(item.points || 0),
    };
  });
  return {
    score: reviewedItems.reduce((total, item) => total + (item.isCorrect ? item.points : 0), 0),
    maxScore: reviewedItems.reduce((total, item) => total + item.points, 0),
    correctCount: reviewedItems.filter((item) => item.isCorrect).length,
    total: reviewedItems.length,
    items: reviewedItems,
  };
}

function attachReview(value) {
  value.review = buildDemoReview(value.items);
  return value;
}

function applyServerDeadline(value, store) {
  if (value?.attempt?.status === "in_progress" && Date.now() >= Date.parse(value.attempt.deadlineAt)) {
    value.attempt.status = "timed_out";
    value.attempt.submittedAt = value.attempt.deadlineAt;
    attachReview(value);
    store(value);
  }
  return value;
}

export class MockExamApi {
  constructor(practiceClass = null) {
    this.practiceClass = PRACTICE_CLASSES.includes(String(practiceClass))
      ? String(practiceClass)
      : null;
    this.definition = buildDemoDefinition(this.practiceClass);
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.definition.storageKey) || "null"); }
    catch { return null; }
  }

  store(value) {
    localStorage.setItem(this.definition.storageKey, JSON.stringify(value));
  }

  reset() {
    localStorage.removeItem(this.definition.storageKey);
  }

  cleanUrl() {
    return this.practiceClass
      ? `${location.pathname}?clase=${this.practiceClass}`
      : `${location.pathname}?demo=1`;
  }

  retryUrl() {
    return this.practiceClass
      ? `index.html?clase=${this.practiceClass}&reset=1`
      : "index.html?demo=1&reset=1";
  }

  applyServerDeadline(value) {
    return applyServerDeadline(value, (nextValue) => this.store(nextValue));
  }

  async launch() {
    await delay(350);
    let state = this.load();
    if (!state) {
      const now = new Date();
      state = {
        serverNow: now.toISOString(),
        exam: {
          id: "11111111-1111-4111-8111-111111111111",
          title: this.definition.title,
          instructions: this.definition.instructions,
          durationMinutes: this.definition.durationMinutes,
        },
        attempt: {
          id: "d1111111-1111-4111-8111-111111111111",
          studentName: this.practiceClass ? "Estudiante de práctica" : "Estudiante de prueba",
          status: "in_progress",
          startedAt: now.toISOString(),
          deadlineAt: new Date(now.getTime() + this.definition.durationMinutes * 60 * 1000).toISOString(),
          submittedAt: null,
          lastSavedAt: null,
          serverVersion: 0,
        },
        items: structuredClone(this.definition.items),
      };
      this.store(state);
    }
    state = this.applyServerDeadline(state);
    return { ...structuredClone(state), serverNow: new Date().toISOString(), attemptToken: "demo-attempt-token" };
  }

  async state() {
    await delay();
    const state = this.applyServerDeadline(this.load());
    if (!state) throw new Error("invalid_attempt_session");
    return { ...structuredClone(state), serverNow: new Date().toISOString() };
  }

  async save(_token, responses) {
    await delay(260);
    const state = this.applyServerDeadline(this.load());
    if (!state || state.attempt.status !== "in_progress") throw new Error("invalid_attempt_session");
    for (const response of responses) {
      const item = state.items.find((candidate) => candidate.id === response.itemId);
      if (item) item.response = { ...response, savedAt: new Date().toISOString() };
    }
    state.attempt.lastSavedAt = new Date().toISOString();
    state.attempt.serverVersion += 1;
    this.store(state);
    return {
      serverNow: new Date().toISOString(),
      status: state.attempt.status,
      deadlineAt: state.attempt.deadlineAt,
      lastSavedAt: state.attempt.lastSavedAt,
      accepted: responses.length,
      serverVersion: state.attempt.serverVersion,
    };
  }

  async submit() {
    await delay(300);
    const state = this.applyServerDeadline(this.load());
    if (!state) throw new Error("invalid_attempt_session");
    state.attempt.status = "submitted";
    state.attempt.submittedAt = new Date().toISOString();
    state.serverNow = new Date().toISOString();
    attachReview(state);
    this.store(state);
    return structuredClone(state);
  }

  async event() { return { ok: true }; }
}
