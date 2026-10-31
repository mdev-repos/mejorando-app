import type { MuscleGroupId } from './muscles'

export type Equipment = 'barra' | 'mancuernas' | 'maquina' | 'polea' | 'peso-corporal' | 'otro'
export type LoadKind = 'external' | 'bodyweight' | 'time'

export interface Exercise {
  id: string
  name: string
  group: MuscleGroupId
  equipment: Equipment
  load: LoadKind
  custom?: boolean
}

/** Qué se pide por serie. "failure" es llegar al fallo, sin repeticiones fijas. */
export type RepTarget =
  | { kind: 'fixed'; reps: number }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'failure' }

interface ItemBase {
  id: string
}

/** Un ejercicio con series y repeticiones, como en una rutina común. */
export interface NormalItem extends ItemBase {
  kind: 'normal'
  exerciseId: string
  sets: number
  target: RepTarget
  restSec: number
}

/** Rest pause, en la última serie y una sola vez, con el mismo peso. */
export interface RestPauseItem extends ItemBase {
  kind: 'restpause'
  exerciseId: string
  sets: number
  target: RepTarget
  restSec: number
  restPauseSec: number
}

export interface JumpStep {
  exerciseId: string
  target: RepTarget
  /** Descanso que sigue a este ejercicio dentro de la ronda. */
  restSec: number
}

/** Dos o tres ejercicios que se alternan por rondas. */
export interface JumpSetItem extends ItemBase {
  kind: 'jumpset'
  rounds: number
  steps: JumpStep[]
}

export type PlanItem = NormalItem | RestPauseItem | JumpSetItem

export interface Training {
  id: string
  name: string
  items: PlanItem[]
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

export type SetKind = 'approach' | 'effective'

export interface SetLog {
  id: string
  sessionId: string
  itemId: string
  exerciseId: string
  kind: SetKind
  /** Número de serie (o de ronda en un JumpSet), desde 1. En aproximación es el orden de la fila. */
  setIndex: number
  weight: number
  reps: number
  /** Repeticiones del tramo de rest pause, si lo hubo. */
  extraReps?: number
  at: number
}

export type SessionStatus = 'active' | 'done'

export interface Session {
  id: string
  trainingId: string
  trainingName: string
  /** Copia del plan al empezar, para que editar el entrenamiento no rompa una sesión en curso. */
  plan: PlanItem[]
  startedAt: number
  endedAt?: number
  status: SessionStatus
  stepIndex: number
  restEndAt: number | null
  restTotalSec: number
}
