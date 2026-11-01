# 06 Preguntas abiertas

Lo que todavía no está decidido. Cuando una pregunta se resuelve, la respuesta pasa al documento que corresponda, o a una decisión registrada si es importante, y la pregunta se borra de acá.

## Producto

1. **Revisión de marca.** El nombre MejorAndo y el logo están decididos ([ADR-008](decisiones/ADR-008-mejorando-nombre-y-logo.md)). Antes de abrir la app al público hay que revisar si el nombre se puede usar, por ejemplo en el registro de marcas, en las tiendas de aplicaciones y en dominios. También falta diseñar la versión del texto final de la pantalla de carga.
2. **Protocolos.** En el rest pause, si en la comparación las repeticiones del tramo extra se miran aparte o se suman a la serie (la propuesta es mirarlas aparte). El descanso propuesto es de 20 segundos y se puede cambiar. Además, qué otros protocolos se agregan al JumpSet y al rest pause.
3. **Catálogo.** Resuelto con ADR-012, hay 253 ejercicios y 246 ilustraciones. Falta cubrir los siete del catálogo inicial que no tienen dibujo.
4. **Contenido de la landing y de la ayuda.** Cómo se explica sacarle más provecho a la app, y a qué creadores de contenido se recomienda además del entrenador del que aprendió el autor.
5. **Carga de rutinas desde una planilla.** Si se agrega después del armado por catálogo, y con qué formato.

## Arquitectura

6. **Método de cuenta.** La aplicación se usa sin cuenta y la cuenta es opcional ([ADR-004](decisiones/ADR-004-uso-sin-cuenta.md)). Falta elegir cómo se crea y se abre. Las opciones en estudio son iniciar con una cuenta de Google, un enlace que llega por correo sin contraseña, y llaves de acceso (passkeys), solas o combinadas.
7. **Dónde se publica la versión pública** y con qué costo. Para probar mientras el repositorio es privado se usa Netlify ([ADR-007](decisiones/ADR-007-repositorio-y-publicacion.md)).
8. **Cómo se prueba una PWA en un dispositivo real,** en iPhone y en Android, durante el desarrollo.

## Legales

9. **Política de privacidad y consentimiento** antes de abrir la app al público.
10. **Licencias** de las imágenes y de cualquier otro contenido incluido.
