import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExercises } from '../../app/data'
import { db, newId } from '../../db/db'
import { createExercise, saveItems } from '../../db/queries'
import { MUSCLE_GROUPS, groupLabel, type MuscleGroupId } from '../../domain/muscles'
import { formatRest } from '../../domain/targets'
import type {
  Exercise,
  JumpSetItem,
  NormalItem,
  RepTarget,
  RestPauseItem,
} from '../../domain/types'
import { GroupThumb, Stepper, TopBar } from '../../ui/components'

/* ---------- elegir ejercicio: grupo muscular y después ejercicio ---------- */
function ExercisePicker(props: { onPick: (e: Exercise) => void }) {
  const { list } = useExercises()
  const [group, setGroup] = useState<MuscleGroupId | null>(null)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  if (!group) {
    return (
      <div className="groups">
        {MUSCLE_GROUPS.map((g) => (
          <button key={g.id} className="group-btn" onClick={() => setGroup(g.id)}>
            <GroupThumb group={g.id} />
            {g.label}
          </button>
        ))}
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const options = list.filter((e) => e.group === group && (!q || e.name.toLowerCase().includes(q)))

  async function create() {
    if (!group || !newName.trim()) return
    const e = await createExercise(db, {
      name: newName.trim(),
      group,
      equipment: 'otro',
      load: 'external',
    })
    props.onPick(e)
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 10 }}>
        <button
          className="iconbtn"
          aria-label="Cambiar grupo"
          onClick={() => {
            setGroup(null)
            setQuery('')
          }}
        >
          ←
        </button>
        <div className="t1">{groupLabel(group)}</div>
      </div>
      <input
        className="search"
        placeholder="Buscar ejercicio"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="stack">
        {options.map((e) => (
          <button key={e.id} className="card tap" onClick={() => props.onPick(e)}>
            <div className="t1">{e.name}</div>
            <div className="t2">{e.custom ? 'Propio' : e.equipment}</div>
          </button>
        ))}
        {options.length === 0 && <div className="empty">No hay ejercicios con ese nombre.</div>}
        {creating ? (
          <div className="card stack">
            <input
              className="search"
              placeholder="Nombre del ejercicio"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className="btn small primary" disabled={!newName.trim()} onClick={create}>
              Crear y elegir
            </button>
          </div>
        ) : (
          <button
            className="btn small"
            onClick={() => {
              setCreating(true)
              setNewName(query)
            }}
          >
            + Crear ejercicio propio
          </button>
        )}
      </div>
    </>
  )
}

/* ---------- objetivo de repeticiones ---------- */
function TargetEditor({
  value,
  onChange,
  unit = 'Repeticiones',
}: {
  value: RepTarget
  onChange: (t: RepTarget) => void
  unit?: string
}) {
  const base = value.kind === 'fixed' ? value.reps : value.kind === 'range' ? value.min : 8
  return (
    <div className="stack">
      <div className="seg" role="tablist" aria-label="Tipo de objetivo">
        <button
          className={value.kind === 'fixed' ? 'on' : ''}
          onClick={() => onChange({ kind: 'fixed', reps: base })}
        >
          Fijo
        </button>
        <button
          className={value.kind === 'range' ? 'on' : ''}
          onClick={() => onChange({ kind: 'range', min: base, max: base + 2 })}
        >
          Rango
        </button>
        <button
          className={value.kind === 'failure' ? 'on' : ''}
          onClick={() => onChange({ kind: 'failure' })}
        >
          Al fallo
        </button>
      </div>
      {value.kind === 'fixed' && (
        <Stepper
          label={unit}
          value={value.reps}
          step={1}
          min={1}
          onChange={(reps) => onChange({ kind: 'fixed', reps })}
        />
      )}
      {value.kind === 'range' && (
        <div className="inputs">
          <Stepper
            label="Desde"
            value={value.min}
            step={1}
            min={1}
            onChange={(min) => onChange({ kind: 'range', min, max: Math.max(min, value.max) })}
          />
          <Stepper
            label="Hasta"
            value={value.max}
            step={1}
            min={1}
            onChange={(max) => onChange({ kind: 'range', min: Math.min(value.min, max), max })}
          />
        </div>
      )}
    </div>
  )
}

function RestField({
  label,
  value,
  onChange,
  step = 15,
  min = 0,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
}) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <Stepper
        label={`${label} (segundos)`}
        value={value}
        step={step}
        min={min}
        onChange={onChange}
      />
      <div className="t2" style={{ marginLeft: 2 }}>
        {formatRest(value)}
      </div>
    </div>
  )
}

type Phase = 'pick' | 'mode' | 'normal' | 'protocol' | 'restpause' | 'jump' | 'jumppick'

export function AddItem() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const training = useLiveQuery(async () => (await db.trainings.get(id)) ?? null, [id])
  const [phase, setPhase] = useState<Phase>('pick')
  const [exercise, setExercise] = useState<Exercise | null>(null)

  // normal y rest pause
  const [sets, setSets] = useState(3)
  const [target, setTarget] = useState<RepTarget>({ kind: 'range', min: 8, max: 10 })
  const [restSec, setRestSec] = useState(120)
  const [restPauseSec, setRestPauseSec] = useState(20)
  // jumpset
  const [jump, setJump] = useState<{ exercise: Exercise; target: RepTarget; restSec: number }[]>([])
  const [rounds, setRounds] = useState(3)

  if (!training) return null
  const back = () => navigate(`/gym/entrenamiento/${training.id}`)

  async function append(item: NormalItem | RestPauseItem | JumpSetItem) {
    if (!training) return
    await saveItems(db, training.id, [...training.items, item])
    back()
  }

  const goBack: Record<Phase, () => void> = {
    pick: back,
    mode: () => setPhase('pick'),
    normal: () => setPhase('mode'),
    protocol: () => setPhase('mode'),
    restpause: () => setPhase('protocol'),
    jump: () => setPhase('protocol'),
    jumppick: () => setPhase('jump'),
  }
  const titles: Record<Phase, string> = {
    pick: 'Agregar ejercicio',
    mode: exercise?.name ?? 'Modo',
    normal: exercise?.name ?? 'Normal',
    protocol: 'Protocolo',
    restpause: 'Rest pause',
    jump: 'JumpSet',
    jumppick: 'Otro ejercicio del JumpSet',
  }

  return (
    <>
      <TopBar
        title={titles[phase]}
        subtitle={
          exercise && phase !== 'pick' && phase !== 'jumppick'
            ? groupLabel(exercise.group)
            : undefined
        }
        onBack={goBack[phase]}
      />
      <div className="scroll">
        {phase === 'pick' && (
          <ExercisePicker
            onPick={(e) => {
              setExercise(e)
              setPhase('mode')
            }}
          />
        )}

        {phase === 'jumppick' && (
          <ExercisePicker
            onPick={(e) => {
              setJump((j) => [
                ...j,
                { exercise: e, target: { kind: 'fixed', reps: 10 }, restSec: 30 },
              ])
              setPhase('jump')
            }}
          />
        )}

        {phase === 'mode' && (
          <div className="stack">
            <button className="card tap" onClick={() => setPhase('normal')}>
              <div className="t1">Normal</div>
              <div className="t2">Series y repeticiones, como una rutina común.</div>
            </button>
            <button className="card tap" onClick={() => setPhase('protocol')}>
              <div className="t1">Protocolo</div>
              <div className="t2">Una forma especial de trabajo, como JumpSet o rest pause.</div>
            </button>
          </div>
        )}

        {phase === 'protocol' && (
          <div className="stack">
            <button
              className="card tap"
              onClick={() => {
                if (exercise)
                  setJump([{ exercise, target: { kind: 'fixed', reps: 10 }, restSec: 30 }])
                setPhase('jump')
              }}
            >
              <div className="t1">JumpSet</div>
              <div className="t2">
                Dos o tres ejercicios que se alternan por rondas, cada uno con su descanso.
              </div>
            </button>
            <button className="card tap" onClick={() => setPhase('restpause')}>
              <div className="t1">Rest pause</div>
              <div className="t2">
                En la última serie, un descanso corto y el mismo peso hasta el fallo, una sola vez.
              </div>
            </button>
          </div>
        )}

        {(phase === 'normal' || phase === 'restpause') && exercise && (
          <div className="stack">
            <Stepper label="Series" value={sets} step={1} min={1} max={12} onChange={setSets} />
            <TargetEditor
              value={target}
              onChange={setTarget}
              unit={exercise.load === 'time' ? 'Segundos' : 'Repeticiones'}
            />
            <RestField label="Descanso entre series" value={restSec} onChange={setRestSec} />
            {phase === 'restpause' && (
              <>
                <RestField
                  label="Descanso del rest pause"
                  value={restPauseSec}
                  onChange={setRestPauseSec}
                  step={5}
                  min={5}
                />
                <div className="card t2">
                  La última serie se hace hasta el fallo. Después de {restPauseSec} segundos, se
                  vuelve a levantar el mismo peso hasta el fallo, una sola vez.
                </div>
              </>
            )}
          </div>
        )}

        {phase === 'jump' && (
          <div className="stack">
            <Stepper label="Rondas" value={rounds} step={1} min={1} max={8} onChange={setRounds} />
            {jump.map((s, i) => (
              <div className="card stack" key={`${s.exercise.id}-${i}`}>
                <div className="row">
                  <span className="chip">{i + 1}</span>
                  <div className="t1 grow">{s.exercise.name}</div>
                  {jump.length > 2 && i > 0 && (
                    <button
                      className="iconbtn"
                      aria-label="Quitar"
                      onClick={() => setJump((j) => j.filter((_, k) => k !== i))}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <TargetEditor
                  value={s.target}
                  onChange={(t) =>
                    setJump((j) => j.map((x, k) => (k === i ? { ...x, target: t } : x)))
                  }
                />
                <RestField
                  label={
                    i === jump.length - 1
                      ? 'Descanso al cerrar la ronda'
                      : 'Descanso hasta el siguiente'
                  }
                  value={s.restSec}
                  onChange={(v) =>
                    setJump((j) => j.map((x, k) => (k === i ? { ...x, restSec: v } : x)))
                  }
                />
              </div>
            ))}
            {jump.length < 3 && (
              <button className="btn small" onClick={() => setPhase('jumppick')}>
                + Agregar otro ejercicio al JumpSet
              </button>
            )}
          </div>
        )}
      </div>

      {(phase === 'normal' || phase === 'restpause' || phase === 'jump') && exercise && (
        <div className="bottom">
          <button
            className="btn primary"
            disabled={phase === 'jump' && jump.length < 2}
            onClick={() => {
              if (phase === 'normal')
                void append({
                  id: newId(),
                  kind: 'normal',
                  exerciseId: exercise.id,
                  sets,
                  target,
                  restSec,
                })
              if (phase === 'restpause')
                void append({
                  id: newId(),
                  kind: 'restpause',
                  exerciseId: exercise.id,
                  sets,
                  target,
                  restSec,
                  restPauseSec,
                })
              if (phase === 'jump')
                void append({
                  id: newId(),
                  kind: 'jumpset',
                  rounds,
                  steps: jump.map((s) => ({
                    exerciseId: s.exercise.id,
                    target: s.target,
                    restSec: s.restSec,
                  })),
                })
            }}
          >
            Agregar al entrenamiento
          </button>
          {phase === 'jump' && jump.length < 2 && (
            <div className="hint">Un JumpSet necesita al menos dos ejercicios.</div>
          )}
        </div>
      )}
    </>
  )
}
