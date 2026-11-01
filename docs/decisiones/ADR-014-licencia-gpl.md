# ADR-014 Licencia del código y del contenido

## Estado

Aceptada, 2026-11-01.

## Contexto

El proyecto no tiene fines de lucro. Se hizo para tener una app útil, para practicar el desarrollo de punta a punta y para practicar el desarrollo asistido con IA. Se quiere que cualquiera pueda usarla, estudiarla y aprender de ella. Un repositorio público sin licencia no permite nada de eso, porque por defecto todos los derechos quedan reservados. Además hay contenido de distinto origen, como el código, la documentación, los dibujos de ejercicios y el nombre con el logo, y cada uno tiene su regla.

## Decisión

| Qué | Licencia |
|---|---|
| Código de la aplicación y de la landing | **GPL 3.0 o posterior** |
| Documentación | CC BY-SA 4.0 |
| Dibujos de los ejercicios | CC BY-SA 4.0 de Everkinetic, sin cambios ([ADR-012](ADR-012-ilustraciones-de-ejercicios.md)) |
| Nombre "MejorAndo" y su logo | No están cubiertos por la licencia del código. Se pueden mencionar y enlazar, pero un derivado no puede presentarse con ese nombre ni con ese logo |

El texto de la GPL está en el archivo `LICENSE` de cada repositorio, y el campo `license` del paquete dice `GPL-3.0-or-later`.

## Alternativas

- **MIT o Apache 2.0.** Son más permisivas, y permiten que alguien tome el código, lo cierre y lo venda. Con la GPL esa persona tiene que compartir sus cambios con la misma licencia, que es lo más cercano al espíritu del proyecto.
- **AGPL.** Suma que también se comparta el código cuando se ofrece como servicio web. Como la app es un cliente que se descarga en el teléfono, la GPL ya alcanza, porque el código se distribuye a cada persona.
- **CC0 o dominio público.** Es la más abierta, pero no protege el nombre ni obliga a mantener la apertura.

## Consecuencias

- Las dependencias de producción (MIT, Apache 2.0 y la tipografía con licencia OFL) son compatibles con la GPL 3.
- Quien publique una versión modificada tiene que compartirla con la misma licencia y conservar los avisos de autoría.
- Los dibujos conservan su propia licencia, que pide citar la fuente y compartir las adaptaciones igual. Por eso la app y la landing los citan.
- El archivo `LICENSE` y los créditos tienen que acompañar a cualquier copia del proyecto.
- Si algún día se aceptan contribuciones de otras personas, entran con esta misma licencia.
