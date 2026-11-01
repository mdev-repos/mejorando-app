# ADR-004 Uso sin cuenta, con cuenta opcional para sincronizar

## Estado

Aceptada, 2026-10-31. El uso sin cuenta está en marcha. La cuenta opcional todavía no se construyó, y el método para crearla y abrirla queda pendiente.

## Contexto

La aplicación tiene que poder usarse en un gimnasio sin señal. Si abrirla exigiera iniciar sesión contra un servidor, sin internet no se podría usar. Al mismo tiempo, quien quiera respaldo en el servidor o usar dos dispositivos necesita una identidad.

## Decisión

- La aplicación **se usa sin cuenta ni inicio de sesión**. Los datos viven en el teléfono.
- Una **cuenta es opcional** y sirve solo para conectar los datos locales con el servidor, es decir para el respaldo y para usar varios dispositivos.
- Al crear la cuenta, los datos que ya estaban en el teléfono pasan a pertenecer a esa cuenta. Como todos los registros tienen un identificador generado en el dispositivo, no hay que reescribir nada.
- Si la sesión con el servidor vence o no hay conexión, la aplicación sigue funcionando con sus datos locales, y la sincronización espera.

## Alternativas

- **Inicio de sesión obligatorio.** Se descartó, porque sin conexión la aplicación no abriría.
- **Cuenta solo en línea, sin uso local.** Se descartó por el mismo motivo.

## Consecuencias

- Sin cuenta no hay respaldo, y el navegador puede borrar los datos locales, sobre todo en iPhone. La aplicación tiene que avisarlo y ofrecer la exportación.
- El servidor tiene que aceptar que una cuenta nueva reclame datos creados antes de que existiera.
- El método de autenticación se decide aparte, y tiene que respetar todo lo anterior.
