import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ModuleIcon } from '../../brand/Logo'
import { fileSlug, shareJson } from '../../app/files'
import { db } from '../../db/db'
import { exportPlan } from '../../db/share'
import {
  type ExecutionStatus,
  createDay,
  deleteMeso,
  executionStatus,
  itemsFor,
  startSession,
  swapDayOrder,
  updateMeso,
} from '../../db/queries'
import type { Mesocycle, Session, Training } from '../../domain/types'
import { NameField, Stepper, TopBar } from '../../ui/components'

function DayCard(props: {
  day: Training
  meso: Mesocycle
  active: Session | undefined
  prev: Training | undefined
  next: Training | undefined
}) {
  const { day, meso, active } = props
  const navigate = useNavigate()
  const status = useLiveQuery(
    () => executionStatus(db, day.id, meso.executions),
    [day.id, meso.executions],
  )
  if (!status) return null

  const nextToDo = status.find((s) => s.state !== 'done')
  const doneCount = status.filter((s) => s.state === 'done').length
  const base = itemsFor(day, nextToDo?.execution ?? 1, meso.mode)
  const count = itemsFor(day, 1, meso.mode).length

  async function start(execution: number) {
    if (active) return navigate(`/gym/sesion/${active.id}`)
    const s = await startSession(db, day, meso, execution)
    navigate(`/gym/sesion/${s.id}`)
  }

  async function onDot(s: ExecutionStatus) {
    if (s.state === 'pending') return start(s.execution)
    if (s.sessionId) navigate(`/gym/sesion/${s.sessionId}`)
  }

  return (
    <div className="card stack" style={{ gap: 6 }}>
      <div className="row">
        <div className="grow">
          <div className="t1">{day.name}</div>
          <div className="t2">
            {count} {count === 1 ? 'ejercicio' : 'ejercicios'} · {doneCount} de {meso.executions}{' '}
            hechas
          </div>
        </div>
        <button
          className="iconbtn"
          aria-label="Subir día"
          disabled={!props.prev}
          onClick={() => props.prev && swapDayOrder(db, day, props.prev)}
        >
          ↑
        </button>
        <button
          className="iconbtn"
          aria-label="Bajar día"
          disabled={!props.next}
          onClick={() => props.next && swapDayOrder(db, day, props.next)}
        >
          ↓
        </button>
        <button
          className="iconbtn"
          aria-label={`Editar ${day.name}`}
          onClick={() => navigate(`/gym/dia/${day.id}`)}
        >
          ✎
        </button>
      </div>
      <div className="dots" role="group" aria-label={`Ejecuciones de ${day.name}`}>
        {status.map((s) => (
          <button
            key={s.execution}
            className={`dot ${s.state}`}
            aria-label={`Ejecución ${s.execution}, ${s.state === 'done' ? 'hecha' : s.state === 'active' ? 'en curso' : 'pendiente'}`}
            onClick={() => onDot(s)}
          >
            {s.state === 'done' ? '✓' : s.execution}
          </button>
        ))}
      </div>
      {nextToDo ? (
        <button
          className="btn small primary"
          style={{ marginTop: 6 }}
          disabled={base.length === 0}
          onClick={() => start(nextToDo.execution)}
        >
          {active && active.trainingId !== day.id
            ? 'Terminá el entrenamiento en curso'
            : nextToDo.state === 'active'
              ? `Continuar ejecución ${nextToDo.execution}`
              : `Entrenar ejecución ${nextToDo.execution}`}
        </button>
      ) : (
        <div className="chip" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
          COMPLETO
        </div>
      )}
      {nextToDo && base.length === 0 && (
        <div className="t2">Agregá ejercicios con el lápiz para poder entrenar.</div>
      )}
    </div>
  )
}

export function MesoScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const meso = useLiveQuery(async () => (await db.mesocycles.get(id)) ?? null, [id])
  const macro = useLiveQuery(
    async () => (meso ? await db.macrocycles.get(meso.macroId) : undefined),
    [meso?.macroId],
  )
  const days = useLiveQuery(
    async () =>
      (await db.trainings.where('mesoId').equals(id).sortBy('order')).filter((d) => !d.deletedAt),
    [id],
  )
  const active = useLiveQuery(() => db.sessions.where('status').equals('active').first(), [])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')

  if (meso === undefined) return null
  if (meso === null || meso.deletedAt) {
    return (
      <>
        <TopBar
          icon={<ModuleIcon module="gym" size={36} />}
          title="Mesociclo"
          onBack={() => navigate('/gym')}
        />
        <div className="empty">Este mesociclo ya no existe.</div>
      </>
    )
  }

  async function addDay() {
    if (!meso) return
    const d = await createDay(db, meso.id, `Día ${(days?.length ?? 0) + 1}`)
    navigate(`/gym/dia/${d.id}`)
  }

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title="Mesociclo"
        subtitle={macro?.name}
        onBack={() => navigate(`/gym/macro/${meso.macroId}`)}
      />
      <div className="scroll">
        <NameField
          key={meso.id}
          id="nombre"
          label="Nombre"
          initial={meso.name}
          onSave={(name) => updateMeso(db, meso.id, { name })}
        />

        <div className="sect">Tipo de rutina</div>
        <div className="seg" role="radiogroup" aria-label="Tipo de rutina">
          <button
            role="radio"
            aria-checked={meso.mode === 'simple'}
            className={meso.mode === 'simple' ? 'on' : ''}
            onClick={() => updateMeso(db, meso.id, { mode: 'simple' })}
          >
            Simple
          </button>
          <button
            role="radio"
            aria-checked={meso.mode === 'advanced'}
            className={meso.mode === 'advanced' ? 'on' : ''}
            onClick={() => updateMeso(db, meso.id, { mode: 'advanced' })}
          >
            Avanzada
          </button>
        </div>
        <div className="note" style={{ marginTop: 8 }}>
          {meso.mode === 'simple'
            ? 'Series y repeticiones, igual en todas las ejecuciones.'
            : 'Con protocolos, y cada ejecución de un día puede ser distinta. Se edita desde cada día.'}
        </div>
        <div style={{ marginTop: 12 }}>
          <Stepper
            label="Ejecuciones de cada día"
            value={meso.executions}
            step={1}
            min={1}
            max={12}
            onChange={(executions) => updateMeso(db, meso.id, { executions })}
          />
          <div className="t2" style={{ margin: '6px 2px 0' }}>
            Todos los días se hacen la misma cantidad de veces, para medir el progreso parejo.
          </div>
        </div>

        <div className="sect">Días</div>
        <div className="stack">
          {days?.map((d, i) => (
            <DayCard
              key={d.id}
              day={d}
              meso={meso}
              active={active}
              prev={days[i - 1]}
              next={days[i + 1]}
            />
          ))}
          {days?.length === 0 && (
            <div className="empty">
              Agregá los días de la rutina, por ejemplo Push, Pull y Legs.
            </div>
          )}
          <button className="btn small primary" onClick={addDay}>
            + Agregar día
          </button>
        </div>

        <div className="sect">Compartir</div>
        <div className="card stack">
          <p className="t2">
            Se envía esta rutina con sus días, sin tu historial. Quien la reciba la carga desde
            Entrenamiento.
          </p>
          <button
            className="btn small"
            onClick={async () => {
              try {
                const { file, name } = await exportPlan(db, { mesoId: meso.id })
                const how = await shareJson(`rutina-${fileSlug(name)}`, file, name)
                setMessage(how === 'saved' ? 'Se guardó el archivo en tus descargas.' : '')
              } catch (e) {
                setMessage(e instanceof Error ? e.message : 'No se pudo compartir.')
              }
            }}
          >
            Compartir mesociclo
          </button>
          {message && (
            <p className="t2" role="status">
              {message}
            </p>
          )}
        </div>

        <div style={{ height: 22 }} />
        <button
          className="btn small danger"
          onClick={async () => {
            if (!confirmDelete) return setConfirmDelete(true)
            await deleteMeso(db, meso.id)
            navigate(`/gym/macro/${meso.macroId}`)
          }}
        >
          {confirmDelete ? 'Tocá de nuevo para borrar' : 'Borrar mesociclo'}
        </button>
      </div>
    </>
  )
}
