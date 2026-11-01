# Historia del proyecto

Cómo se llegó a la app que existe hoy. Este documento cuenta el camino, y lo que importa es el resultado, que está descrito en el resto de la documentación.

## El origen

Todo empezó con una hoja de papel. El autor bajó 20 kg en unos meses, llevó el entrenamiento a mano y la dieta en hojas de cálculo, y quiso una app que recogiera eso para que otras personas también pudieran conseguir sus objetivos. La idea era chica y útil, y se mantuvo así.

## Los nombres

El proyecto cambió de nombre tres veces, y cada cambio dejó algo.

| Nombre | Qué aportó | Por qué se dejó |
|---|---|---|
| GymApp | Un nombre de trabajo, solo para el entrenamiento | Describía un único módulo y la idea creció más allá |
| Camino+ | La idea de una suite con módulos y una historia de proceso | Un "+" suele indicar un plan pago, y el logo con una C y un "Plus" se leía como una cruz ([ADR-005](decisiones/ADR-005-nombre-y-suite.md)) |
| MejorAndo | Un nombre en gerundio que habla de un proceso, con un módulo por verbo | Es el definitivo ([ADR-008](decisiones/ADR-008-mejorando-nombre-y-logo.md)) |

## El logo

El primer logo fue una C con la palabra "Plus" adentro, y después unas huellas. Se descartó porque no gustó y se confundía con una cruz médica. El definitivo es un círculo de tres sectores, uno por módulo, con una kettlebell, un bowl y unas huellas. Las huellas sobrevivieron como la pantalla de carga, que aparecen una a una hasta el nombre.

## La estética

La primera paleta fue índigo, sobria y fría ([ADR-002](decisiones/ADR-002-identidad-visual.md)). Con la suite apareció la necesidad de un color por módulo, y se pasó a naranja, verde y azul, con un violeta propio de la suite en el "Ando" del nombre ([ADR-009](decisiones/ADR-009-estetica-y-tipografia.md)). De esa etapa se conservaron los dos temas, el gris suave del claro y que el resultado nunca dependa solo del color.

## El producto

Lo que más cambió fue la forma de planificar. La primera idea era una lista de entrenamientos. Después se entendió que el entrenamiento se organiza en cuatro niveles y que el descanso es parte de la rutina, así que se rehízo el modelo de datos con una migración que conserva lo que ya estaba cargado ([ADR-010](decisiones/ADR-010-cuatro-niveles-y-descansos-fijos.md)). Con el uso en el gimnasio llegaron los avisos del descanso y un control numérico más cómodo ([ADR-011](decisiones/ADR-011-avisos-del-descanso-y-control-numerico.md)).

## La beta

Con la app funcionando en dos teléfonos se sumó lo que hace falta para compartirla. Los dibujos de los ejercicios ([ADR-012](decisiones/ADR-012-ilustraciones-de-ejercicios.md)), compartir rutinas ([ADR-013](decisiones/ADR-013-compartir-rutinas-e-instalacion.md)), proteger los datos y poder corregirlos ([ADR-015](decisiones/ADR-015-beta-datos-copias-y-correcciones.md)), un paseo de bienvenida ([ADR-016](decisiones/ADR-016-paseo-y-recomendaciones.md)) y una licencia libre ([ADR-014](decisiones/ADR-014-licencia-gpl.md)).

## Cómo se trabajó

El proyecto se hizo en pareja con una IA. El autor decidía qué se hacía y por qué, miraba cada resultado en pantalla y corregía el rumbo, y el asistente escribía gran parte del código del frente, las pruebas y la documentación. Cada decisión importante quedó registrada con sus alternativas, y por eso este historial se puede reconstruir.
