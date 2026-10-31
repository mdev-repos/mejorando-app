/** Pasa un archivo a otra app con el menú de compartir del teléfono, y si no hay, lo descarga. */
export async function shareJson(
  fileName: string,
  data: unknown,
  title: string,
): Promise<'shared' | 'saved'> {
  const text = JSON.stringify(data)
  const file = new File([text], fileName, { type: 'application/json' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title })
      return 'shared'
    }
  } catch (e) {
    // cerrar el menú sin elegir no es un error, y no hay que descargar de más
    if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'saved'
}

export function fileSlug(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'rutina'
  )
}
