# app_camino_plus__proyecto_personal

MejorAndo es un proyecto personal. Nace como herramienta de uso propio, abierta para que otros puedan aprovecharla.

Es una suite de herramientas para mejorar la salud que se instala en el celular y funciona sin conexión. Cada persona activa los módulos que usa. El primero es **EntrenAndo**, para planificar y registrar el entrenamiento de fuerza.

## Qué hace EntrenAndo

- La planificación baja por cuatro niveles. Un macrociclo agrupa mesociclos, cada mesociclo es una rutina con sus días, y cada día se hace varias veces, que son las ejecuciones.
- Se arma cada día eligiendo grupo muscular y ejercicio, con series y repeticiones. Una rutina avanzada suma protocolos (JumpSet, rest pause y escalonado) y permite que cada ejecución sea distinta.
- El descanso de cada ejercicio lo define la rutina y se respeta durante la sesión. Avisa con el color, con un sonido y con la vibración cuando se acerca el final.
- Durante la sesión, guía de ejercicio en ejercicio, con series de aproximación, cronómetro de descanso y la comparación de cada serie con la vez anterior.
- Los datos viven en el teléfono, y se puede guardar y restaurar una copia.

## Estructura

| Carpeta | Contenido |
|---|---|
| `docs` | Documentación de diseño y decisiones |
| `web` | La aplicación (React, TypeScript, Vite) |

## Cómo correrla

Hace falta Node 22.

```bash
cd web
npm install
npm run dev
```

Otros comandos útiles: `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`.

## Créditos

Las ilustraciones de los ejercicios son del proyecto [Everkinetic](https://github.com/everkinetic/data), de Greg Priday, con licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Se convirtieron a WebP y se redimensionaron, sin cambiar el dibujo. Siete ejercicios tienen un dibujo propio en SVG. Las ilustraciones conservan esa licencia.
