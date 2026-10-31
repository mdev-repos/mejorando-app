# ADR-010 Planificación en cuatro niveles y descansos fijos

## Estado

Aceptada, 2026-10-31.

## Contexto

La primera versión de EntrenAndo solo tenía el nivel del día, que se llamaba "entrenamiento". El método que sigue el autor planifica con cuatro niveles, y además durante la sesión se podían acortar o alargar los descansos, lo que contradecía la idea de que la rutina manda.

## Decisión

- **Cuatro niveles.** Un macrociclo (por ejemplo "Principiante") agrupa mesociclos. Un mesociclo (por ejemplo "PPL") es una rutina con sus días, Push, Pull y Legs. Cada día se hace varias veces, y cada vez es una ejecución.
- **Una sola cantidad de ejecuciones por mesociclo.** Todos los días se hacen la misma cantidad de veces, para medir el progreso de manera pareja.
- **Rutina simple o avanzada,** que se elige al crear el mesociclo y se puede cambiar después. La simple tiene series y repeticiones, y todas las ejecuciones de un día son iguales. La avanzada suma los protocolos y permite que cada ejecución de un día tenga sus propios ejercicios. La primera ejecución es la base, y las demás la siguen hasta que se personalizan.
- **Escalonado.** Es un generador de series. Se elige la cantidad de series, las repeticiones de la primera y el cambio en cada una, que por defecto es de menos 2. Con 4 series de 10 queda 10, 8, 6 y 4.
- **Descansos fijos.** El descanso de cada ejercicio se elige al armarlo, con los tiempos habituales (0:45, 1:00, 1:30, 2:00, 2:30, 3:00) o uno propio. En la sesión se respeta tal cual, sin botones para acortarlo o alargarlo. Un modo de prueba en los ajustes, apagado por defecto, permite adelantarlo para probar la aplicación.
- **Datos anteriores.** Lo que ya estaba cargado pasa a un macrociclo y un mesociclo propios, con sus ejecuciones numeradas, y las copias de seguridad viejas se importan de la misma manera.

## Alternativas

- **Dejar el descanso ajustable durante la sesión.** Se descartó porque la rutina define lo que hay que hacer.
- **Una cantidad de ejecuciones por día.** Se descartó para poder comparar los días entre sí.
- **Guardar una rutina avanzada como una copia completa por ejecución.** Se prefirió guardar solo las ejecuciones que difieren, para que un cambio en la base se refleje en las demás.

## Consecuencias

- Se puede entrenar una sola sesión activa a la vez, y el resto de los días avisa que hay una en curso.
- Cambiar un mesociclo de avanzado a simple no borra las personalizaciones, pero deja de usarlas.
- Falta todavía el resumen de progreso por macrociclo y la comparación entre ejecuciones del mismo día.
