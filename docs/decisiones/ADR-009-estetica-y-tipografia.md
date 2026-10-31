# ADR-009 Estética de MejorAndo, un color por módulo y Figtree

## Estado

Aceptada, 2026-10-31.

## Contexto

La primera versión de la app usaba un solo color índigo sobre fondos oscuros lisos, sin imágenes, y se sentía opaca. Con la identidad nueva ([ADR-008](ADR-008-mejorando-nombre-y-logo.md)) hacía falta una estética más viva, que siguiera siendo cómoda de leer en el gimnasio.

## Decisión

- **Un color por módulo.** EntrenAndo es naranja, AlimentAndo es verde y CaminAndo es azul. El color del módulo da el acento de botones, avances, anillo del descanso y detalles. La suite usa el violeta.
- **Bases neutras.** Se mantienen un tema oscuro y uno claro, con el tema del teléfono por defecto. El claro es gris suave y no blanco puro. Los resultados siguen siendo verde y rojo, con símbolo y texto además del color.
- **Profundidad.** Tarjetas con un degradé muy leve, sombra suave y un brillo en el borde superior. Botones principales con degradé del color del módulo.
- **Tipografía.** Figtree, en todos los pesos, porque es redonda y amable como los íconos y tiene cifras de ancho fijo, necesarias para que los números del cronómetro no salten. El nombre MejorAndo está dibujado con Nunito, que es más redonda todavía.
- **El nombre en dos colores.** "Mejor" va con el color del texto y "Ando" en violeta, un cuarto color que es propio de la suite y no pertenece a ningún módulo. Cada módulo repite la idea, con "Ando" en su color. El inicio y los ajustes usan el violeta como acento.
- **Pisadas de la pantalla de carga.** Van tomando los colores del degradé hasta llegar al nombre.

## Alternativas

- **Mantener el índigo.** Era elegante, pero no daba identidad por módulo.
- **Un degradé de los tres colores en toda la interfaz.** Cansa la vista durante una sesión larga.
- **Nunito para toda la interfaz.** No tiene cifras de ancho fijo.

## Consecuencias

- Los colores de los módulos que todavía no existen ya están definidos en los estilos.
- Las fuentes viajan dentro de la aplicación, así que funcionan sin conexión.
- Hay que revisar el contraste del texto sobre cada color cuando se construyan los otros módulos.
