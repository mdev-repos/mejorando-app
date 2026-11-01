# ADR-018 Publicación en GitHub Pages y repositorios públicos

## Estado

Aceptada, 2026-11-01. Reemplaza la publicación de prueba de [ADR-007](ADR-007-repositorio-y-publicacion.md).

## Contexto

Mientras la app se probaba, el repositorio era privado y se publicaba en Netlify, que lee repositorios privados desde el plan gratuito. Con la beta lista, el objetivo cambió. El código es libre ([ADR-014](ADR-014-licencia-gpl.md)) y se quiere que cualquiera pueda verlo, instalarla y aprender de ella. GitHub Pages sirve repositorios públicos desde el plan gratuito, y deja la publicación en el mismo lugar que el código.

## Decisión

- **Dos repositorios públicos.** `mejorando-app` tiene la aplicación y la documentación. `mejorando-landing` tiene la página de presentación, con las preguntas frecuentes.
- **La app en una subruta.** Se publica en `mdev-repos.github.io/mejorando-app/`. La base de Vite, el enrutador, el alcance del manifiesto, el service worker y las rutas de las imágenes siguen esa base. En desarrollo la app vive en la raíz.
- **Publicación con GitHub Actions.** En cada cambio de la rama principal se corren las pruebas, se compila y se despliega. Una copia de `index.html` como `404.html` hace que abrir directamente una pantalla de la app, por ejemplo `/gym`, la cargue igual.
- **La landing sin construcción.** Es una página estática que se publica directamente desde la raíz de la rama principal, en `mdev-repos.github.io/mejorando-landing/`.
- **El historial se limpió antes de hacerlo público.** Se reescribieron los commits para sacar datos personales de versiones viejas de un documento, y los repositorios se crearon de nuevo.

## Alternativas

- **Seguir en Netlify.** Funciona, pero muestra su marca en la página, separa el código de la publicación y no suma nada.
- **Un solo repositorio con la landing en la raíz y la app en una subcarpeta.** Da direcciones más cortas, pero junta dos proyectos de ritmos distintos.
- **Un dominio propio.** Evitaría la subruta, pero cuesta y no hace falta por ahora.

## Consecuencias

- Cada dirección es un origen distinto para el navegador, así que los datos de la dirección vieja no pasan solos. Quien usó la versión de Netlify tiene que guardar una copia allá, instalar la nueva y restaurarla.
- La app instalada desde Netlify no se actualiza sola a la nueva. Hay que desinstalarla e instalar la de Pages.
- La subruta sale en cada dirección de la app y el nombre del repositorio queda fijo en la configuración. Si el repositorio cambia de nombre, hay que cambiar una sola constante en `vite.config.ts` y la dirección de la landing.
- GitHub Pages no permite elegir los encabezados de caché. El navegador igual revisa el service worker sin usar la caché, así que las actualizaciones llegan.
