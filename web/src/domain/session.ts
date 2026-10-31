import type { MuscleGroupId } from './muscles'
import { targetForSet } from './targets'
import type { Exercise, PlanItem, RepTarget } from './types'

/** Un paso de la sesión guiada. Después de cada paso puede venir un descanso (restAfterSec). */
export type Step =
  | {
      type: 'approach'
      group: MuscleGroupId
      exerciseId: string
      itemIndex: number
      restAfterSec: 0
    }
  | {
      type: 'set'
      itemId: string
      itemIndex: number
      exerciseId: string
      setIndex: number
      totalSets: number
      target: RepTarget
      /** Es la última serie de un rest pause, así que sigue el tramo extra. */
      restPauseNext: boolean
      restAfterSec: number
    }
  | {
      type: 'restpause'
      itemId: string
      itemIndex: number
      exerciseId: string
      setIndex: number
      restAfterSec: number
    }
  | {
      type: 'jump'
      itemId: string
      itemIndex: number
      exerciseId: string
      round: number
      rounds: number
      stepIndex: number
      stepsTotal: number
      target: RepTarget
      restAfterSec: number
    }

export type ExerciseLookup = (id: string) => Exercise | undefined

/**
 * Convierte el plan en la lista de pasos que se recorren entrenando.
 * Al empezar cada grupo muscular hay un paso de aproximación.
 */
export function buildSteps(items: PlanItem[], lookup: ExerciseLookup): Step[] {
  const steps: Step[] = []
  let previousGroup: MuscleGroupId | undefined

  items.forEach((item, itemIndex) => {
    const firstId = item.kind === 'jumpset' ? item.steps[0]?.exerciseId : item.exerciseId
    const group = firstId ? lookup(firstId)?.group : undefined
    if (firstId && group && group !== previousGroup) {
      steps.push({ type: 'approach', group, exerciseId: firstId, itemIndex, restAfterSec: 0 })
    }
    previousGroup = group

    if (item.kind === 'normal' || item.kind === 'restpause') {
      for (let i = 1; i <= item.sets; i++) {
        const last = i === item.sets
        const restPauseNext = item.kind === 'restpause' && last
        steps.push({
          type: 'set',
          itemId: item.id,
          itemIndex,
          exerciseId: item.exerciseId,
          setIndex: i,
          totalSets: item.sets,
          target: targetForSet(item.target, i),
          restPauseNext,
          restAfterSec: restPauseNext ? item.restPauseSec : item.restSec,
        })
      }
      if (item.kind === 'restpause') {
        steps.push({
          type: 'restpause',
          itemId: item.id,
          itemIndex,
          exerciseId: item.exerciseId,
          setIndex: item.sets,
          restAfterSec: item.restSec,
        })
      }
    } else {
      for (let round = 1; round <= item.rounds; round++) {
        item.steps.forEach((s, stepIndex) => {
          steps.push({
            type: 'jump',
            itemId: item.id,
            itemIndex,
            exerciseId: s.exerciseId,
            round,
            rounds: item.rounds,
            stepIndex,
            stepsTotal: item.steps.length,
            target: s.target,
            restAfterSec: s.restSec,
          })
        })
      }
    }
  })

  return steps
}

export interface FlowState {
  stepIndex: number
  restEndAt: number | null
  restTotalSec: number
}

export function initialFlow(): FlowState {
  return { stepIndex: 0, restEndAt: null, restTotalSec: 0 }
}

export function isFinished(state: FlowState, steps: Step[]): boolean {
  return state.stepIndex >= steps.length
}

/** Se llama al terminar el paso actual. Si corresponde, arranca el descanso. */
export function advance(state: FlowState, steps: Step[], now: number): FlowState {
  const step = steps[state.stepIndex]
  const next = state.stepIndex + 1
  const rest = step?.restAfterSec ?? 0
  if (next >= steps.length || rest <= 0) {
    return { stepIndex: next, restEndAt: null, restTotalSec: 0 }
  }
  return { stepIndex: next, restEndAt: now + rest * 1000, restTotalSec: rest }
}

export function skipRest(state: FlowState): FlowState {
  return { ...state, restEndAt: null, restTotalSec: 0 }
}

export function adjustRest(state: FlowState, deltaSec: number, now: number): FlowState {
  if (state.restEndAt === null) return state
  const restEndAt = Math.max(now, state.restEndAt + deltaSec * 1000)
  return { ...state, restEndAt, restTotalSec: Math.max(1, state.restTotalSec + deltaSec) }
}

/** El tiempo se calcula con la hora de fin, así sigue bien aunque la pantalla se bloquee. */
export function restRemainingMs(restEndAt: number, now: number): number {
  return Math.max(0, restEndAt - now)
}

export function restRemainingSec(restEndAt: number, now: number): number {
  return Math.ceil(restRemainingMs(restEndAt, now) / 1000)
}

/** Cantidad de ejercicios (items del plan) ya terminados antes del paso actual. */
export function itemsDone(state: FlowState, steps: Step[]): number {
  const current = steps[state.stepIndex]
  if (!current) return new Set(steps.map((s) => s.itemIndex)).size
  return current.itemIndex
}
