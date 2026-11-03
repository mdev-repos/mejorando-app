# ADR-019 Editar ejercicios, deshacer series, falla de técnica, pausas y novedades

## Estado

Aceptada, 2026-11-02. Parte de las primeras pruebas reales de la beta, entrenando con la app.

## Contexto

Al usar la app en un entrenamiento de verdad aparecieron cuatro necesidades. Un ejercicio cargado en un día no se podía cambiar, había que borrarlo y armarlo de nuevo. Tocar "Serie hecha" por error no tenía vuelta atrás. No había forma de anotar las repeticiones que se hacen cuando la técnica ya falla, como las 3 que no llegan a tocar el pecho después de 8 buenas en un jalón. Y cuando salía una versión nueva, la app solo avisaba que existía, sin decir qué traía. Después, Martín, probando la app, descubrió un error. Al salir de un entrenamiento sin terminarlo y querer empezar otro, la app lo mandaba de vuelta al anterior sin explicar nada. Además, los pesos con decimales, como 102,5, quedaban tapados por los botones en pantallas chicas.

## Decisión

- **Editar un ejercicio ya cargado.** Cada ejercicio de un día tiene un botón de edición que abre el mismo formulario con que se agrega, con sus valores. Al guardar se reemplaza en su lugar y conserva su identificador. Se puede cambiar el ejercicio, las series, las repeticiones y los descansos. Cambiar de tipo (por ejemplo de normal a JumpSet) sigue pidiendo borrar y agregar de nuevo.
- **Repeticiones con falla de técnica.** Una serie guarda las repeticiones buenas y, aparte, las de falla de técnica (`techReps`). Se muestra como `8 + 3`. La comparación con la vez anterior usa solo las buenas, porque las otras no miden fuerza de la misma forma y mezclarlas haría "mejorar" a quien empeora su técnica. No aplica a las series de aproximación ni a los ejercicios por tiempo. No cambió la estructura de la base, es un campo opcional y las copias viejas siguen valiendo.
- **Deshacer un paso.** Deshacer borra lo que guardó el último paso, vuelve al paso anterior, cancela el descanso y deja los valores cargados en la sesión (`redo`), para que el formulario aparezca con ellos y solo haya que corregir lo que estaba mal. Se puede repetir para ir más atrás. En un entrenamiento terminado, "Reabrir la última serie" hace lo mismo, y si se había cortado antes de tiempo, "Seguir entrenando" lo retoma donde estaba. Solo se puede reabrir si no hay otro entrenamiento en curso, porque la app admite uno a la vez.
- **Pausar un entrenamiento.** Una sesión tiene un tercer estado, en pausa, además de en curso y terminada. Pausar guarda todo lo anotado y el paso en que se estaba, y descarta el descanso en marcha porque su hora ya habría pasado. Al querer empezar otro entrenamiento con uno en curso, la app pregunta qué hacer con ese. Se puede pausar, o terminar con lo anotado, o cancelar. También se puede pausar desde la lista del entrenamiento. Retomar uno en pausa deja en pausa al que estuviera en curso, así nunca hay dos en curso. En las pantallas de inicio aparece una tarjeta por cada entrenamiento empezado, en curso o en pausa.
- **Números largos.** El control numérico achica la letra cuando el valor tiene cinco caracteres o más y esconde el lápiz de ayuda. Peso y repeticiones se reparten el ancho en proporción, y en pantallas de 350 píxeles o menos van uno debajo del otro.
- **Versiones y novedades.** La lista de cambios vive en un solo archivo, `web/public/novedades.json`, con el número de versión, la fecha y los cambios de cada versión. La app lo usa de tres maneras. Al detectar una versión nueva, antes de actualizar, pide la copia de la red (con un parámetro que evita el caché del service worker) y muestra "Qué trae". Después de actualizar, muestra una sola vez qué cambió, salvo en una instalación nueva, donde ya está el paseo. Y en Ajustes hay una pantalla con todo el historial, que funciona sin conexión porque el archivo se guarda con la app.

## Alternativas

- **Que el formulario de edición permita cambiar de tipo.** Obliga a convertir entre protocolos y hay datos que no tienen equivalente, como las rondas de un JumpSet. Borrar y agregar es poco frecuente y más claro.
- **Sumar las repeticiones de falla de técnica al total.** Simplifica el modelo, pero falsea la comparación, que es el corazón de la app.
- **Permitir dos entrenamientos en curso.** Resolvería el error sin preguntar, pero obliga a decidir cuál se muestra, cuál cuenta para la ejecución y cómo se sigue el descanso de cada uno. Con una pausa explícita queda claro.
- **Una lista de cambios dentro del código.** Evita una petición, pero la versión instalada no conoce las novedades de la que viene, así que no podría contarlas antes de actualizar.
- **Generar las novedades desde los mensajes de commit.** Los mensajes están escritos para quien programa, y las novedades para quien entrena.

## Consecuencias

- Cada versión nueva obliga a agregar una entrada al archivo de novedades y a subir el número de `package.json`. Es una tarea manual y corta, a cambio de textos pensados para quien usa la app.
- Sin conexión, el aviso de actualización aparece sin detalle, con el texto de siempre.
- Las repeticiones con falla de técnica no entran en los resúmenes de progreso futuros, salvo que se decida lo contrario.
