# ADR-015 Beta, datos protegidos, copias y correcciones

## Estado

Aceptada, 2026-11-01.

## Contexto

Antes de dejar que otras personas usen la app, hacían falta tres cosas. Los datos viven solo en el teléfono, y el navegador puede borrarlos si le falta espacio. Con el tiempo, una persona acumula entrenamientos que no quiere perder. Y hasta ahora no había forma de arreglar una serie cargada con un error, ni de borrar un entrenamiento hecho por equivocación.

## Decisión

- **Almacenamiento persistente.** Al abrir, la app le pide al navegador no borrar sus datos. Ajustes muestra si lo concedió.
- **Recordatorio de copia.** Si hay entrenamientos y pasaron más de 14 días desde la última copia, o nunca se guardó una, aparece una tarjeta que lleva a Ajustes. Se puede posponer por 3 días. Ajustes muestra la fecha de la última copia.
- **Corregir y borrar.** En el resumen de un entrenamiento terminado, cada serie se puede corregir (peso y repeticiones) o borrar, y se puede borrar el entrenamiento entero. Al borrar se pide un segundo toque de confirmación.
- **Versión beta visible.** Ajustes muestra "Beta" con el número de versión que sale del paquete. Una tarjeta "Acerca de" cuenta los límites conocidos, entre ellos que se probó en Android y no en iPhone, que el sonido con la pantalla bloqueada puede fallar, y que no hay cuentas ni sincronización.

## Alternativas

- **Pedir una copia automática en un servidor.** Obliga a tener cuentas y un servidor, que contradice el uso sin cuenta ([ADR-004](ADR-004-uso-sin-cuenta.md)).
- **Un deshacer en lugar de una confirmación.** Es más cómodo, pero más complejo, y la corrección ya cubre el caso.
- **No avisar nada.** Se descartó porque perder el historial de meses es el peor error posible en esta app.

## Consecuencias

- El permiso lo decide el navegador, y puede no concederse. Por eso la copia sigue siendo el respaldo real.
- Borrar una sesión baja el conteo de ejecuciones hechas del día.
- Se suma superficie para probar, y se cubrió con pruebas de las consultas y de la regla del recordatorio.
