export const MUSCLE_GROUPS = [
  { id: 'pectorales', label: 'Pectorales', abbr: 'PE' },
  { id: 'espalda', label: 'Espalda', abbr: 'ES' },
  { id: 'hombros', label: 'Hombros', abbr: 'HO' },
  { id: 'biceps', label: 'Bíceps', abbr: 'BI' },
  { id: 'triceps', label: 'Tríceps', abbr: 'TR' },
  { id: 'cuadriceps', label: 'Cuádriceps', abbr: 'CU' },
  { id: 'isquios', label: 'Isquiotibiales', abbr: 'IS' },
  { id: 'gluteos', label: 'Glúteos', abbr: 'GL' },
  { id: 'pantorrillas', label: 'Pantorrillas', abbr: 'PA' },
  { id: 'abdominales', label: 'Abdominales', abbr: 'AB' },
] as const

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]['id']

export function groupLabel(id: MuscleGroupId): string {
  return MUSCLE_GROUPS.find((g) => g.id === id)?.label ?? id
}

export function groupAbbr(id: MuscleGroupId): string {
  return MUSCLE_GROUPS.find((g) => g.id === id)?.abbr ?? id.slice(0, 2).toUpperCase()
}
