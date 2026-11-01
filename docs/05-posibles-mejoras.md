# 05 Posibles mejoras

Ideas valiosas que todavía no están en la app. No son un compromiso, son el mapa de hacia dónde puede crecer. Lo que ya está construido se cuenta en la [hoja de ruta](04-hoja-de-ruta.md).

## Otros módulos de salud

La visión a mediano plazo es reunir en un solo lugar lo que hoy está repartido en varias herramientas.

| Módulo | Qué incluiría | Notas |
|---|---|---|
| Peso y medidas | Registro del peso con su fecha, medidas del cuerpo, promedios por período, tendencia y gráficos | Buen primer paso de AlimentAndo |
| Composición corporal | Porcentaje de grasa y reparto del peso en masas, comparando dos fechas | Usa fórmulas conocidas que hay que validar |
| Nutrición | Calorías de mantenimiento, déficit o superávit, y reparto de proteínas, grasas e hidratos según el peso y el nivel de actividad | Varias fórmulas de metabolismo basal, que se dejan elegir y se explican |
| Comidas | Registro de lo que se come, con su aporte de calorías y macros | Necesita una base de alimentos con licencia que lo permita |
| Pasos | Pasos diarios con una meta recomendada | Leer los pasos del teléfono requiere código nativo o híbrido |

## Entrenamiento

- **Comparar ejecuciones y ver el progreso.** La ejecución 2 contra la 1, y la evolución de cada ejercicio por mesociclo y por macrociclo.
- **Plantillas de rutinas** clásicas para empezar, con la posibilidad de copiarlas y editarlas.
- **Importar una rutina** pegando una tabla, para que cargar un mesociclo largo no sea tedioso.
- **Sugerencias de peso** a partir del historial, según el tipo de progresión.
- **Avisos de récords** cuando se supera una marca anterior.
- **Descarga activa y días de prueba** como tipos especiales de ejecución.
- **Videos de los ejercicios**, solo de licencia libre o con permiso de quien los publica.
- **Dibujos propios** para los ejercicios que faltan.

## Cuenta y sincronización

Hoy no hay servidor. Si la app crece y hace falta usar el mismo plan en más de un teléfono, se puede sumar una cuenta opcional ([ADR-004](decisiones/ADR-004-uso-sin-cuenta.md)), con estas ideas ya pensadas.

- Los registros ya llevan un identificador generado en el teléfono, así que se pueden crear sin conexión y subir después sin chocar.
- Una cola de pendientes que se envía cuando hay conexión, de forma idempotente.
- Borrado lógico, para poder propagar un borrado a otros dispositivos.
- Para el plan, gana la última modificación. Las series realizadas solo se agregan.
- El método de acceso está por decidir. Las opciones son una cuenta de Google, un enlace por correo y llaves de acceso.

## Producto

- **Modo entrenador y entrenado.** Que un entrenador arme el plan de otra persona y vea su progreso. Cambia el modelo de usuarios y de permisos.
- **Compartir el progreso** de forma voluntaria.
- **Otros idiomas.** Primero inglés y portugués, si la app escala.
- **Accesibilidad.** Tamaño de texto ajustable y una revisión con lectores de pantalla.

## Técnicas

- **Empaquetar la app** para las tiendas, o hacer una versión nativa de Android, para leer los pasos del teléfono.
- **Pruebas de extremo a extremo** en un navegador real.
- **Observabilidad** del servidor, si algún día existe.
