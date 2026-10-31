# 05 Posibles mejoras

Ideas valiosas que quedan fuera del primer núcleo. No son un compromiso, son el mapa de hacia dónde puede crecer la aplicación.

## Módulos de seguimiento de salud

La visión a mediano plazo es reunir en un solo lugar lo que hoy está repartido en varias herramientas, con medidores para que cada persona vea su progreso en todas las áreas.

| Módulo | Qué incluiría | Notas |
|---|---|---|
| Peso y medidas | Registro del peso con su fecha, medidas del cuerpo (cintura, cadera, pecho, muslo, brazo, cuello), promedios por período, tendencia y gráficos | Es un buen primer módulo después del núcleo |
| Composición corporal | Porcentaje de grasa y reparto del peso en masas (ósea, muscular, residual, adiposa), comparando dos fechas | Usa fórmulas conocidas que hay que validar |
| Nutrición | Cálculo de calorías de mantenimiento, déficit o superávit, y reparto de proteínas, grasas e hidratos según el peso y el nivel de actividad | Varias fórmulas de metabolismo basal, que se dejan elegir y se explican |
| Comidas | Registro de lo que se come, con su aporte de calorías y macros | Necesita una base de datos de alimentos, con licencia que lo permita |
| Actividad | Pasos diarios y actividad | Requiere Health Connect, es decir código nativo o híbrido |

## Mejoras de la experiencia de entrenamiento

- **Importar una rutina** desde un archivo o pegando una tabla, para que cargar un mesociclo largo no sea tedioso.
- **Sugerencias automáticas de peso** a partir del historial, según el tipo de progresión.
- **Avisos de récords** cuando se supera una marca anterior.
- **Notificaciones enviadas desde el servidor** para recordar el entrenamiento del día.
- **Videos de los ejercicios,** empezando solo por los de licencia libre. En el futuro, y si la aplicación tiene uso, se podría pedir permiso a creadores que ya publican este tipo de contenido.
- **Imágenes propias** de los ejercicios, generadas para el proyecto si no hay imágenes libres suficientes.

## Mejoras de producto

- **Modo entrenador y entrenado.** Que un entrenador arme el plan de otra persona y vea su progreso. Cambia el modelo de usuarios y de permisos, y por eso se deja para una etapa posterior.
- **Compartir el progreso** de forma voluntaria.
- **Modo claro y oscuro,** con ajustes de accesibilidad.
- **Otros idiomas.**

## Mejoras técnicas

- **Empaquetar la app para las tiendas** o hacer una versión nativa de Android, para integrar Health Connect.
- **Observabilidad** del servidor, con métricas y trazas.
- **Pruebas de carga** de la sincronización.
