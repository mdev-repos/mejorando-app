# ADR-001 Plataforma, PWA con enfoque offline-first

## Estado

Aceptada el 2026-10-27.

## Contexto

La aplicación se va a usar en el celular, durante el entrenamiento, muchas veces en gimnasios con poca o ninguna señal. Los datos que más se usan son los del plan del día y las series que se anotan. Al principio los pasos y el peso se pueden cargar a mano. Hay que elegir entre una aplicación nativa, una web instalable (PWA) o una híbrida.

Se verificaron estos hechos relevantes, con fuentes secundarias, que conviene volver a comprobar antes de decisiones definitivas.

- Google Fit está dado de baja en favor de Health Connect, que es una plataforma de Android y requiere código nativo o híbrido.
- Las cuentas personales nuevas de Google Play necesitan una prueba cerrada con al menos 12 testers durante 14 días antes de publicar.
- En iPhone, una PWA recibe notificaciones push solo si está instalada en la pantalla de inicio, y Safari no soporta la sincronización en segundo plano.
- Safari puede borrar los datos locales de una web tras siete días sin uso, con un trato distinto para las apps instaladas en la pantalla de inicio.

## Decisión

La aplicación es una **PWA offline-first**. El código de la app y los datos viven en el teléfono (service worker e IndexedDB), y se sincronizan con un servidor propio cuando hay conexión. El servidor guarda la cuenta, el respaldo y permite usar varios dispositivos.

## Alternativas

- **Nativa Android con Kotlin.** Es la mejor para Health Connect y notificaciones, pero deja afuera a quienes usan iPhone, requiere pasar por Google Play desde el inicio y es más lenta de iterar.
- **Híbrida (React Native, Flutter o web empaquetada).** Cubre las dos plataformas con una base común y accede a la salud del teléfono, pero depende de módulos nativos de calidad variable y tiene la misma barrera de publicación.

Se eligió la PWA porque los datos de salud automáticos no son imprescindibles al arrancar, porque la landing y la app comparten el mismo sitio, porque se publica en minutos y porque no depende de ninguna tienda.

## Consecuencias

Lo que se gana.

- Una sola base de código y publicación inmediata, sin revisión de una tienda.
- La landing y la app viven juntas.
- Se puede usar sin conexión, y un servidor lento no afecta al usuario.

Lo que hay que cuidar, y que pasa a ser parte del diseño.

- Identificadores generados en el dispositivo y envío idempotente al servidor.
- Una regla clara de conflictos cuando se edita desde dos dispositivos.
- Migraciones versionadas de los datos locales.
- Compatibilidad de la API con versiones anteriores del cliente durante un tiempo.
- Respaldo en el servidor y exportación de datos, porque el navegador puede borrar el almacenamiento local.
- No se puede programar un aviso local con la app cerrada. Los avisos fuera de la app dependen de notificaciones enviadas desde el servidor.

Queda abierta una etapa posterior, que sería empaquetar la misma app para las tiendas o hacer una versión nativa de Android, para incorporar Health Connect.
