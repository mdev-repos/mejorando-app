import { SEED_EXERCISES } from '../domain/catalog'
import { advance, buildSteps, isFinished, type FlowState, type Step } from '../domain/session'
import type {
  Exercise,
  Macrocycle,
  Mesocycle,
  PlanItem,
  RoutineMode,
  Session,
  SetKind,
  SetLog,
  Training,
} from '../domain/types'
import { newId, type MejorAndoDB } from './db'

/** Carga o actualiza el catálogo base. Es seguro repetirlo, aunque dos arranques coincidan. */
export async function seedCatalog(db: MejorAndoDB): Promise<void> {
  await db.exercises.bulkPut(SEED_EXERCISES)
}

/* ---------- macrociclos, mesociclos y días ---------- */

export async function createMacro(
  db: MejorAndoDB,
  name: string,
  now = Date.now(),
): Promise<Macrocycle> {
  const macro: Macrocycle = { id: newId(), name, createdAt: now, updatedAt: now }
  await db.macrocycles.add(macro)
  return macro
}

export async function renameMacro(db: MejorAndoDB, id: string, name: string): Promise<void> {
  await db.macrocycles.update(id, { name, updatedAt: Date.now() })
}

export async function deleteMacro(db: MejorAndoDB, id: string): Promise<void> {
  await db.macrocycles.update(id, { deletedAt: Date.now() })
}

export async function createMeso(
  db: MejorAndoDB,
  macroId: string,
  name: string,
  opts: { mode?: RoutineMode; executions?: number } = {},
  now = Date.now(),
): Promise<Mesocycle> {
  const order = await db.mesocycles
    .where('macroId')
    .equals(macroId)
    .filter((m) => !m.deletedAt)
    .count()
  const meso: Mesocycle = {
    id: newId(),
    macroId,
    name,
    order,
    mode: opts.mode ?? 'simple',
    executions: opts.executions ?? 4,
    createdAt: now,
    updatedAt: now,
  }
  await db.mesocycles.add(meso)
  return meso
}

export async function updateMeso(
  db: MejorAndoDB,
  id: string,
  patch: Partial<Pick<Mesocycle, 'name' | 'mode' | 'executions' | 'order'>>,
): Promise<void> {
  await db.mesocycles.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteMeso(db: MejorAndoDB, id: string): Promise<void> {
  await db.mesocycles.update(id, { deletedAt: Date.now() })
}

export async function createDay(
  db: MejorAndoDB,
  mesoId: string,
  name: string,
  now = Date.now(),
): Promise<Training> {
  const order = await db.trainings
    .where('mesoId')
    .equals(mesoId)
    .filter((t) => !t.deletedAt)
    .count()
  const day: Training = {
    id: newId(),
    mesoId,
    name,
    order,
    items: [],
    createdAt: now,
    updatedAt: now,
  }
  await db.trainings.add(day)
  return day
}

export async function renameDay(db: MejorAndoDB, id: string, name: string): Promise<void> {
  await db.trainings.update(id, { name, updatedAt: Date.now() })
}

export async function deleteDay(db: MejorAndoDB, id: string): Promise<void> {
  await db.trainings.update(id, { deletedAt: Date.now() })
}

export async function swapDayOrder(db: MejorAndoDB, a: Training, b: Training): Promise<void> {
  await db.transaction('rw', db.trainings, async () => {
    await db.trainings.update(a.id, { order: b.order })
    await db.trainings.update(b.id, { order: a.order })
  })
}

/** Los ejercicios de un día en una ejecución. Solo una rutina avanzada puede tener ejecuciones distintas. */
export function itemsFor(day: Training, execution: number, mode: RoutineMode): PlanItem[] {
  if (mode === 'advanced' && execution > 1) return day.executionItems?.[execution] ?? day.items
  return day.items
}

/** Guarda los ejercicios de una ejecución. La primera es la base de las demás. */
export async function saveItems(
  db: MejorAndoDB,
  dayId: string,
  items: PlanItem[],
  execution = 1,
  now = Date.now(),
): Promise<void> {
  if (execution <= 1) {
    await db.trainings.update(dayId, { items, updatedAt: now })
    return
  }
  const day = await db.trainings.get(dayId)
  if (!day) return
  await db.trainings.update(dayId, {
    executionItems: { ...day.executionItems, [execution]: items },
    updatedAt: now,
  })
}

/** Vuelve a una ejecución a usar los mismos ejercicios que la primera. */
export async function clearExecution(
  db: MejorAndoDB,
  dayId: string,
  execution: number,
): Promise<void> {
  const day = await db.trainings.get(dayId)
  if (!day?.executionItems) return
  const { [execution]: _quitada, ...rest } = day.executionItems
  void _quitada
  await db.trainings.update(dayId, { executionItems: rest, updatedAt: Date.now() })
}

export interface ExecutionStatus {
  execution: number
  state: 'done' | 'active' | 'pending'
  sessionId?: string
}

/** Qué ejecuciones de un día ya se hicieron, cuál está en curso y cuáles faltan. */
export async function executionStatus(
  db: MejorAndoDB,
  dayId: string,
  total: number,
): Promise<ExecutionStatus[]> {
  const sessions = await db.sessions.where('trainingId').equals(dayId).toArray()
  return Array.from({ length: total }, (_, i) => {
    const execution = i + 1
    const done = sessions.find((s) => s.execution === execution && s.status === 'done')
    if (done) return { execution, state: 'done', sessionId: done.id }
    const active = sessions.find((s) => s.execution === execution && s.status === 'active')
    if (active) return { execution, state: 'active', sessionId: active.id }
    return { execution, state: 'pending' }
  })
}

/** El peso que sube cada toque para un ejercicio, o undefined si no se ajustó. */
export async function setWeightStep(
  db: MejorAndoDB,
  exerciseId: string,
  weightStep: number,
): Promise<void> {
  await db.exerciseSettings.put({ exerciseId, weightStep })
}

export async function createExercise(
  db: MejorAndoDB,
  data: Omit<Exercise, 'id' | 'custom'>,
): Promise<Exercise> {
  const exercise: Exercise = { ...data, id: newId(), custom: true }
  await db.exercises.add(exercise)
  return exercise
}

export async function startSession(
  db: MejorAndoDB,
  day: Training,
  meso: Mesocycle,
  execution: number,
  now = Date.now(),
): Promise<Session> {
  const session: Session = {
    id: newId(),
    trainingId: day.id,
    trainingName: day.name,
    mesoId: meso.id,
    mesoName: meso.name,
    execution,
    executionsTotal: meso.executions,
    plan: structuredClone(itemsFor(day, execution, meso.mode)),
    startedAt: now,
    status: 'active',
    stepIndex: 0,
    restEndAt: null,
    restTotalSec: 0,
  }
  await db.sessions.add(session)
  return session
}

export function flowOf(session: Session): FlowState {
  return {
    stepIndex: session.stepIndex,
    restEndAt: session.restEndAt,
    restTotalSec: session.restTotalSec,
  }
}

export async function saveFlow(db: MejorAndoDB, sessionId: string, flow: FlowState): Promise<void> {
  await db.sessions.update(sessionId, { ...flow })
}

export type NewLog = Pick<SetLog, 'weight' | 'reps' | 'setIndex'> & { kind: SetKind }

/**
 * Cierra el paso actual de la sesión. Guarda lo que se hizo y avanza, todo junto,
 * así si la app se cierra a mitad de camino no queda nada a medias.
 */
export async function completeStep(
  db: MejorAndoDB,
  sessionId: string,
  steps: Step[],
  input: { logs?: NewLog[]; extraReps?: number },
  now = Date.now(),
): Promise<Session> {
  return db.transaction('rw', db.sessions, db.sets, async () => {
    const session = await db.sessions.get(sessionId)
    if (!session) throw new Error('Sesión inexistente')
    const step = steps[session.stepIndex]
    if (!step) return session

    if (step.type === 'restpause') {
      const logs = await db.sets
        .where('sessionId')
        .equals(sessionId)
        .filter(
          (l) => l.itemId === step.itemId && l.kind === 'effective' && l.setIndex === step.setIndex,
        )
        .toArray()
      const target = logs[0]
      if (target) await db.sets.update(target.id, { extraReps: input.extraReps ?? 0 })
    } else if (input.logs?.length) {
      const exerciseId = step.exerciseId
      const itemId = step.type === 'approach' ? `approach:${step.group}` : step.itemId
      await db.sets.bulkAdd(
        input.logs.map((l, i) => ({
          id: newId(),
          sessionId,
          itemId,
          exerciseId,
          kind: l.kind,
          setIndex: l.setIndex,
          weight: l.weight,
          reps: l.reps,
          at: now + i,
        })),
      )
    }

    const next = advance(flowOf(session), steps, now)
    const patch: Partial<Session> = { ...next }
    if (isFinished(next, steps)) {
      patch.status = 'done'
      patch.endedAt = now
    }
    await db.sessions.update(sessionId, patch)
    return { ...session, ...patch }
  })
}

export async function finishSession(
  db: MejorAndoDB,
  sessionId: string,
  now = Date.now(),
): Promise<void> {
  await db.sessions.update(sessionId, {
    status: 'done',
    endedAt: now,
    restEndAt: null,
    restTotalSec: 0,
  })
}

/** Las series de la vez anterior que se hizo este ejercicio, ordenadas por número de serie. */
export async function previousSets(
  db: MejorAndoDB,
  exerciseId: string,
  kind: SetKind,
  excludeSessionId: string,
): Promise<SetLog[]> {
  const logs = await db.sets.where('[exerciseId+kind]').equals([exerciseId, kind]).toArray()
  const bySession = new Map<string, SetLog[]>()
  for (const l of logs) {
    if (l.sessionId === excludeSessionId) continue
    const list = bySession.get(l.sessionId) ?? []
    list.push(l)
    bySession.set(l.sessionId, list)
  }
  if (!bySession.size) return []
  const sessions = await db.sessions.bulkGet([...bySession.keys()])
  let latest: { id: string; startedAt: number } | undefined
  for (const s of sessions) {
    if (s && (!latest || s.startedAt > latest.startedAt))
      latest = { id: s.id, startedAt: s.startedAt }
  }
  if (!latest) return []
  return (bySession.get(latest.id) ?? []).sort((a, b) => a.setIndex - b.setIndex)
}

export function stepsOf(session: Session, exercises: Exercise[]): Step[] {
  const map = new Map(exercises.map((e) => [e.id, e]))
  return buildSteps(session.plan, (id) => map.get(id))
}
