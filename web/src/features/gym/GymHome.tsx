import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/db'
import { createTraining } from '../../db/queries'
import { TopBar } from '../../ui/components'
import { formatDate, formatDuration } from './format'

export function GymHome() {
  const navigate = useNavigate()
  const trainings = useLiveQuery(
    async () =>
      (await db.trainings.orderBy('updatedAt').reverse().toArray()).filter((t) => !t.deletedAt),
    [],
  )
  const active = useLiveQuery(() => db.sessions.where('status').equals('active').first(), [])
  const history = useLiveQuery(
    async () =>
      (await db.sessions.where('status').equals('done').toArray())
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 8),
    [],
  )

  async function create() {
    const n = (trainings?.length ?? 0) + 1
    const t = await createTraining(db, `Entrenamiento ${n}`)
    navigate(`/gym/entrenamiento/${t.id}`)
  }

  return (
    <>
      <TopBar title="Gym+" subtitle="Entrenamiento de fuerza" />
      <div className="scroll">
        {active && (
          <button className="card tap" onClick={() => navigate(`/gym/sesion/${active.id}`)}>
            <span className="chip">EN CURSO</span>
            <div className="t1" style={{ marginTop: 8 }}>
              {active.trainingName}
            </div>
            <div className="t2">Tocá para continuar</div>
          </button>
        )}

        <div className="sect">Mis entrenamientos</div>
        <div className="stack">
          {trainings?.map((t) => (
            <button
              key={t.id}
              className="card tap"
              onClick={() => navigate(`/gym/entrenamiento/${t.id}`)}
            >
              <div className="t1">{t.name}</div>
              <div className="t2">
                {t.items.length === 0
                  ? 'Vacío, agregá ejercicios'
                  : `${t.items.length} ${t.items.length === 1 ? 'ejercicio' : 'ejercicios'}`}
              </div>
            </button>
          ))}
          {trainings?.length === 0 && (
            <div className="empty">
              Todavía no armaste ningún entrenamiento.
              <br />
              Creá el primero y elegí los ejercicios con unos toques.
            </div>
          )}
          <button className="btn small primary" onClick={create}>
            + Nuevo entrenamiento
          </button>
        </div>

        {history && history.length > 0 && (
          <>
            <div className="sect">Últimas sesiones</div>
            <div className="stack">
              {history.map((s) => (
                <button
                  key={s.id}
                  className="card tap"
                  onClick={() => navigate(`/gym/sesion/${s.id}`)}
                >
                  <div className="row">
                    <div className="grow">
                      <div className="t1">{s.trainingName}</div>
                      <div className="t2">
                        {formatDate(s.startedAt)} · {formatDuration(s.startedAt, s.endedAt)}
                      </div>
                    </div>
                    <span aria-hidden>→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
