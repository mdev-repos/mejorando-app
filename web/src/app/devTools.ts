/**
 * Las herramientas de desarrollo, como el modo de prueba, solo existen al desarrollar o en una
 * compilación hecha a propósito con VITE_DEV_TOOLS=true. La versión publicada no las trae.
 */
export const DEV_TOOLS = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === 'true'
