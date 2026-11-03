# Registro de decisiones

Cada decisión importante se escribe en un archivo corto, con su contexto, la decisión, las alternativas que se descartaron y las consecuencias. Así se puede entender en el futuro por qué se hizo algo así.

## Formato

Cada archivo se llama `ADR-NNN-titulo-corto.md` y tiene estas secciones.

1. **Estado**, que puede ser propuesta, aceptada, aceptada en parte o reemplazada.
2. **Contexto**, la situación y las fuerzas que mandan.
3. **Decisión**, qué se decidió.
4. **Alternativas**, qué se evaluó y por qué no.
5. **Consecuencias**, lo que se gana y lo que hay que cuidar.

## Índice

| Número | Decisión | Estado |
|---|---|---|
| [ADR-001](ADR-001-plataforma-pwa-offline-first.md) | Plataforma, PWA con enfoque offline-first | Aceptada |
| [ADR-002](ADR-002-identidad-visual.md) | Identidad visual, paleta índigo con tema claro y oscuro | Aceptada en parte |
| [ADR-003](ADR-003-stack-del-cliente.md) | Stack del cliente, React, TypeScript, Vite, Workbox y Dexie | Aceptada |
| [ADR-004](ADR-004-uso-sin-cuenta.md) | Uso sin cuenta, con cuenta opcional para sincronizar | Aceptada, la cuenta no está construida |
| [ADR-005](ADR-005-nombre-y-suite.md) | Nombre y estructura de suite, Camino+ con módulos | Reemplazada por ADR-008 |
| [ADR-006](ADR-006-logo-y-pantalla-de-carga.md) | Logo y pantalla de carga | Aceptada en parte |
| [ADR-007](ADR-007-repositorio-y-publicacion.md) | Repositorio único y publicación de pruebas | Reemplazada por ADR-018 |
| [ADR-008](ADR-008-mejorando-nombre-y-logo.md) | MejorAndo, nombre de la suite y logo de tres sectores | Aceptada |
| [ADR-009](ADR-009-estetica-y-tipografia.md) | Estética de MejorAndo, un color por módulo y Figtree | Aceptada |
| [ADR-010](ADR-010-cuatro-niveles-y-descansos-fijos.md) | Planificación en cuatro niveles y descansos fijos | Aceptada |
| [ADR-011](ADR-011-avisos-del-descanso-y-control-numerico.md) | Avisos del descanso y control numérico | Aceptada |
| [ADR-012](ADR-012-ilustraciones-de-ejercicios.md) | Ilustraciones de ejercicios con licencia CC BY-SA | Aceptada |
| [ADR-013](ADR-013-compartir-rutinas-e-instalacion.md) | Compartir rutinas por archivo y botón de instalar | Aceptada |
| [ADR-014](ADR-014-licencia-gpl.md) | Licencia del código y del contenido | Aceptada |
| [ADR-015](ADR-015-beta-datos-copias-y-correcciones.md) | Beta, datos protegidos, copias y correcciones | Aceptada |
| [ADR-016](ADR-016-paseo-y-recomendaciones.md) | Paseo de bienvenida, ayuda y recomendaciones de salud | Aceptada |
| [ADR-017](ADR-017-herramientas-de-desarrollo.md) | Herramientas de desarrollo fuera de la versión publicada | Aceptada |
| [ADR-018](ADR-018-publicacion-en-github-pages.md) | Publicación en GitHub Pages y repositorios públicos | Aceptada |
| [ADR-019](ADR-019-correcciones-en-el-entrenamiento-y-novedades.md) | Editar ejercicios, deshacer series, repeticiones con falla de técnica y novedades | Aceptada |
