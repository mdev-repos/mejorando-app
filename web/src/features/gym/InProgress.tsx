import { useNavigate } from 'react-router-dom'
import { useInProgress } from '../../app/data'
import { db } from '../../db/db'
import { finishSession, pauseSession, resumeSession } from '../../db/queries'
import type { Session } from '../../domain/types'

/** Abre un entrenamiento empezado. Si estaba en pausa se retoma, y el que estaba en curso queda en pausa. */
export function useOpenSession(): (id: string) => Promise<void> {
  const navigate = useNavigate()
  return async (id) => {
    await resumeSession(db, id)
    navigate(`/gym/sesion/${id}`)
  }
}

/** Una tarjeta por cada entrenamiento empezado y sin terminar. */
export function InProgressCards({ hint }: { hint?: string }) {
  const list = useInProgress()
  const open = useOpenSession()
  if (!list?.length) return null
  return (
    <>
      {list.map((s) => (
        <button key={s.id} className="card tap" onClick={() => void open(s.id)}>
          <span className="chip">{s.status === 'paused' ? 'EN PAUSA' : 'EN CURSO'}</span>
          <div className="t1" style={{ marginTop: 8 }}>
            {s.trainingName}
          </div>
          <div className="t2">
            Ejecución {s.execution} de {s.executionsTotal} ·{' '}
            {s.status === 'paused' ? 'tocá para retomar' : (hint ?? 'tocá para continuar')}
          </div>
        </button>
      ))}
    </>
  )
}

/**
 * Se muestra cuando se quiere empezar un entrenamiento y ya hay otro en curso.
 * Se puede dejar en pausa para retomarlo después, o terminarlo con lo que se hizo hasta ahora.
 */
export function ConflictDialog(props: {
  current: Session
  onChosen: () => void
  onCancel: () => void
}) {
  const { current } = props
  return (
    <div className="tour-back">
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="conflicto-titulo">
        <h2 id="conflicto-titulo">Tenés un entrenamiento en curso</h2>
        <p>
          <b>{current.trainingName}</b>, ejecución {current.execution} de {current.executionsTotal}.
          ¿Qué querés hacer con ese entrenamiento antes de empezar el otro?
        </p>
        <div className="stack">
          <button
            className="btn primary"
            onClick={async () => {
              await pauseSession(db, current.id)
              props.onChosen()
            }}
          >
            Pausarlo y empezar este
          </button>
          <div className="t2">Queda guardado, y lo retomás desde donde lo dejaste.</div>
          <button
            className="btn"
            onClick={async () => {
              await finishSession(db, current.id)
              props.onChosen()
            }}
          >
            Terminarlo y empezar este
          </button>
          <div className="t2">Se da por hecho con las series que anotaste.</div>
          <button className="btn small" onClick={props.onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
