# 04 Hoja de ruta

El orden en que se construyó y se construye la aplicación. Cada etapa deja algo que funciona y se puede probar.

## Hecho

### Esqueleto que funciona de punta a punta

- Repositorio, integración continua y publicación automática.
- Una aplicación instalable como PWA, con aviso de versión nueva.
- Uso sin cuenta desde el primer día ([ADR-004](decisiones/ADR-004-uso-sin-cuenta.md)).

### Catálogo y plan

- Catálogo de ejercicios por grupo muscular, con ejercicios propios y dibujos ([ADR-012](decisiones/ADR-012-ilustraciones-de-ejercicios.md)).
- Macrociclos, mesociclos simples y avanzados, días y ejecuciones ([ADR-010](decisiones/ADR-010-cuatro-niveles-y-descansos-fijos.md)).
- Protocolos JumpSet, rest pause y escalonado.
- Todo funciona sin conexión.

### Entrenamiento guiado y registro

- La vista del día, ejercicio por ejercicio, con series de aproximación y efectivas.
- Descansos fijos que avisan con color, sonido y vibración ([ADR-011](decisiones/ADR-011-avisos-del-descanso-y-control-numerico.md)).
- Comparación de cada serie con la vez anterior.
- Control numérico pensado para el gimnasio, con toques sostenidos y atajos de peso.

### Beta

- Instalación desde un botón propio y compartir rutinas ([ADR-013](decisiones/ADR-013-compartir-rutinas-e-instalacion.md)).
- Datos protegidos, recordatorio de copia y corrección de lo cargado ([ADR-015](decisiones/ADR-015-beta-datos-copias-y-correcciones.md)).
- Paseo de bienvenida, recomendaciones y preguntas frecuentes ([ADR-016](decisiones/ADR-016-paseo-y-recomendaciones.md)).
- Licencia libre ([ADR-014](decisiones/ADR-014-licencia-gpl.md)) y herramientas de desarrollo fuera de la versión publicada ([ADR-017](decisiones/ADR-017-herramientas-de-desarrollo.md)).
- Una landing con la historia, las capturas y las preguntas frecuentes, y los dos repositorios públicos.

## En curso

- **Publicación definitiva** en GitHub Pages, con los dos repositorios públicos y la landing enlazada a la app ([ADR-018](decisiones/ADR-018-publicacion-en-github-pages.md)).
- **Plantillas de rutinas** clásicas para empezar, revisadas antes de incluirlas ([borrador](plantillas-borrador.md)).

## Próximo

- **Comparar ejecuciones** del mismo día, una al lado de la otra, y ver la evolución de cada ejercicio con el tiempo.
- Los siete ejercicios del catálogo que todavía no tienen dibujo.
- Probar la aplicación en iPhone.

## Después

- **AlimentAndo**, con calorías, peso y medidas.
- **CaminAndo**, con los pasos diarios.
- Una cuenta opcional para sincronizar entre teléfonos.
- Otros idiomas, si la app crece.

Las ideas que quedan fuera de este orden están en [05 Posibles mejoras](05-posibles-mejoras.md).
