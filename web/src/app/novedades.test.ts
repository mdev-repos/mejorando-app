import { describe, expect, it } from 'vitest'
import { compareVersions, formatReleaseDate, releasesSince, type Release } from './novedades'

const r = (version: string): Release => ({ version, date: '2026-11-02', changes: [] })

describe('versiones', () => {
  it('compara por número y no por texto', () => {
    expect(compareVersions('0.10.0', '0.9.0')).toBeGreaterThan(0)
    expect(compareVersions('0.3.0', '0.3.0')).toBe(0)
    expect(compareVersions('1.0', '1.0.1')).toBeLessThan(0)
  })

  it('devuelve las posteriores, de la más nueva a la más vieja', () => {
    const list = [r('0.2.0'), r('0.4.0'), r('0.3.0')]
    expect(releasesSince(list, '0.2.0').map((x) => x.version)).toEqual(['0.4.0', '0.3.0'])
    expect(releasesSince(list, '0.4.0')).toEqual([])
  })

  it('escribe la fecha en castellano, sin correrla un día', () => {
    expect(formatReleaseDate('2026-11-02')).toMatch(/2.*noviembre.*2026/)
  })
})
