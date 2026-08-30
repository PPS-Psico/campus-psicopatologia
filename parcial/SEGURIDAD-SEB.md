# Control automático de Safe Exam Browser

Para el estudiante el flujo sigue teniendo un solo paso: abre desde el Campus el archivo `.seb`. La aplicación realiza las verificaciones sin pedir códigos ni configuraciones adicionales.

## Qué controla el sistema

1. La pantalla bloquea navegadores comunes antes de mostrar preguntas.
2. La API valida la Config Key del archivo `.seb` y la Browser Exam Key de la aplicación SEB autorizada.
3. La prueba se repite al iniciar, recuperar, guardar y entregar el intento.
4. El modo de producción falla de forma cerrada si la clave segura no fue configurada.
5. El modo de desarrollo local puede abrirse sin SEB únicamente agregando `?dev=1`; esa excepción no funciona en la URL pública.

La detección visual usa la API JavaScript de SEB y, por compatibilidad, su identificador de navegador. La autorización real se decide en el servidor mediante ambas claves; cambiar sólo el nombre del navegador no alcanza para acceder.

## Configuración docente, una sola vez

1. Abrir SEB Config Tool y crear una configuración para iniciar un examen.
2. Definir como URL de inicio `https://campus.uflo.edu.ar/course/view.php?id=12209`. El estudiante inicia sesión y entra a la sección Parcial dentro del mismo navegador seguro.
3. Activar **Use Browser & Config Keys** y, para versiones actuales, seleccionar el motor moderno compatible con la API JavaScript de SEB.
4. Guardar el archivo `.seb` definitivo. No modificarlo después de copiar la clave.
5. Copiar la **Config Key** de 64 caracteres y las **Browser Exam Keys** de las versiones de Windows, macOS y iOS que se admitirán. La Config Key es común; la Browser Exam Key cambia según la plataforma y la versión.
6. Configurar los secretos de la función:

   ```powershell
   supabase secrets set EXAM_APP_ORIGIN=https://pps-psico.github.io
   supabase secrets set SEB_REQUIRED=true
   supabase secrets set SEB_EXAM_URL=https://pps-psico.github.io/campus-psicopatologia/parcial/index.html
   supabase secrets set SEB_CONFIG_KEY=PEGAR_AQUI_LA_CONFIG_KEY
   supabase secrets set SEB_BROWSER_EXAM_KEYS=CLAVE_WINDOWS,CLAVE_MACOS,CLAVE_IOS
   ```

7. Desplegar la versión actualizada de `exam-api` y publicar el archivo `.seb` en la sección Parcial del Campus. Si más adelante sólo cambia un secreto, Supabase lo aplica sin volver a desplegar la función.
8. Antes de habilitar el parcial real, comprobar dos casos: Chrome debe mostrar el bloqueo y el archivo `.seb` debe permitir entrar, guardar, recargar y entregar.

La API y la base se ejecutan en el proyecto gratuito de Supabase `zprvefdhcxnivdgsbpkw`; no hace falta desplegar un servidor VPS para este flujo.

## Verificación previa de identidad

Durante el simulacro técnico se habilita temporalmente `identity_linking_enabled` para asociar cada fila del padrón con la cuenta Moodle que informó el Campus. Esa asociación ocurre en segundo plano y no pide otro dato al estudiante. En el parcial real la opción debe permanecer desactivada: sólo ingresan combinaciones de DNI, nombre y cuenta Moodle que ya quedaron verificadas.

Las claves originales son datos de configuración del servidor: no deben escribirse en `config.js`, HTML ni JavaScript público.
