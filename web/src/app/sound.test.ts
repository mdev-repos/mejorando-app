import { beforeEach, describe, expect, it, vi } from 'vitest'
import { playCue } from './sound'

let oscillators: { frequency: { value: number } }[] = []

class FakeAudioContext {
  state = 'running'
  currentTime = 0
  destination = {}
  resume = vi.fn()
  createOscillator() {
    const o = { frequency: { value: 0 }, type: '', connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
    oscillators.push(o)
    return o
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }
  }
}

beforeEach(() => {
  oscillators = []
  localStorage.clear()
  Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true })
  Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), configurable: true })
})

describe('avisos sonoros', () => {
  it('un tic es un solo sonido y el final son dos, uno grave y otro agudo', () => {
    playCue('tick')
    expect(oscillators).toHaveLength(1)
    playCue('end')
    expect(oscillators).toHaveLength(3)
    expect(oscillators[1]!.frequency.value).toBeLessThan(oscillators[2]!.frequency.value)
  })

  it('con el sonido apagado no suena nada, pero la vibración sigue', () => {
    localStorage.setItem('mejorando.sonido', '0')
    playCue('end')
    expect(oscillators).toHaveLength(0)
    expect(navigator.vibrate).toHaveBeenCalled()
  })

  it('con la vibración apagada no vibra', () => {
    localStorage.setItem('mejorando.vibracion', '0')
    playCue('end')
    expect(navigator.vibrate).not.toHaveBeenCalled()
  })
})
