# ADR-017 Herramientas de desarrollo fuera de la versión publicada

## Estado

Aceptada, 2026-11-01.

## Contexto

Para probar la app sin esperar los descansos existe un modo de prueba, que permite adelantarlos o alargarlos. En la versión que usa la gente eso no tiene que estar, porque el descanso lo define la rutina ([ADR-010](ADR-010-cuatro-niveles-y-descansos-fijos.md)). Hasta ahora el modo de prueba se podía encender desde Ajustes en cualquier instalación.

## Decisión

- Las herramientas de desarrollo existen solo al correr la app en desarrollo o en una compilación hecha a propósito con la variable `VITE_DEV_TOOLS=true`.
- En la versión publicada no se ven en Ajustes, y aunque una preferencia guardada diga que están encendidas, no se aplican. El código no entra en el archivo compilado.
- Se decidió un interruptor en lugar de una rama de desarrollo, porque es más simple y no hay que sostener dos versiones del código.

## Alternativas

- **Una rama `dev` con las herramientas.** Obliga a mantener dos ramas al día y a resolver conflictos cada vez.
- **Dejar el modo de prueba en Ajustes.** Se descartó porque contradice la regla del descanso fijo.

## Consecuencias

- Una herramienta nueva de desarrollo se cuelga de la misma bandera, `DEV_TOOLS`.
- Para probar una versión publicada con las herramientas, se compila con la variable encendida.
- Una rama de desarrollo sigue siendo posible para trabajo a medias, pero no hace falta para esto.
