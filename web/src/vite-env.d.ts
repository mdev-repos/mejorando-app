/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Con "true" se muestran las herramientas de desarrollo en una compilación de producción. */
  readonly VITE_DEV_TOOLS?: string
}

/** La versión del paquete, para mostrarla en Ajustes. */
declare const __APP_VERSION__: string
