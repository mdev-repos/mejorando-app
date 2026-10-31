# app_camino_plus__proyecto_personal

Camino+ es un proyecto personal. Nace como herramienta de uso propio, abierta para que otros puedan aprovecharla.

Es una suite de herramientas para mejorar la salud que se instala en el celular y funciona sin conexión. Cada persona activa los módulos que usa. El primero es **Gym+**, para planificar y registrar el entrenamiento de fuerza.

## Qué hace Gym+

- Se arma el entrenamiento eligiendo grupo muscular y ejercicio, con series y repeticiones, o con un protocolo como JumpSet o rest pause.
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
