import { useRef, useState } from 'react'
import { MODULES, useEnabledModules } from '../../app/modules'
import { playCue, unlockAudio, useFeedbackPrefs } from '../../app/sound'
import { InstallCard } from '../../app/install'
import { useTestMode } from '../../app/testMode'
import { useThemePref, type ThemePref } from '../../app/theme'
import { db } from '../../db/db'
import { exportAll, importAll } from '../../db/transfer'
import { ModuleIcon, ModuleName, SuiteLogo } from '../../brand/Logo'
import { TopBar } from '../../ui/components'

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'sistema', label: 'Sistema' },
  { id: 'oscuro', label: 'Oscuro' },
  { id: 'claro', label: 'Claro' },
]

export function Settings() {
  const [theme, setTheme] = useThemePref()
  const { isEnabled, setEnabled } = useEnabledModules()
  const [testMode, setTestMode] = useTestMode()
  const feedback = useFeedbackPrefs()
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function doExport() {
    const file = await exportAll(db)
    const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mejorando-copia-${new Date().toISOString().slice(0, 10)}.json`
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
      <TopBar icon={<SuiteLogo size={36} />} title="Ajustes" />
      <div className="scroll">
        <InstallCard />

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
              <ModuleIcon module={m.id} size={44} />
              <div className="grow">
                <div className="t1">
                  <ModuleName name={m.name} module={m.id} />
                </div>
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

        <div className="sect">Avisos del descanso</div>
        <div className="stack">
          <label className="card row">
            <div className="grow">
              <div className="t1">Sonidos</div>
              <div className="t2">
                Un tic en los últimos tres segundos y un aviso al terminar. Suenan con la app
                abierta y la pantalla encendida.
              </div>
            </div>
            <input
              type="checkbox"
              className="switch"
              checked={feedback.sound}
              onChange={(e) => feedback.setSound(e.target.checked)}
              aria-label="Sonidos"
            />
          </label>
          <label className="card row">
            <div className="grow">
              <div className="t1">Vibración</div>
              <div className="t2">Funciona en la mayoría de los Android, y en iPhone no.</div>
            </div>
            <input
              type="checkbox"
              className="switch"
              checked={feedback.vibration}
              onChange={(e) => feedback.setVibration(e.target.checked)}
              aria-label="Vibración"
            />
          </label>
          <button
            className="btn small"
            onClick={() => {
              unlockAudio()
              playCue('test')
            }}
          >
            Probar el aviso
          </button>
          <div className="note">
            El color del descanso también avisa. A los 15 segundos pasa a amarillo, a los 10 a rojo
            y al terminar a verde.
          </div>
        </div>

        <div className="sect">Entrenamiento</div>
        <label className="card row">
          <div className="grow">
            <div className="t1">Modo de prueba</div>
            <div className="t2">
              Permite adelantar o alargar los descansos. Durante un entrenamiento real se respeta el
              descanso de la rutina, así que dejalo apagado.
            </div>
          </div>
          <input
            type="checkbox"
            className="switch"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            aria-label="Modo de prueba"
          />
        </label>

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
        <div className="sect">Créditos</div>
        <div className="card stack">
          <p className="t2">
            Las ilustraciones de los ejercicios son del proyecto Everkinetic, de Greg Priday, con
            licencia{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0
            </a>
            . Se convirtieron a otro formato y tamaño para la aplicación, sin cambiar el dibujo.
          </p>
          <a
            className="t2"
            href="https://github.com/everkinetic/data"
            target="_blank"
            rel="noreferrer"
          >
            github.com/everkinetic/data
          </a>
        </div>
        <p className="t2 center" style={{ marginTop: 18 }}>
          MejorAndo 0.1
        </p>
      </div>
    </>
  )
}
