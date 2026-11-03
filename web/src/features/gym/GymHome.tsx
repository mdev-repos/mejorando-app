import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackupReminder } from '../../app/BackupReminder'
import { ModuleIcon, ModuleName } from '../../brand/Logo'
import { db } from '../../db/db'
import { createMacro } from '../../db/queries'
import { importPlan, parsePlanText } from '../../db/share'
import { TopBar } from '../../ui/components'
import { formatDate, formatDuration } from './format'
import { InProgressCards } from './InProgress'
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
  const history = useLiveQuery(
    async () =>
      (await db.sessions.where('status').equals('done').toArray())
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 8),
    [],
  )

  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')

  async function doImport(file: File | undefined) {
    if (!file) return
    await load(await file.text())
    if (fileRef.current) fileRef.current.value = ''
  }

  async function load(text: string) {
    try {
      const r = await importPlan(db, parsePlanText(text))
      navigate(`/gym/macro/${r.macroId}`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo leer la rutina.')
    }
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
        <InProgressCards />

        <BackupReminder />

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
          {pasting ? (
            <div className="card stack">
              <label className="t2" htmlFor="pegado">
                Pegá acá el mensaje con la rutina
              </label>
              <textarea
                id="pegado"
                className="search"
                rows={4}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                style={{ width: '100%' }}
              />
              <div className="two">
                <button className="btn small" onClick={() => setPasting(false)}>
                  Cancelar
                </button>
                <button
                  className="btn small primary"
                  disabled={!pasted.trim()}
                  onClick={() => void load(pasted)}
                >
                  Cargar
                </button>
              </div>
            </div>
          ) : (
            <button className="btn small" onClick={() => setPasting(true)}>
              Pegar una rutina como texto
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json,text/plain,.txt"
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
