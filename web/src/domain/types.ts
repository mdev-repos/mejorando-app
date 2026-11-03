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
  /** Una cantidad por serie, por ejemplo 10 | 8 | 6 | 4 en un escalonado. */
  | { kind: 'sequence'; reps: number[] }

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

/** Un período largo, por ejemplo "Principiante", que agrupa mesociclos. */
export interface Macrocycle {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

export type RoutineMode = 'simple' | 'advanced'

/**
 * Una rutina con sus días, por ejemplo "PPL". Cada día se hace la misma cantidad de veces,
 * que son las ejecuciones, para poder medir el progreso de manera pareja.
 */
export interface Mesocycle {
  id: string
  macroId: string
  name: string
  order: number
  mode: RoutineMode
  executions: number
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

/** Un día de la rutina, por ejemplo "Push". */
export interface Training {
  id: string
  mesoId: string
  name: string
  order: number
  /** Los ejercicios de la primera ejecución, y de las demás si no se personalizan. */
  items: PlanItem[]
  /** En una rutina avanzada, las ejecuciones que difieren de la primera. */
  executionItems?: Record<number, PlanItem[]>
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

/** Lo que cada persona ajusta de un ejercicio, como cuánto peso sube en cada toque. */
export interface ExerciseSettings {
  exerciseId: string
  weightStep: number
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
  /** Repeticiones con falla de técnica, que se suman aparte de las buenas. Una serie de 8 + 3 guarda reps 8 y techReps 3. */
  techReps?: number
  /** Repeticiones del tramo de rest pause, si lo hubo. */
  extraReps?: number
  at: number
}

export type SessionStatus = 'active' | 'done'

/** Lo que se había cargado en un paso que se deshizo, para que quien corrige no empiece de cero. */
export interface RedoData {
  /** El paso al que se volvió. Si el paso actual es otro, estos datos ya no valen. */
  stepIndex: number
  logs: { kind: SetKind; setIndex: number; weight: number; reps: number; techReps?: number }[]
  extraReps?: number
}

export interface Session {
  id: string
  trainingId: string
  trainingName: string
  mesoId: string
  mesoName: string
  /** Número de ejecución de este día, desde 1, y cuántas tiene el mesociclo. */
  execution: number
  executionsTotal: number
  /** Copia del plan al empezar, para que editar el entrenamiento no rompa una sesión en curso. */
  plan: PlanItem[]
  startedAt: number
  endedAt?: number
  status: SessionStatus
  stepIndex: number
  restEndAt: number | null
  restTotalSec: number
  redo?: RedoData
}
