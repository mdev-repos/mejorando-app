import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useExercises } from '../../app/data'
import { ModuleIcon } from '../../brand/Logo'
import { db, newId } from '../../db/db'
import { createExercise, itemsFor, saveItems } from '../../db/queries'
import { MUSCLE_GROUPS, groupLabel, type MuscleGroupId } from '../../domain/muscles'
import { JUMP_REST_PRESETS, escalonado, formatRest, formatTarget } from '../../domain/targets'
import type {
  Exercise,
  JumpSetItem,
  Mesocycle,
  NormalItem,
  PlanItem,
  RepTarget,
  RestPauseItem,
  Training,
} from '../../domain/types'
import { GroupThumb, RestPicker, Stepper, TopBar } from '../../ui/components'

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
          <button
            key={e.id}
            className="card tap"
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
            onClick={() => props.onPick(e)}
          >
            <GroupThumb group={e.group} exerciseId={e.id} />
            <div className="grow">
              <div className="t1">{e.name}</div>
              <div className="t2">{e.custom ? 'Propio' : e.equipment}</div>
            </div>
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

type Phase =
  'pick' | 'mode' | 'normal' | 'protocol' | 'restpause' | 'escalonado' | 'jump' | 'jumppick'

type Lookup = (id: string) => Exercise | undefined

interface Initial {
  phase: Phase
  exercise: Exercise
  sets: number
  target: RepTarget
  restSec: number
  restPauseSec: number
  jump: { exercise: Exercise; target: RepTarget; restSec: number }[]
  rounds: number
  escSets: number
  escFirst: number
  escStep: number
}

const DEFAULTS = {
  sets: 3,
  target: { kind: 'range', min: 8, max: 10 } as RepTarget,
  restSec: 120,
  restPauseSec: 20,
  jump: [] as Initial['jump'],
  rounds: 3,
  escSets: 4,
  escFirst: 10,
  escStep: -2,
}

/** Los valores con los que arranca el formulario al editar un ejercicio ya cargado. */
function initialFrom(item: PlanItem, byId: Lookup): Initial | undefined {
  if (item.kind === 'jumpset') {
    const jump = item.steps.flatMap((s) => {
      const exercise = byId(s.exerciseId)
      return exercise ? [{ exercise, target: s.target, restSec: s.restSec }] : []
    })
    const first = jump[0]
    if (!first || jump.length < item.steps.length) return undefined
    return { ...DEFAULTS, phase: 'jump', exercise: first.exercise, jump, rounds: item.rounds }
  }
  const exercise = byId(item.exerciseId)
  if (!exercise) return undefined
  if (item.kind === 'restpause') {
    return {
      ...DEFAULTS,
      phase: 'restpause',
      exercise,
      sets: item.sets,
      target: item.target,
      restSec: item.restSec,
      restPauseSec: item.restPauseSec,
    }
  }
  if (item.target.kind === 'sequence') {
    const reps = item.target.reps
    return {
      ...DEFAULTS,
      phase: 'escalonado',
      exercise,
      restSec: item.restSec,
      escSets: item.sets,
      escFirst: reps[0] ?? DEFAULTS.escFirst,
      escStep: reps.length > 1 ? (reps[1] ?? 0) - (reps[0] ?? 0) : DEFAULTS.escStep,
    }
  }
  return {
    ...DEFAULTS,
    phase: 'normal',
    exercise,
    sets: item.sets,
    target: item.target,
    restSec: item.restSec,
  }
}

/** Agrega un ejercicio al día, o edita uno ya cargado si la dirección trae ?item=. */
export function AddItem() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const day = useLiveQuery(async () => (await db.trainings.get(id)) ?? null, [id])
  const meso = useLiveQuery(
    async () => (day ? await db.mesocycles.get(day.mesoId) : undefined),
    [day?.mesoId],
  )
  const { list, byId } = useExercises()
  if (!day || !meso || list.length === 0) return null
  const execution = Math.min(Math.max(Number(params.get('e')) || 1, 1), meso.executions)
  const itemId = params.get('item')
  const editing = itemId
    ? itemsFor(day, execution, meso.mode).find((i) => i.id === itemId)
    : undefined
  return (
    <ItemForm
      key={editing?.id ?? 'nuevo'}
      day={day}
      meso={meso}
      execution={execution}
      editing={editing}
      byId={byId}
    />
  )
}

function ItemForm(props: {
  day: Training
  meso: Mesocycle
  execution: number
  editing: PlanItem | undefined
  byId: Lookup
}) {
  const { day, meso, execution, editing } = props
  const navigate = useNavigate()
  const init = editing ? initialFrom(editing, props.byId) : undefined
  const [phase, setPhase] = useState<Phase>(init?.phase ?? 'pick')
  const [exercise, setExercise] = useState<Exercise | null>(init?.exercise ?? null)

  // normal y rest pause
  const [sets, setSets] = useState(init?.sets ?? DEFAULTS.sets)
  const [target, setTarget] = useState<RepTarget>(init?.target ?? DEFAULTS.target)
  const [restSec, setRestSec] = useState(init?.restSec ?? DEFAULTS.restSec)
  const [restPauseSec, setRestPauseSec] = useState(init?.restPauseSec ?? DEFAULTS.restPauseSec)
  // jumpset
  const [jump, setJump] = useState(init?.jump ?? DEFAULTS.jump)
  const [rounds, setRounds] = useState(init?.rounds ?? DEFAULTS.rounds)
  // escalonado
  const [escSets, setEscSets] = useState(init?.escSets ?? DEFAULTS.escSets)
  const [escFirst, setEscFirst] = useState(init?.escFirst ?? DEFAULTS.escFirst)
  const [escStep, setEscStep] = useState(init?.escStep ?? DEFAULTS.escStep)

  const simple = meso.mode === 'simple'
  const back = () => navigate(`/gym/dia/${day.id}${execution > 1 ? `?e=${execution}` : ''}`)

  /** Agrega el ejercicio al final, o reemplaza el que se está editando en su mismo lugar. */
  async function append(item: NormalItem | RestPauseItem | JumpSetItem) {
    const current = itemsFor(day, execution, meso.mode)
    const next = editing ? current.map((i) => (i.id === editing.id ? item : i)) : [...current, item]
    await saveItems(db, day.id, next, execution)
    back()
  }
  const itemId = editing?.id ?? newId()

  // al editar, el formulario es la pantalla de partida y el selector solo sirve para cambiar el ejercicio
  const goBack: Record<Phase, () => void> = {
    pick: init ? () => setPhase(init.phase) : back,
    mode: () => setPhase('pick'),
    normal: init ? back : () => setPhase(simple ? 'pick' : 'mode'),
    protocol: () => setPhase('mode'),
    restpause: init ? back : () => setPhase('protocol'),
    escalonado: init ? back : () => setPhase('protocol'),
    jump: init ? back : () => setPhase('protocol'),
    jumppick: () => setPhase('jump'),
  }
  const titles: Record<Phase, string> = {
    pick: init ? 'Cambiar ejercicio' : 'Agregar ejercicio',
    mode: exercise?.name ?? 'Modo',
    normal: exercise?.name ?? 'Normal',
    protocol: 'Protocolo',
    restpause: 'Rest pause',
    escalonado: 'Escalonado',
    jump: 'JumpSet',
    jumppick: 'Otro ejercicio del JumpSet',
  }

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
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
              setPhase(init ? init.phase : simple ? 'normal' : 'mode')
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
            <button className="card tap" onClick={() => setPhase('escalonado')}>
              <div className="t1">Escalonado</div>
              <div className="t2">
                Las repeticiones bajan (o suben) en cada serie, por ejemplo 10, 8, 6 y 4.
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

        {init && init.phase !== 'jump' && phase !== 'pick' && phase !== 'jump' && exercise && (
          <button
            className="btn small"
            style={{ marginBottom: 12 }}
            onClick={() => setPhase('pick')}
          >
            Cambiar ejercicio
          </button>
        )}

        {(phase === 'normal' || phase === 'restpause') && exercise && (
          <div className="stack">
            <Stepper label="Series" value={sets} step={1} min={1} max={12} onChange={setSets} />
            <TargetEditor
              value={target}
              onChange={setTarget}
              unit={exercise.load === 'time' ? 'Segundos' : 'Repeticiones'}
            />
            <RestPicker label="Descanso entre series" value={restSec} onChange={setRestSec} />
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

        {phase === 'escalonado' && exercise && (
          <div className="stack">
            <Stepper
              label="Series"
              value={escSets}
              step={1}
              min={2}
              max={10}
              onChange={setEscSets}
            />
            <Stepper
              label="Repeticiones de la primera"
              value={escFirst}
              step={1}
              min={1}
              max={30}
              onChange={setEscFirst}
            />
            <Stepper
              label="Cambio en cada serie"
              value={escStep}
              step={1}
              min={-10}
              max={10}
              onChange={setEscStep}
            />
            <div className="note">
              Quedan {formatTarget(escalonado(escSets, escFirst, escStep))}
            </div>
            <RestPicker label="Descanso entre series" value={restSec} onChange={setRestSec} />
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
                <RestPicker
                  label={
                    i === jump.length - 1
                      ? 'Descanso al cerrar la ronda'
                      : 'Descanso hasta el siguiente'
                  }
                  value={s.restSec}
                  onChange={(v) =>
                    setJump((j) => j.map((x, k) => (k === i ? { ...x, restSec: v } : x)))
                  }
                  presets={JUMP_REST_PRESETS}
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

      {(phase === 'normal' ||
        phase === 'restpause' ||
        phase === 'escalonado' ||
        phase === 'jump') &&
        exercise && (
          <div className="bottom">
            <button
              className="btn primary"
              disabled={phase === 'jump' && jump.length < 2}
              onClick={() => {
                if (phase === 'normal')
                  void append({
                    id: itemId,
                    kind: 'normal',
                    exerciseId: exercise.id,
                    sets,
                    target,
                    restSec,
                  })
                if (phase === 'escalonado')
                  void append({
                    id: itemId,
                    kind: 'normal',
                    exerciseId: exercise.id,
                    sets: escSets,
                    target: escalonado(escSets, escFirst, escStep),
                    restSec,
                  })
                if (phase === 'restpause')
                  void append({
                    id: itemId,
                    kind: 'restpause',
                    exerciseId: exercise.id,
                    sets,
                    target,
                    restSec,
                    restPauseSec,
                  })
                if (phase === 'jump')
                  void append({
                    id: itemId,
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
              {editing ? 'Guardar cambios' : 'Agregar al entrenamiento'}
            </button>
            {phase === 'jump' && jump.length < 2 && (
              <div className="hint">Un JumpSet necesita al menos dos ejercicios.</div>
            )}
          </div>
        )}
    </>
  )
}
