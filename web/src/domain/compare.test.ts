import { describe, expect, it } from 'vitest'
import { compareExtra, compareSet } from './compare'

describe('compareSet', () => {
  const prev = { weight: 80, reps: 8 }

  it('más peso mejora, aunque haya menos repeticiones', () => {
    expect(compareSet({ weight: 82.5, reps: 5 }, prev)).toBe('up')
  })

  it('con el mismo peso, más repeticiones mejora', () => {
    expect(compareSet({ weight: 80, reps: 9 }, prev)).toBe('up')
  })

  it('subir peso y repeticiones también es mejora', () => {
    expect(compareSet({ weight: 85, reps: 10 }, prev)).toBe('up')
  })

  it('el mismo peso y las mismas repeticiones es igual', () => {
    expect(compareSet({ weight: 80, reps: 8 }, prev)).toBe('same')
  })

  it('menos peso, o el mismo peso con menos repeticiones, queda por debajo', () => {
    expect(compareSet({ weight: 77.5, reps: 12 }, prev)).toBe('down')
    expect(compareSet({ weight: 80, reps: 7 }, prev)).toBe('down')
  })

  it('sin serie anterior no hay comparación', () => {
    expect(compareSet({ weight: 80, reps: 8 }, undefined)).toBeUndefined()
  })
})

describe('compareExtra (rest pause)', () => {
  it('compara solo las repeticiones del tramo extra', () => {
    expect(compareExtra(3, 2)).toBe('up')
    expect(compareExtra(2, 2)).toBe('same')
    expect(compareExtra(1, 2)).toBe('down')
    expect(compareExtra(2, undefined)).toBeUndefined()
  })
})
