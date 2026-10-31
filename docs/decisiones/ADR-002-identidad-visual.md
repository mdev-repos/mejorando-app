# ADR-002 Identidad visual, paleta índigo con tema claro y oscuro

## Estado

Aceptada, 2026-10-26.

## Contexto

La app se usa en el gimnasio, con una mano, con el teléfono chico y a veces con poca luz o con mucha. Se compararon dos paletas en un boceto interactivo (ver [diseño visual](../07-diseno-visual.md)): índigo, fría y sobria, y ámbar, cálida y enérgica. Un requisito explícito fue que el tema claro no encandile.

## Decisión

- Paleta **índigo** como identidad de la app.
- Dos temas, **oscuro y claro**, los dos mantenidos con el mismo cuidado. Por defecto sigue el tema del teléfono, con opción de cambiarlo a mano.
- El tema claro usa un gris suave de fondo y no blanco puro. El oscuro no usa negro puro.
- Mejoró, igual y por debajo se muestran siempre con símbolo y texto además de color.
- En la pantalla de entrenamiento, la miniatura junto al nombre es la imagen del ejercicio, con un ícono del músculo o equipamiento cuando no hay imagen. El logo de la app no aparece durante la sesión.

## Alternativas

- **Paleta ámbar.** Más cálida y de gimnasio, pero se prefirió la sobriedad del índigo.
- **Un solo tema.** Se descartó porque el uso en el gimnasio varía mucho de luz.

## Consecuencias

- Hay que mantener dos juegos de colores y probar cada pantalla en ambos temas.
- Los colores quedan como variables, así cambiar un tono es tocar un solo lugar.
- El logo definitivo y el nombre de la app siguen pendientes.
