import { SEED_EXERCISES } from '../domain/catalog'
import { advance, buildSteps, isFinished, type FlowState, type Step } from '../domain/session'
import type { Exercise, PlanItem, Session, SetKind, SetLog, Training } from '../domain/types'
import { newId, type CaminoDB } from './db'

/** Carga o actualiza el catálogo base. Es seguro repetirlo, aunque dos arranques coincidan. */
export async function seedCatalog(db: CaminoDB): Promise<void> {
  await db.exercises.bulkPut(SEED_EXERCISES)
}

export async function createTraining(
  db: CaminoDB,
  name: string,
  now = Date.now(),
): Promise<Training> {
  const training: Training = { id: newId(), name, items: [], createdAt: now, updatedAt: now }
  await db.trainings.add(training)
  return training
}

export async function saveItems(
  db: CaminoDB,
  trainingId: string,
  items: PlanItem[],
  now = Date.now(),
): Promise<void> {
  await db.trainings.update(trainingId, { items, updatedAt: now })
}

export async function renameTraining(db: CaminoDB, id: string, name: string): Promise<void> {
  await db.trainings.update(id, { name, updatedAt: Date.now() })
}

export async function deleteTraining(db: CaminoDB, id: string): Promise<void> {
  await db.trainings.update(id, { deletedAt: Date.now() })
}

export async function createExercise(
  db: CaminoDB,
  data: Omit<Exercise, 'id' | 'custom'>,
): Promise<Exercise> {
  const exercise: Exercise = { ...data, id: newId(), custom: true }
  await db.exercises.add(exercise)
  return exercise
}

export async function startSession(
  db: CaminoDB,
  training: Training,
  now = Date.now(),
): Promise<Session> {
  const session: Session = {
    id: newId(),
    trainingId: training.id,
    trainingName: training.name,
    plan: structuredClone(training.items),
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

export async function saveFlow(db: CaminoDB, sessionId: string, flow: FlowState): Promise<void> {
  await db.sessions.update(sessionId, { ...flow })
}

export type NewLog = Pick<SetLog, 'weight' | 'reps' | 'setIndex'> & { kind: SetKind }

/**
 * Cierra el paso actual de la sesión. Guarda lo que se hizo y avanza, todo junto,
 * así si la app se cierra a mitad de camino no queda nada a medias.
 */
export async function completeStep(
  db: CaminoDB,
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
  db: CaminoDB,
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
  db: CaminoDB,
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
