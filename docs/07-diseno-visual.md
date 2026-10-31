# 07 Diseño visual

Cómo se ve y cómo se usa la aplicación en el gimnasio. El boceto interactivo está en [diseno/prototipo-pantallas.html](diseno/prototipo-pantallas.html), se abre en cualquier navegador y permite cambiar entre tema oscuro y claro, entre las dos paletas, y probar las pantallas.

## Principios para usarla entrenando

- **Una mano y el pulgar.** Lo que se toca durante la serie está en la parte de abajo de la pantalla. El botón principal ocupa todo el ancho y mide 60 px de alto, y los controles de peso y repeticiones miden al menos 52 px.
- **Una cosa por pantalla.** Durante una serie se ve un solo ejercicio, con lo que se hizo la vez anterior a la vista.
- **Se lee de lejos y con las manos transpiradas.** Los números principales son grandes y en negrita, con cifras de ancho fijo para que no salten.
- **El color nunca está solo.** Mejoró (▲), igual (=) y por debajo (▼) llevan símbolo y texto además de color.
- **Pocas pantallas,** y todas alcanzables con un toque desde la sesión en curso.

## Temas

La aplicación tiene tema oscuro y tema claro, y por defecto sigue el del teléfono, con una opción para cambiarlo a mano.

El tema claro no usa blanco puro. El fondo es un gris suave, las tarjetas son apenas más claras que el fondo y el texto es un gris casi negro en lugar de negro. En el tema oscuro el fondo tampoco es negro puro, para que el contraste no canse. En los dos casos el color principal cambia de tono para mantener buena legibilidad sobre cada fondo.

## Paletas

| | Opción A, Índigo | Opción B, Ámbar |
|---|---|---|
| Carácter | Frío, sobrio, tecnológico | Cálido, enérgico, de gimnasio |
| Principal (oscuro) | `#8A97FF` | `#F5A524` |
| Principal (claro) | `#4A5AD0` | `#B86A00` |
| Fondo (oscuro / claro) | `#0E1117` / `#E8EBF1` | `#12100D` / `#EAE6DD` |
| Tarjeta (oscuro / claro) | `#161A23` / `#F5F6F9` | `#1B1814` / `#F6F3EC` |
| Texto (oscuro / claro) | `#E8EBF2` / `#1B1F2B` | `#EFEAE0` / `#241F16` |

Colores de resultado, iguales en las dos paletas.

| Resultado | Oscuro | Claro |
|---|---|---|
| Mejoró | `#43D69A` | `#17794F` |
| Igual | gris del texto secundario | gris del texto secundario |
| Por debajo | `#FF7A7A` | `#B83232` |

La paleta elegida es la **opción A, índigo**, registrada en [ADR-002](decisiones/ADR-002-identidad-visual.md). El ámbar queda en el boceto solo como referencia.

## Imagen y logo

La miniatura junto al nombre del ejercicio es la imagen del ejercicio, o un ícono del músculo o equipamiento si no hay imagen. Al tocarla se agranda y muestra el enlace al video si existe.

El logo de Camino+ es una C con un degradé que gana color y la palabra "Plus +" dentro, como se registra en [ADR-006](decisiones/ADR-006-logo-y-pantalla-de-carga.md). Para tamaños chicos se usa la C sin texto. La pantalla de carga muestra huellas que aparecen una a una hasta llegar al "Plus +". El logo no aparece durante la sesión de entrenamiento. Va en la landing, en el ícono de instalación, en la pantalla de carga y como marca chica en las pantallas de gestión. Los archivos están en [diseno/logo](diseno/logo).

## Pantallas del entrenamiento

- **Serie.** El ejercicio con su músculo y lo que pide el plan, la aproximación resumida (no se anota), las series efectivas con la de ahora destacada, lo de la última vez en el color principal, selectores de peso y repeticiones, la comparación en vivo y el botón de "Serie hecha".
- **Descanso.** Cronómetro circular grande, con +15 y -15 segundos, lo que se acaba de hacer comparado con la vez anterior, lo que sigue con el peso sugerido y "Empezar ya". El tiempo se calcula con la hora de fin, así sigue bien si la pantalla se bloquea.
- **JumpSet.** Se ve el paso actual de la ronda, con el descanso que sigue entre un ejercicio y el otro, y las rondas ya hechas.
- **Lista del entrenamiento.** Todos los ejercicios del día, con lo hecho, lo que sigue, y los JumpSets agrupados.

## Accesibilidad

- Contraste suficiente entre texto y fondo en los dos temas.
- Objetivos táctiles de al menos 48 px.
- El estado de una serie nunca depende solo del color.
- La pantalla se mantiene encendida durante la sesión.
