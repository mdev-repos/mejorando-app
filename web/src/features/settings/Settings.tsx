import { useRef, useState } from 'react'
import { MODULES, useEnabledModules } from '../../app/modules'
import { useThemePref, type ThemePref } from '../../app/theme'
import { db } from '../../db/db'
import { exportAll, importAll } from '../../db/transfer'
import { TopBar } from '../../ui/components'

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'sistema', label: 'Sistema' },
  { id: 'oscuro', label: 'Oscuro' },
  { id: 'claro', label: 'Claro' },
]

export function Settings() {
  const [theme, setTheme] = useThemePref()
  const { isEnabled, setEnabled } = useEnabledModules()
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function doExport() {
    const file = await exportAll(db)
    const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `camino-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setMessage('Copia lista. Guardala en un lugar seguro.')
  }

  async function doImport(file: File | undefined) {
    if (!file) return
    try {
      const counts = await importAll(db, JSON.parse(await file.text()))
      setMessage(`Se restauraron ${counts.trainings} entrenamientos y ${counts.sessions} sesiones.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo leer el archivo.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <TopBar title="Ajustes" />
      <div className="scroll">
        <div className="sect">Tema</div>
        <div className="seg" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={theme === t.id}
              className={theme === t.id ? 'on' : ''}
              onClick={() => setTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sect">Módulos</div>
        <div className="stack">
          {MODULES.map((m) => (
            <label key={m.id} className="card row">
              <div className="grow">
                <div className="t1">{m.name}</div>
                <div className="t2">{m.available ? m.blurb : 'Próximamente'}</div>
              </div>
              <input
                type="checkbox"
                className="switch"
                checked={isEnabled(m.id)}
                disabled={!m.available}
                onChange={(e) => setEnabled(m.id, e.target.checked)}
                aria-label={`Activar ${m.name}`}
              />
            </label>
          ))}
        </div>

        <div className="sect">Tus datos</div>
        <div className="card stack">
          <p className="t2">
            Todo se guarda en este teléfono y funciona sin conexión. Hacé una copia de vez en
            cuando, porque si el navegador borra sus datos, la copia es tu respaldo.
          </p>
          <button className="btn small" onClick={doExport}>
            Guardar una copia
          </button>
          <button className="btn small" onClick={() => fileRef.current?.click()}>
            Restaurar una copia
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void doImport(e.target.files?.[0])}
          />
          {message && (
            <p className="t2" role="status">
              {message}
            </p>
          )}
        </div>
        <p className="t2 center" style={{ marginTop: 18 }}>
          Camino+ 0.1
        </p>
      </div>
    </>
  )
}
