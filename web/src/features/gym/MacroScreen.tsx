import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ModuleIcon } from '../../brand/Logo'
import { fileSlug, shareJson } from '../../app/files'
import { db } from '../../db/db'
import { exportPlan } from '../../db/share'
import { createMeso, deleteMacro, renameMacro } from '../../db/queries'
import type { RoutineMode } from '../../domain/types'
import { NameField, Stepper, TopBar } from '../../ui/components'
import { mesoProgress } from './progress'

function MesoCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const meso = useLiveQuery(() => db.mesocycles.get(id), [id])
  const days = useLiveQuery(
    () =>
      db.trainings
        .where('mesoId')
        .equals(id)
        .filter((t) => !t.deletedAt)
        .count(),
    [id],
  )
  const progress = useLiveQuery(() => mesoProgress(db, id), [id])
  if (!meso) return null
  const pct = progress && progress.total ? (progress.done / progress.total) * 100 : 0
  return (
    <button className="card tap" onClick={() => navigate(`/gym/meso/${id}`)}>
      <div className="row">
        <div className="t1 grow">{meso.name}</div>
        <span className="chip">{meso.mode === 'advanced' ? 'AVANZADA' : 'SIMPLE'}</span>
      </div>
      <div className="t2">
        {days} {days === 1 ? 'día' : 'días'} · {meso.executions} ejecuciones
        {progress && progress.total > 0 && ` · ${progress.done} de ${progress.total} hechas`}
      </div>
      {progress && progress.total > 0 && (
        <div className="bar-progress" aria-hidden>
          <i style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  )
}

export function MacroScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const macro = useLiveQuery(async () => (await db.macrocycles.get(id)) ?? null, [id])
  const mesos = useLiveQuery(
    async () =>
      (await db.mesocycles.where('macroId').equals(id).sortBy('order')).filter((m) => !m.deletedAt),
    [id],
  )
  const [creating, setCreating] = useState(false)
  const [mode, setMode] = useState<RoutineMode>('simple')
  const [executions, setExecutions] = useState(4)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')

  if (macro === undefined) return null
  if (macro === null || macro.deletedAt) {
    return (
      <>
        <TopBar
          icon={<ModuleIcon module="gym" size={36} />}
          title="Macrociclo"
          onBack={() => navigate('/gym')}
        />
        <div className="empty">Este macrociclo ya no existe.</div>
      </>
    )
  }

  async function create() {
    if (!macro) return
    const n = (mesos?.length ?? 0) + 1
    const m = await createMeso(db, macro.id, `Mesociclo ${n}`, { mode, executions })
    navigate(`/gym/meso/${m.id}`)
  }

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title="Macrociclo"
        subtitle="Agrupa tus rutinas"
        onBack={() => navigate('/gym')}
      />
      <div className="scroll">
        <NameField
          key={macro.id}
          id="nombre"
          label="Nombre"
          initial={macro.name}
          onSave={(n) => renameMacro(db, macro.id, n)}
        />

        <div className="sect">Mesociclos</div>
        <div className="stack">
          {mesos?.map((m) => (
            <MesoCard key={m.id} id={m.id} />
          ))}
          {mesos?.length === 0 && !creating && (
            <div className="empty">
              Un mesociclo es una rutina con sus días, por ejemplo &quot;PPL&quot; con Push, Pull y
              Legs.
            </div>
          )}

          {creating ? (
            <div className="card stack">
              <div className="t1">Nuevo mesociclo</div>
              <div className="field">
                <label>Tipo de rutina</label>
                <div className="seg" role="radiogroup" aria-label="Tipo de rutina">
                  <button
                    role="radio"
                    aria-checked={mode === 'simple'}
                    className={mode === 'simple' ? 'on' : ''}
                    onClick={() => setMode('simple')}
                  >
                    Simple
                  </button>
                  <button
                    role="radio"
                    aria-checked={mode === 'advanced'}
                    className={mode === 'advanced' ? 'on' : ''}
                    onClick={() => setMode('advanced')}
                  >
                    Avanzada
                  </button>
                </div>
              </div>
              <div className="note">
                {mode === 'simple'
                  ? 'Ejercicios con series y repeticiones. Todas las ejecuciones de un día son iguales.'
                  : 'Suma los protocolos (JumpSet, rest pause, escalonado) y deja que cada ejecución de un día sea distinta.'}
              </div>
              <Stepper
                label="Ejecuciones de cada día"
                value={executions}
                step={1}
                min={1}
                max={12}
                onChange={setExecutions}
              />
              <div className="two">
                <button className="btn small" onClick={() => setCreating(false)}>
                  Cancelar
                </button>
                <button className="btn small primary" onClick={create}>
                  Crear
                </button>
              </div>
            </div>
          ) : (
            <button className="btn small primary" onClick={() => setCreating(true)}>
              + Nuevo mesociclo
            </button>
          )}
        </div>

        {mesos && mesos.length > 0 && (
          <>
            <div className="sect">Compartir</div>
            <div className="card stack">
              <p className="t2">
                Se envía la rutina con sus mesociclos y días, sin tu historial. Quien la reciba la
                carga desde Entrenamiento y queda como algo propio.
              </p>
              <button
                className="btn small"
                onClick={async () => {
                  try {
                    const { file, name } = await exportPlan(db, { macroId: macro.id })
                    const how = await shareJson(`rutina-${fileSlug(name)}`, file, name)
                    setMessage(how === 'saved' ? 'Se guardó el archivo en tus descargas.' : '')
                  } catch (e) {
                    setMessage(e instanceof Error ? e.message : 'No se pudo compartir.')
                  }
                }}
              >
                Compartir macrociclo
              </button>
              {message && (
                <p className="t2" role="status">
                  {message}
                </p>
              )}
            </div>
          </>
        )}

        <div style={{ height: 22 }} />
        <button
          className="btn small danger"
          onClick={async () => {
            if (!confirmDelete) return setConfirmDelete(true)
            await deleteMacro(db, macro.id)
            navigate('/gym')
          }}
        >
          {confirmDelete ? 'Tocá de nuevo para borrar' : 'Borrar macrociclo'}
        </button>
      </div>
    </>
  )
}
