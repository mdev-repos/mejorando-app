import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModuleIcon, ModuleName } from '../../brand/Logo'
import { db } from '../../db/db'
import { createMacro } from '../../db/queries'
import { importPlan } from '../../db/share'
import { TopBar } from '../../ui/components'
import { formatDate, formatDuration } from './format'
import { macroProgress } from './progress'

function MacroCard({ id, name }: { id: string; name: string }) {
  const navigate = useNavigate()
  const mesos = useLiveQuery(
    () =>
      db.mesocycles
        .where('macroId')
        .equals(id)
        .filter((m) => !m.deletedAt)
        .count(),
    [id],
  )
  const progress = useLiveQuery(() => macroProgress(db, id), [id])
  const pct = progress && progress.total ? (progress.done / progress.total) * 100 : 0
  return (
    <button className="card tap" onClick={() => navigate(`/gym/macro/${id}`)}>
      <div className="t1">{name}</div>
      <div className="t2">
        {mesos === 0
          ? 'Sin mesociclos todavía'
          : `${mesos} ${mesos === 1 ? 'mesociclo' : 'mesociclos'}`}
        {progress && progress.total > 0 && ` · ${progress.done} de ${progress.total} ejecuciones`}
      </div>
      {progress && progress.total > 0 && (
        <div className="bar-progress" aria-hidden>
          <i style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  )
}

export function GymHome() {
  const navigate = useNavigate()
  const macros = useLiveQuery(
    async () =>
      (await db.macrocycles.orderBy('updatedAt').reverse().toArray()).filter((m) => !m.deletedAt),
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

  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function doImport(file: File | undefined) {
    if (!file) return
    try {
      const r = await importPlan(db, JSON.parse(await file.text()))
      navigate(`/gym/macro/${r.macroId}`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo leer el archivo.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  async function create() {
    const n = (macros?.length ?? 0) + 1
    const m = await createMacro(db, `Macrociclo ${n}`)
    navigate(`/gym/macro/${m.id}`)
  }

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={44} />}
        title={<ModuleName name="EntrenAndo" module="gym" />}
        subtitle="Entrenamiento de fuerza"
      />
      <div className="scroll">
        {active && (
          <button className="card tap" onClick={() => navigate(`/gym/sesion/${active.id}`)}>
            <span className="chip">EN CURSO</span>
            <div className="t1" style={{ marginTop: 8 }}>
              {active.trainingName}
            </div>
            <div className="t2">
              Ejecución {active.execution} de {active.executionsTotal} · tocá para continuar
            </div>
          </button>
        )}

        <div className="sect">Mis macrociclos</div>
        <div className="stack">
          {macros?.map((m) => (
            <MacroCard key={m.id} id={m.id} name={m.name} />
          ))}
          {macros?.length === 0 && (
            <div className="empty">
              Todavía no armaste nada.
              <br />
              Un macrociclo agrupa tus rutinas, por ejemplo &quot;Principiante&quot;, y cada rutina
              tiene sus días.
            </div>
          )}
          <button className="btn small primary" onClick={create}>
            + Nuevo macrociclo
          </button>
          <button className="btn small" onClick={() => fileRef.current?.click()}>
            Cargar una rutina recibida
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
                      <div className="t1">
                        {s.trainingName} · {s.execution}
                      </div>
                      <div className="t2">
                        {s.mesoName} · {formatDate(s.startedAt)} ·{' '}
                        {formatDuration(s.startedAt, s.endedAt)}
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
