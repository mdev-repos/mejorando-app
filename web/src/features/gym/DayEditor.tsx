import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useExercises } from '../../app/data'
import { ModuleIcon } from '../../brand/Logo'
import { db } from '../../db/db'
import { clearExecution, deleteDay, itemsFor, renameDay, saveItems } from '../../db/queries'
import { groupLabel } from '../../domain/muscles'
import { GroupThumb, NameField, TopBar } from '../../ui/components'
import { itemSummary, itemTag, itemTitle } from './format'

export function DayEditor() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { byId } = useExercises()
  const day = useLiveQuery(async () => (await db.trainings.get(id)) ?? null, [id])
  const meso = useLiveQuery(
    async () => (day ? await db.mesocycles.get(day.mesoId) : undefined),
    [day?.mesoId],
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (day === undefined || (day && meso === undefined)) return null
  if (day === null || day.deletedAt || !meso) {
    return (
      <>
        <TopBar
          icon={<ModuleIcon module="gym" size={36} />}
          title="Día"
          onBack={() => navigate('/gym')}
        />
        <div className="empty">Este día ya no existe.</div>
      </>
    )
  }

  const advanced = meso.mode === 'advanced'
  const execution = Math.min(Math.max(Number(params.get('e')) || 1, 1), meso.executions)
  const customized = execution === 1 || !!day.executionItems?.[execution]
  const items = itemsFor(day, execution, meso.mode)
  const editable = !advanced || customized
  const save = (next: typeof items) => saveItems(db, day.id, next, execution)

  const move = (i: number, d: number) => {
    const next = [...items]
    const a = next[i]
    const b = next[i + d]
    if (!a || !b) return
    next[i] = b
    next[i + d] = a
    void save(next)
  }

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title={day.name}
        subtitle={`${meso.name}${advanced ? ` · ejecución ${execution} de ${meso.executions}` : ''}`}
        onBack={() => navigate(`/gym/meso/${meso.id}`)}
      />
      <div className="scroll">
        <NameField
          key={day.id}
          id="tname"
          label="Nombre del día"
          initial={day.name}
          onSave={(n) => renameDay(db, day.id, n)}
        />

        {advanced && (
          <>
            <div className="sect">Ejecución</div>
            <div className="chips" role="radiogroup" aria-label="Ejecución">
              {Array.from({ length: meso.executions }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  role="radio"
                  aria-checked={n === execution}
                  className={`chip-btn${n === execution ? ' on' : ''}`}
                  onClick={() => setParams(n === 1 ? {} : { e: String(n) }, { replace: true })}
                >
                  {n}
                  {n > 1 && day.executionItems?.[n] ? ' ·' : ''}
                </button>
              ))}
            </div>
            {execution > 1 && !customized && (
              <div className="note" style={{ marginTop: 10 }}>
                Esta ejecución usa los mismos ejercicios que la primera. Para cambiarla,
                personalizala.
                <button
                  className="btn small"
                  style={{ marginTop: 10 }}
                  onClick={() => saveItems(db, day.id, day.items, execution)}
                >
                  Personalizar la ejecución {execution}
                </button>
              </div>
            )}
            {execution > 1 && customized && (
              <button
                className="btn small"
                style={{ marginTop: 10 }}
                onClick={() => clearExecution(db, day.id, execution)}
              >
                Volver a la ejecución 1
              </button>
            )}
          </>
        )}

        <div className="sect">Ejercicios</div>
        {items.length === 0 && (
          <div className="empty">
            Todavía no hay ejercicios.
            <br />
            Tocá <b>Agregar</b>, elegí el grupo muscular y el ejercicio.
          </div>
        )}
        {items.map((item, i) => {
          const first = item.kind === 'jumpset' ? item.steps[0]?.exerciseId : item.exerciseId
          const group = first ? byId(first)?.group : undefined
          return (
            <div className="item" key={item.id}>
              {group ? <GroupThumb group={group} exerciseId={first} /> : <div className="thumb" />}
              <div className="nm">
                {itemTitle(item, byId)}
                <small>
                  <span className="chip" style={{ marginRight: 6 }}>
                    {itemTag(item).toUpperCase()}
                  </span>
                  {itemSummary(item)}
                </small>
                {group && <small>{groupLabel(group)}</small>}
              </div>
              {editable && (
                <div className="acts">
                  <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button
                    aria-label="Bajar"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button aria-label="Quitar" onClick={() => save(items.filter((_, k) => k !== i))}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {editable && (
          <button
            className="btn small"
            onClick={() =>
              navigate(`/gym/dia/${day.id}/agregar${execution > 1 ? `?e=${execution}` : ''}`)
            }
          >
            + Agregar ejercicio
          </button>
        )}

        <div style={{ height: 22 }} />
        <button
          className="btn small danger"
          onClick={async () => {
            if (!confirmDelete) return setConfirmDelete(true)
            await deleteDay(db, day.id)
            navigate(`/gym/meso/${meso.id}`)
          }}
        >
          {confirmDelete ? 'Tocá de nuevo para borrar' : 'Borrar día'}
        </button>
      </div>
    </>
  )
}
