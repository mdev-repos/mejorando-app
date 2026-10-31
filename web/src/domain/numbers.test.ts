import { describe, expect, it } from 'vitest'
import { defaultWeightStep, formatNumber, holdMultiplier, parseNumber } from './numbers'

describe('números con coma', () => {
  it('se muestran con coma decimal y sin separador de miles', () => {
    expect(formatNumber(82.5)).toBe('82,5')
    expect(formatNumber(80)).toBe('80')
    expect(formatNumber(1250.75)).toBe('1250,75')
  })

  it('se leen con coma o con punto', () => {
    expect(parseNumber('82,5')).toBe(82.5)
    expect(parseNumber('82.5')).toBe(82.5)
    expect(parseNumber(' 100 ')).toBe(100)
  })

  it('lo que no es un número no se interpreta', () => {
    expect(parseNumber('')).toBeUndefined()
    expect(parseNumber('abc')).toBeUndefined()
    expect(parseNumber('-')).toBeUndefined()
  })
})

describe('paso de peso', () => {
  it('depende del equipamiento', () => {
    expect(defaultWeightStep({ equipment: 'barra' })).toBe(2.5)
    expect(defaultWeightStep({ equipment: 'maquina' })).toBe(5)
    expect(defaultWeightStep({ equipment: 'peso-corporal' })).toBe(1)
    expect(defaultWeightStep(undefined)).toBe(2.5)
  })

  it('al mantener apretado, acelera de a poco', () => {
    expect([0, 7, 8, 15, 16, 40].map(holdMultiplier)).toEqual([1, 1, 2, 2, 4, 4])
  })
})
