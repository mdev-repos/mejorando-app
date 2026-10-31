import { describe, expect, it } from 'vitest'
import { restCue, restPhase } from './rest'

describe('fases del descanso', () => {
  it('cambia a los 15, a los 10 y al llegar a cero', () => {
    expect([60, 16, 15, 11, 10, 1, 0].map(restPhase)).toEqual([
      'normal',
      'normal',
      'warn',
      'warn',
      'alert',
      'alert',
      'done',
    ])
  })

  it('suena un tic en los últimos tres segundos y un aviso al terminar', () => {
    expect([5, 4, 3, 2, 1, 0].map(restCue)).toEqual([
      undefined,
      undefined,
      'tick',
      'tick',
      'tick',
      'end',
    ])
  })
})
