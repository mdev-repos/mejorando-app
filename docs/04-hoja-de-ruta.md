# 04 Hoja de ruta

El orden en que se construye la aplicación. Cada fase deja algo que funciona y se puede probar, y ninguna empieza antes de que las decisiones que necesita estén tomadas.

## Fase 0, diseño

Documentación de visión, dominio y arquitectura, y las decisiones registradas. Esta carpeta es el resultado de esta fase. Termina cuando las preguntas abiertas críticas están resueltas y el primer diseño de pantallas está acordado.

## Fase 1, esqueleto que funciona de punta a punta

Una versión mínima pero completa, desplegada, antes de agregar funciones.

- Repositorio, integración continua y despliegue automático.
- Una pantalla de cliente instalable como PWA, con un cambio de versión probado.
- Una API con una entidad de ejemplo, la base de datos migrada y las pruebas corriendo.
- Uso sin cuenta desde el primer día, y cuenta opcional para sincronizar ([ADR-004](decisiones/ADR-004-uso-sin-cuenta.md)).

La idea es que cada cambio posterior ya tenga dónde apoyarse y pasar por las pruebas y la publicación.

## Fase 2, catálogo y plan

- Catálogo de ejercicios, con los propios del usuario.
- Crear y editar macrociclos, mesociclos, entrenamientos y la matriz de prescripciones.
- Todo funciona sin conexión.

## Fase 3, entrenamiento guiado y registro

- La vista de entrenamiento del día, ejercicio por ejercicio.
- Series de aproximación y efectivas, con descansos y cronómetro.
- Registro de peso y repeticiones, con JumpSets y técnicas.
- Comparación con la vez anterior en cada serie.

## Fase 4, sincronización

- Cola de pendientes, envío idempotente y descarga de cambios.
- Varios dispositivos y resolución de conflictos.
- Respaldo, exportación y borrado de la cuenta.

## Fase 5, progreso

- Vista de todas las ocurrencias de un entrenamiento una al lado de la otra.
- Evolución por ejercicio, por mesociclo y por macrociclo.

## Fase 6, landing y apertura

- Página de presentación con la reseña del proceso y las recomendaciones.
- Política de privacidad y consentimiento.
- Apertura a las primeras personas.

## Después

Los módulos de peso y medidas, nutrición, comidas y actividad, y el resto de las ideas, están en [posibles mejoras](05-posibles-mejoras.md).
