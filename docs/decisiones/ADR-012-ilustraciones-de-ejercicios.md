# ADR-012 Ilustraciones de ejercicios

Estado: Aceptada

## Contexto

La app necesitaba una imagen por ejercicio para sentirse completa. Había que elegir entre dibujarlas, usar un conjunto abierto o dejar solo las iniciales del grupo muscular.

## Decisión

Se usan las ilustraciones del proyecto Everkinetic (Greg Priday), publicadas con licencia CC BY-SA 4.0. Se toma la primera pose de cada ejercicio, se centra en un cuadrado blanco de 240 px y se guarda como WebP en `web/public/exercises/<id>.webp`.

El catálogo creció de 40 a 253 ejercicios, porque se cargó todo el conjunto con ilustración para poder usarlo en cualquier mesociclo. Los 213 nuevos están en `catalogExtra.ts`, con nombre en español y el identificador de su imagen. Quedan afuera seis que no son ejercicios de pesas (cuello, tabla de equilibrio, círculos con pelota, cruz de hierro y vacío abdominal). Las imágenes pesan 1,2 MB en total y entran al precache.

Los ejercicios del catálogo inicial sin dibujo equivalente siguen mostrando las iniciales del grupo muscular, porque la imagen se carga con una alternativa. Son face pull, sentadilla búlgara, hip thrust, patada de tríceps, curl inclinado y plancha. El remo con mancuerna reutiliza el dibujo del remo para deltoides posterior con una mancuerna, que muestra el mismo movimiento apoyado en el banco.

Se probó armar la sentadilla búlgara combinando piezas de otros dibujos, pero el resultado no se lee como el ejercicio. Hace falta redibujar la pierna de atrás.

## Licencia

- Atribución. Se acredita al proyecto y al autor, con enlace al repositorio y a la licencia, en Ajustes y en el README.
- Se indica que hubo cambios de formato y tamaño. Cambiar de formato no es una adaptación del dibujo.
- Las ilustraciones conservan CC BY-SA 4.0. Si en algún momento se redibujan o se retocan, esas versiones deben publicarse con la misma licencia. El código de la app no cambia de licencia.

## Alternativas

- Dibujarlas para el proyecto, con el costo de lograr un estilo parejo.
- Otro conjunto de datos conocido, descartado porque la licencia de sus imágenes no está clara.

## Consecuencias

- La app se ve completa sin costo de dibujo.
- Las imágenes quedan en el precache de la PWA y funcionan sin conexión.
- Cuando se agreguen ejercicios nuevos, se buscan en el mismo conjunto antes de usar iniciales.
