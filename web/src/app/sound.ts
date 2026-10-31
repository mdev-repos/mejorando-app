import { setPref, usePref } from './prefs'
import type { Cue } from '../domain/rest'

const SOUND_KEY = 'mejorando.sonido'
const VIBRATE_KEY = 'mejorando.vibracion'

/** Sonido y vibración se pueden apagar por separado, y están prendidos por defecto. */
export function useFeedbackPrefs() {
  const sound = usePref(SOUND_KEY, '1') === '1'
  const vibration = usePref(VIBRATE_KEY, '1') === '1'
  return {
    sound,
    vibration,
    setSound: (on: boolean) => setPref(SOUND_KEY, on ? '1' : '0'),
    setVibration: (on: boolean) => setPref(VIBRATE_KEY, on ? '1' : '0'),
  }
}

let ctx: AudioContext | undefined

function audio(): AudioContext | undefined {
  try {
    ctx ??= new window.AudioContext()
    return ctx
  } catch {
    return undefined
  }
}

/** Los navegadores solo dejan sonar después de un toque, así que se destraba con el primero. */
export function unlockAudio(): void {
  const c = audio()
  if (c && c.state === 'suspended') void c.resume()
}

function tone(freq: number, startAt: number, durationMs: number, volume: number) {
  const c = audio()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t0 = c.currentTime + startAt / 1000
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + durationMs / 1000 + 0.05)
}

function getPref(key: string): boolean {
  try {
    return (localStorage.getItem(key) ?? '1') === '1'
  } catch {
    return true
  }
}

function vibrate(pattern: number | number[]) {
  if (!getPref(VIBRATE_KEY)) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* sin vibración */
  }
}

/** Reproduce un aviso, si el sonido está prendido. */
export function playCue(cue: Cue | 'done' | 'test'): void {
  if (getPref(SOUND_KEY)) {
    switch (cue) {
      case 'tick':
        tone(880, 0, 90, 0.16)
        break
      case 'end':
        tone(660, 0, 170, 0.2)
        tone(990, 190, 260, 0.2)
        break
      case 'done':
        tone(520, 0, 70, 0.1)
        break
      case 'test':
        tone(660, 0, 140, 0.2)
        tone(990, 170, 220, 0.2)
        break
    }
  }
  if (cue === 'tick') vibrate(40)
  if (cue === 'end' || cue === 'test') vibrate([200, 100, 200])
}
