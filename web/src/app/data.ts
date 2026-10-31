import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/db'
import { setWeightStep } from '../db/queries'
import { defaultWeightStep } from '../domain/numbers'
import type { Exercise } from '../domain/types'

/** Catálogo completo (el base más los ejercicios propios). */
export function useExercises(): { list: Exercise[]; byId: (id: string) => Exercise | undefined } {
  const list = useLiveQuery(() => db.exercises.toArray(), [], [] as Exercise[])
  const map = useMemo(() => new Map(list.map((e) => [e.id, e])), [list])
  return { list, byId: (id) => map.get(id) }
}

/** Cuánto sube el peso en cada toque para un ejercicio, y cómo cambiarlo. */
export function useWeightStep(exercise: Exercise | undefined): [number, (step: number) => void] {
  const saved = useLiveQuery(
    () => (exercise ? db.exerciseSettings.get(exercise.id) : undefined),
    [exercise?.id],
  )
  const step = saved?.weightStep ?? defaultWeightStep(exercise)
  return [step, (s) => exercise && void setWeightStep(db, exercise.id, s)]
}
