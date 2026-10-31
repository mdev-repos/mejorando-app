# ADR-011 Avisos del descanso y control numérico

## Estado

Aceptada, 2026-10-31.

## Contexto

Durante un entrenamiento se mira poco el teléfono, y los números de peso se cambian muchas veces, con las manos cansadas. Hacía falta avisar bien cuándo termina el descanso y que cargar el peso fuera rápido, con la coma decimal que se usa en Argentina.

## Decisión

- **Aviso del descanso por tres vías.** El color y el texto, que cambian a los 15 segundos, a los 10 y al llegar a cero. Un sonido, con un tic en los últimos tres segundos y un aviso al terminar. Y la vibración, en los teléfonos que la permiten. El color y el texto no dependen del sonido, porque este puede fallar.
- **Los sonidos son parte de la aplicación,** generados en el momento, sin archivos de audio. Se destraban con el primer toque, como exigen los navegadores. Con la pantalla bloqueada no suenan de manera confiable, así que la sesión mantiene la pantalla encendida.
- **Sonido y vibración se apagan por separado,** y hay un botón para probar el aviso.
- **Los números se muestran y se leen con coma decimal,** y se aceptan con coma o con punto.
- **Entrada por teclado visible.** El número del control es un campo, con un lápiz que lo indica.
- **Los botones repiten al mantenerlos apretados** y aceleran de a poco.
- **Cambios rápidos de peso** de menos 10, menos 5, más 5 y más 10 kilos, en las series efectivas.
- **El peso que sube cada toque se elige por ejercicio** entre 1, 2, 2,5, 5 y 10 kilos, y se recuerda. Por defecto depende del equipamiento, 2,5 con barra, 2 con mancuernas, 5 en máquina o polea y 1 con el peso corporal.

## Alternativas

- **Solo sonidos.** Se descartó porque un teléfono en silencio o bloqueado no los reproduce.
- **Notificaciones con la pantalla apagada.** Una aplicación web instalada solo puede darlas con un servidor que las envíe, y no se justifica ahora.
- **Un paso de peso único.** Se descartó, porque la barra, las mancuernas y las máquinas suben distinto.

## Consecuencias

- El paso de peso se guarda en la base de datos y viaja en las copias de seguridad.
- En iPhone no hay vibración, y el sonido depende del interruptor de silencio del teléfono.
- Los colores del descanso reemplazan por un momento al color del módulo, que vuelve en cuanto empieza la serie siguiente.
