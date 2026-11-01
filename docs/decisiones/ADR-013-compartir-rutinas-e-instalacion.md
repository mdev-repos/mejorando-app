# ADR-013 Compartir rutinas y botón de instalar

Estado: Aceptada

## Contexto

Una persona arma un macrociclo y quiere pasárselo a otra sin repetir el trabajo. Además, la instalación de la PWA dependía de que cada persona encontrara la opción en el menú del navegador.

## Decisión

**Compartir.** Un macrociclo entero o un mesociclo se exporta como un archivo `.json` con formato `mejorando-rutina`. Lleva los mesociclos, los días y los ejercicios propios que usan. No lleva sesiones, series ni ajustes personales como el paso de peso. Se envía con el menú de compartir del teléfono como texto plano (.txt), porque Chrome no deja compartir .json, y si el menú no está disponible se descarga un .json.

**Texto.** Como el selector de archivos de Android no muestra la carpeta donde WhatsApp guarda lo que recibe, también se puede copiar la rutina como texto, pegarla en un chat y, del otro lado, copiar el mensaje y pegarlo en "Pegar una rutina como texto". Se toma lo que hay entre la primera llave y la última, así que tolera texto de más.

**Cargar.** Desde Entrenamiento, "Cargar una rutina recibida" crea siempre algo nuevo, con identificadores propios, dentro de un macrociclo con el nombre del original. Nunca pisa lo que ya existe. Si se carga dos veces, queda duplicada. Un ejercicio propio que ya existe se conserva.

**Instalar.** La app guarda el aviso `beforeinstallprompt` del navegador y muestra una tarjeta "Instalar" en Inicio y en Ajustes mientras no esté instalada. Está pensado para Android con Chrome. En iPhone no hay forma de dispararlo, queda pendiente una guía.

## Alternativas

- Enlace o código QR. Requiere servidor o un archivo demasiado grande en la dirección.
- Cuenta y sincronización. Queda para más adelante (ADR-004).

## Consecuencias

- Sin servidor, la rutina viaja como archivo por cualquier app de mensajes.
- El archivo de rutina y la copia completa son formatos distintos, para no mezclar historial con planificación.
