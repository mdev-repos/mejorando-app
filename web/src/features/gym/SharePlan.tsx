import { useState } from 'react'
import { fileSlug, shareJson } from '../../app/files'
import { db } from '../../db/db'
import { exportPlan, type PlanTarget } from '../../db/share'

/** Los dos caminos para pasar una rutina, el archivo y el texto para pegar en un chat. */
export function SharePlan({ target, label }: { target: PlanTarget; label: string }) {
  const [message, setMessage] = useState('')

  async function run(action: (file: unknown, name: string) => Promise<string>) {
    try {
      const { file, name } = await exportPlan(db, target)
      setMessage(await action(file, name))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo compartir.')
    }
  }

  return (
    <>
      <div className="sect">Compartir</div>
      <div className="card stack">
        <p className="t2">
          Se envía con sus días, sin tu historial. Quien la reciba la carga desde Entrenamiento y
          queda como algo propio.
        </p>
        <button
          className="btn small"
          onClick={() =>
            run(async (file, name) => {
              const how = await shareJson(`rutina-${fileSlug(name)}`, file, name)
              return how === 'saved' ? 'Se guardó el archivo en tus descargas.' : ''
            })
          }
        >
          Compartir {label}
        </button>
        <button
          className="btn small"
          onClick={() =>
            run(async (file) => {
              await navigator.clipboard.writeText(JSON.stringify(file))
              return 'Listo. Pegalo en un chat y quien lo reciba lo copia y lo carga desde Entrenamiento.'
            })
          }
        >
          Copiar como texto
        </button>
        {message && (
          <p className="t2" role="status">
            {message}
          </p>
        )}
      </div>
    </>
  )
}
