import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/db'
import type { Exercise } from '../domain/types'

/** Catálogo completo (el base más los ejercicios propios). */
export function useExercises(): { list: Exercise[]; byId: (id: string) => Exercise | undefined } {
  const list = useLiveQuery(() => db.exercises.toArray(), [], [] as Exercise[])
  const map = useMemo(() => new Map(list.map((e) => [e.id, e])), [list])
  return { list, byId: (id) => map.get(id) }
}
