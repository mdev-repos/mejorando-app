import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExercises } from '../../app/data'
import { db } from '../../db/db'
import { deleteTraining, renameTraining, saveItems, startSession } from '../../db/queries'
import { groupLabel } from '../../domain/muscles'
import { GroupThumb, TopBar } from '../../ui/components'
import { itemSummary, itemTag, itemTitle } from './format'

function NameField({ initial, onSave }: { initial: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial)
  return (
    <div className="field">
      <label htmlFor="tname">Nombre</label>
      <input
        id="tname"
        className="search"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name.trim() && onSave(name.trim())}
      />
    </div>
  )
}

export function TrainingEditor() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { byId } = useExercises()
  const training = useLiveQuery(async () => (await db.trainings.get(id)) ?? null, [id])
  const active = useLiveQuery(() => db.sessions.where('status').equals('active').first(), [])
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (training === undefined) return null
  if (training === null || training.deletedAt) {
    return (
      <>
        <TopBar title="Entrenamiento" onBack={() => navigate('/gym')} />
        <div className="empty">Este entrenamiento ya no existe.</div>
      </>
    )
  }

  const items = training.items
  const move = (i: number, d: number) => {
    const next = [...items]
    const j = i + d
    const a = next[i]
    const b = next[j]
    if (!a || !b) return
    next[i] = b
    next[j] = a
    void saveItems(db, training.id, next)
  }
  const remove = (i: number) =>
    void saveItems(
      db,
      training.id,
      items.filter((_, k) => k !== i),
    )

  async function start() {
    if (!training) return
    if (active) {
      navigate(`/gym/sesion/${active.id}`)
      return
    }
    const session = await startSession(db, training)
    navigate(`/gym/sesion/${session.id}`)
  }

  async function removeTraining() {
    if (!training) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await deleteTraining(db, training.id)
    navigate('/gym')
  }

  return (
    <>
      <TopBar
        title="Entrenamiento"
        subtitle={`${items.length} ejercicios`}
        onBack={() => navigate('/gym')}
      />
      <div className="scroll">
        <NameField
          key={training.id}
          initial={training.name}
          onSave={(n) => renameTraining(db, training.id, n)}
        />

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
              {group ? <GroupThumb group={group} /> : <div className="thumb" />}
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
                <button aria-label="Quitar" onClick={() => remove(i)}>
                  ✕
                </button>
              </div>
            </div>
          )
        })}
        <button
          className="btn small"
          onClick={() => navigate(`/gym/entrenamiento/${training.id}/agregar`)}
        >
          + Agregar ejercicio
        </button>

        <div style={{ height: 22 }} />
        <button className="btn small danger" onClick={removeTraining}>
          {confirmDelete ? 'Tocá de nuevo para borrar' : 'Borrar entrenamiento'}
        </button>
      </div>
      <div className="bottom">
        <button className="btn primary" disabled={items.length === 0 && !active} onClick={start}>
          {active ? 'Continuar entrenamiento en curso' : 'Entrenar'}
        </button>
      </div>
    </>
  )
}
