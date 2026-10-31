# ADR-006 Logo y pantalla de carga

## Estado

Aceptada, 2026-10-31.

## Contexto

Con el nombre Camino+ ([ADR-005](ADR-005-nombre-y-suite.md)) hacía falta un logo que funcione como ícono de instalación, en la pestaña del navegador y en la landing, y una pantalla de carga con identidad. Un camino con una cruz arriba parecía un símbolo religioso, y una C con un "+" solo se leía como una cruz médica o como un botón de sumar.

## Decisión

- **Logo.** Una C grande, con las puntas cortadas rectas, y la palabra "Plus +" dentro. La C lleva un degradé que va ganando color, de pálido a intenso.
- **Logo chico.** La misma C con el degradé y sin texto, para tamaños de 32 px o menos, donde el texto no se lee.
- **Pantalla de carga.** Seis huellas, derecha e izquierda alternadas, que aparecen una a una desde abajo y van ganando color hasta llegar al "Plus +". Se anima sola y respeta la preferencia de reducir el movimiento.
- Las formas salen de los archivos de diseño hechos en Canva, calcados a trazos. Los colores salen de la paleta de [ADR-002](ADR-002-identidad-visual.md) en sus dos temas.
- Los archivos fuente están en `docs/diseno/logo`.

## Alternativas

- **Sendero con una cruz.** Se descartó por parecer un símbolo religioso.
- **C con un "+" solo.** Se descartó porque no gustó y no se diferenciaba de una cruz.
- **C con una huella adentro.** A 32 px la huella se vuelve un punto.

## Consecuencias

- La tipografía de "Plus +" es la que se usó en Canva. Hay que confirmar que su licencia permite usarla en un logo, y si no, reemplazarla por una abierta.
- El logo con texto se lee bien desde unos 64 px. Para tamaños menores se usa el logo chico.
