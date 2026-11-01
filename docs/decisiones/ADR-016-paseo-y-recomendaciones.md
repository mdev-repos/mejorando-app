# ADR-016 Paseo de bienvenida, ayuda y recomendaciones de salud

## Estado

Aceptada, 2026-11-01.

## Contexto

Quien abre la app por primera vez ve una pantalla vacía y no sabe que el plan tiene cuatro niveles. Además la app trata un tema sensible. Una persona que empieza a entrenar o a cambiar su alimentación tiene que saber que la app no reemplaza a un profesional.

## Decisión

- **Paseo de bienvenida.** Seis pasos cortos que se muestran la primera vez, después de la pantalla de carga. Explican qué es la app, los cuatro niveles, cómo armar una rutina, cómo entrenar y comparar, cómo cuidar los datos y qué hacer antes de empezar. Se puede saltar y se puede repetir desde Ajustes.
- **Recomendaciones.** Primero se recomienda consultar con un médico. Para entrenar, con un deportólogo, y como referencia el canal de Roberto Amorosi y la Escuela de Culturismo Natural con su academia. Para comer, con un nutricionista, y como referencia el canal de Francis Holway y las entrevistas que le hicieron en otros canales. Aparecen en el último paso del paseo, en Ajustes y en las preguntas frecuentes.
- **Ayuda fuera de la app.** Las preguntas frecuentes viven en la landing, para no cargar la app con texto y poder actualizarlas sin publicar una versión nueva.
- **Comentarios.** Un formulario externo, enlazado desde Ajustes y la landing, sin que la app envíe nada de lo que la persona guardó.

## Alternativas

- **Ayuda dentro de la app.** Es más cómoda sin conexión, pero ocupa espacio y se desactualiza con cada versión.
- **Resaltar los elementos de la pantalla en el paseo.** Es más vistoso, pero se rompe cuando cambia la interfaz.
- **Un correo para comentarios.** Expone la dirección y obliga a una persona a abrir su correo.

## Consecuencias

- Las referencias son una sugerencia y no un respaldo. La app no incluye material de esas personas.
- Si un canal cambia de dirección, hay que actualizar un solo archivo, `app/links.ts`.
- La landing es parte de la ayuda, así que tiene que mantenerse al día.
