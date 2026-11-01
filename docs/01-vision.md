# 01 Visión

## Qué es

MejorAndo es una suite de herramientas para mejorar la salud, que se instala en el celular y funciona sin conexión. Cada herramienta es un módulo que la persona activa o no. El primero es **EntrenAndo**, que reemplaza el papel y el bolígrafo en el entrenamiento de fuerza. Permite planificar un ciclo completo, entrenar la rutina del día con una vista pensada para el gimnasio, y comparar cada serie con la vez anterior para saber si se está progresando.

## Los módulos

| Módulo | Qué hace | Estado |
|---|---|---|
| EntrenAndo | Entrenamiento de fuerza, con planificación, sesión guiada y comparación | Disponible, en beta |
| AlimentAndo | Calorías, peso y medidas, con cálculos como porcentaje de grasa, rango de peso ideal y calorías de mantenimiento | Más adelante |
| CaminAndo | Pasos diarios, con una cantidad recomendada y estadísticas | Más adelante |

Los nombres están registrados en [ADR-008](decisiones/ADR-008-mejorando-nombre-y-logo.md).

## Por qué existe

La app nace de una experiencia personal. Su autor bajó 20 kg en unos meses, estudiando por su cuenta sobre entrenamiento y salud. Llevó todo "a mano", el progreso en el gimnasio con papel y bolígrafo, y la organización de la dieta en hojas de cálculo. Esa forma de anotar fue lo que más le ayudó a mejorar su manera de trabajar.

MejorAndo recoge lo que se hacía en papel y en planillas, para que otras personas también puedan conseguir sus objetivos. Es una app chica, con pocas funciones, y las que tiene tienen que servir entre una serie y otra, siendo una ayuda y no una molestia.

## Para qué se hizo

El proyecto tiene tres propósitos, en este orden.

1. Tener una app útil, para su autor y para quien quiera usarla.
2. Practicar el desarrollo de una aplicación de punta a punta, con diseño, arquitectura, interfaz, pruebas y publicación.
3. Practicar el desarrollo asistido con IA. Se construyó junto con Claude, el asistente de Anthropic. El autor decide qué se hace y por qué, el asistente escribe buena parte del código del frente, y cada decisión queda escrita en esta carpeta.

No tiene fines de lucro. Es gratis, no pide registro, no muestra anuncios y su código es libre ([ADR-014](decisiones/ADR-014-licencia-gpl.md)).

## Para quién es

Para cualquier persona que entrene con una planificación y quiera medir su progreso con claridad, desde quien empieza hasta quien ya sigue una rutina por ciclos. Cada instalación pertenece a una sola persona. No hay un modo entrenador que arme el plan de otra.

## Cómo se planifica

El entrenamiento se organiza en cuatro niveles. Un macrociclo agrupa mesociclos, cada mesociclo es una rutina con sus días, y cada día se hace varias veces, que son las ejecuciones. Es una forma general de planificar el entrenamiento por ciclos. La app no incluye rutinas ni material de ningún entrenador, y ofrece como referencia a [Roberto Amorosi y la Escuela de Culturismo Natural](https://www.youtube.com/@EscuelaCulturismoNatural) para entrenar y a [Francis Holway](https://www.youtube.com/@fholway) para comer. Las referencias se muestran siempre después de recomendar la consulta con un médico.

## Qué incluye la beta

- **Planificación.** Macrociclos, mesociclos simples y avanzados, días y ejecuciones, con protocolos (JumpSet, rest pause y escalonado).
- **Entrenamiento del día.** Una vista que guía de ejercicio en ejercicio, con series de aproximación, descansos fijos que avisan con color, sonido y vibración, y la comparación de cada serie con la anterior.
- **Catálogo.** 253 ejercicios por grupo muscular, casi todos con dibujo, y ejercicios propios.
- **Datos.** Viven en el teléfono. Se pueden guardar y restaurar en una copia, y se avisa cuando conviene hacerla.
- **Corrección.** Se puede corregir o borrar una serie y borrar un entrenamiento.
- **Compartir.** Una rutina se pasa a otra persona por archivo o como texto, sin el historial.
- **Ayuda.** Un paseo de bienvenida, preguntas frecuentes y un formulario de comentarios.

Lo que todavía no está lo cuenta la [hoja de ruta](04-hoja-de-ruta.md).

## Principios

1. **Funciona sin conexión.** Todo lo esencial anda en un gimnasio sin señal.
2. **Los datos son de la persona.** Viven en su teléfono, se exportan y se pueden borrar.
3. **Sin contenido de terceros con derechos.** Ni rutinas, ni imágenes, ni videos sin permiso o licencia libre.
4. **La app acompaña y no receta.** Cualquier recomendación de salud empieza por la consulta con profesionales.
5. **Se usa con una mano,** entre series, con el teléfono a veces con las manos mojadas o cansadas.
6. **Buenas prácticas desde el primer día,** con pruebas automáticas, integración continua y decisiones registradas.
7. **Chica y útil.** Se prefiere hacer pocas cosas bien antes que muchas a medias.
