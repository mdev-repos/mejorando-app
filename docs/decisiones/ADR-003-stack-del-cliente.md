# ADR-003 Stack del cliente, React, TypeScript, Vite, Workbox y Dexie

## Estado

Aceptada, 2026-10-31.

## Contexto

La plataforma ya está decidida, una PWA con enfoque offline-first ([ADR-001](ADR-001-plataforma-pwa-offline-first.md)). Falta elegir con qué se construye la interfaz y cómo se guardan los datos en el teléfono. El autor ya trabaja con React y TypeScript en sus otros proyectos de interfaz, y un agente de IA rinde bien con ese stack.

## Decisión

- **React con TypeScript y Vite** para la interfaz.
- **Workbox**, a través del plugin de PWA de Vite, para el service worker y la caché.
- **Dexie** sobre IndexedDB para los datos locales.
- **CSS propio con variables**, para los dos temas definidos en [ADR-002](ADR-002-identidad-visual.md).

## Alternativas

- **Otros frameworks de interfaz.** No se evaluaron a fondo, porque no aportan una ventaja clara frente a conocer bien el stack elegido.
- **Aplicación nativa en Kotlin.** Ya descartada en ADR-001, sin perjuicio de volver a mirarla si más adelante hace falta Health Connect.

## Consecuencias

- El mismo stack sirve para la landing y para la aplicación.
- Las migraciones de IndexedDB hay que versionarlas desde el primer día.
- Si se llega a necesitar Health Connect, la PWA se puede envolver con Capacitor sin rehacer la interfaz.
