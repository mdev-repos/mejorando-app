/**
 * Pasa los datos a otra app con el menú de compartir del teléfono, y si no hay, descarga un .json.
 * Para compartir va como texto plano (.txt) porque Chrome no deja compartir archivos .json.
 */
export async function shareJson(
  baseName: string,
  data: unknown,
  title: string,
): Promise<'shared' | 'saved'> {
  const text = JSON.stringify(data)
  const plain = new File([text], `${baseName}.txt`, { type: 'text/plain' })
  try {
    if (navigator.canShare?.({ files: [plain] })) {
      await navigator.share({ files: [plain], title })
      return 'shared'
    }
  } catch (e) {
    // cerrar el menú sin elegir no es un error, y no hay que descargar de más
    if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
  }
  const file = new File([text], `${baseName}.json`, { type: 'application/json' })
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
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
