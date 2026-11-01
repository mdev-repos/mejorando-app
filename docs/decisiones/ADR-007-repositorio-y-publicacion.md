# ADR-007 Repositorio único y publicación de pruebas

## Estado

Aceptada, 2026-10-31. Reemplazada en la publicación por [ADR-018](ADR-018-publicacion-en-github-pages.md), que pasa a GitHub Pages con los repositorios públicos.

## Contexto

El proyecto se construye junto con un agente de IA, y el autor quiere probar la aplicación en el celular durante el desarrollo sin que sea pública todavía. GitHub Pages en un repositorio privado exige un plan de pago, y GitLab obligaba a mudar el código más adelante.

## Decisión

- **Un solo repositorio**, en GitHub, con la documentación en `docs`, el cliente en `web` y, más adelante, el servidor en su propia carpeta.
- El repositorio es **privado** mientras se prueba, y se hace público cuando haya algo sólido, después de revisar la historia de commits.
- Las pruebas en el celular se publican en **Netlify**, que lee repositorios privados desde el plan gratuito y sirve la app en la raíz del dominio, con HTTPS.
- La integración continua corre en GitHub Actions y la publicación la hace Netlify.

## Alternativas

- **GitLab privado y mudar después.** Obliga a migrar el código, los enlaces y la integración continua.
- **GitHub Pages.** Con el plan gratuito pide que el repositorio sea público.

## Consecuencias

- La dirección de Netlify es pública para quien tenga el enlace, aunque con un nombre al azar es muy difícil de encontrar.
- Cada dirección es un origen distinto para el navegador, así que los datos cargados en las pruebas no pasan solos a la dirección definitiva. Para eso existen la exportación y la importación de datos.
- Antes de hacer público el repositorio hay que revisar todo lo que alguna vez se subió.
