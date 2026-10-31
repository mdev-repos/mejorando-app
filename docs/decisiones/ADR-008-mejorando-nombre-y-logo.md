# ADR-008 MejorAndo, nombre de la suite y logo de tres sectores

## Estado

Aceptada, 2026-10-31. Reemplaza a [ADR-005](ADR-005-nombre-y-suite.md) y a la parte del logo de [ADR-006](ADR-006-logo-y-pantalla-de-carga.md). Falta la revisión de marca antes de abrir la app al público.

## Contexto

Camino+ no terminó de convencer, ni como nombre ni como imagen. La app no tiene objetivo comercial, así que hay más libertad para elegir. El nombre tenía que transmitir la idea de mejorar, sonar argentino y funcionar para una suite con varios módulos. Además, la forma del logo tenía que contar que son varias herramientas en una.

## Decisión

- La suite se llama **MejorAndo**. Dice "estoy mejorando" y, por el "ando" de *andar*, también "voy caminando", lo que conecta con las huellas.
- Los módulos usan gerundios, con la misma voz.
- **El nombre en dos colores**, como NodoBank. "Mejor" va con el color del texto y "Ando" con un color propio de la suite, un cuarto color que no es de ningún módulo, el violeta. Dentro de cada módulo, "Ando" toma el color del módulo.

| Módulo | Qué hace | Estado |
|---|---|---|
| EntrenAndo | Entrenamiento de fuerza | Primer módulo |
| AlimentAndo | Conteo de calorías, peso y medidas, con cálculos de composición corporal | Más adelante |
| CaminAndo | Pasos y actividad, con datos de la app de salud o carga manual | Más adelante |

- **Logo de la suite.** Un círculo dividido en tres sectores que comparten sus bordes, uno por módulo. Cada sector lleva el color y el ícono de su módulo: naranja con una kettlebell con una A sin travesaño, verde con un bowl de ensalada y un tenedor, y azul con las huellas. El bowl y el tenedor quedan dentro del círculo.
- **Íconos de módulo.** Cada módulo usa su sector como ícono propio, en un cuadrado redondeado con su color, junto al nombre de su sección.
- **Íconos de instalación y tamaños chicos.** El logo completo hasta unos 40 px. Más chico, solo se lee el círculo de tres colores.
- La pantalla de carga con huellas que avanzan se mantiene ([ADR-006](ADR-006-logo-y-pantalla-de-carga.md)), y su texto final pasa a ser el nombre nuevo, en una versión que falta diseñar.
- Los archivos están en `docs/diseno/logo/exploracion`.

## Alternativas

- **Camino+.** Era la decisión anterior. No convenció.
- **Grow, Better, Healthy.** Hay apps muy conocidas con esos nombres en la misma categoría.
- **Prime.** Tiene el chiste local, pero lo usan Amazon y una marca de bebidas.
- **Mejor Vos y Tu Versión.** Buenas opciones, con dominios libres, pero MejorAndo tiene el doble sentido con *andar*.

## Consecuencias

- La app y la documentación todavía dicen Camino+ y Gym+ en varios lugares, y hay que cambiarlos.
- "Mejorando" es una palabra común, así que cuesta encontrarla en un buscador. Con `mejorando.app` y `mejorando.fit` libres, y `mejorando.com`, `mejorando.com.ar` y `mejorando.la` ocupados.
- Antes de abrir la app al público hay que revisar el nombre en el registro de marcas y en las tiendas de aplicaciones.
- El repositorio se llama `app_camino_plus__proyecto_personal`. Se puede renombrar en GitHub, que redirige el enlace viejo.
