import { setPref, usePref } from './prefs'

const KEY = 'mejorando.prueba'

/**
 * El modo de prueba permite adelantar o alargar los descansos. Está apagado por defecto,
 * porque durante un entrenamiento se respeta el descanso que definió la rutina.
 */
export function useTestMode(): [boolean, (on: boolean) => void] {
  const raw = usePref(KEY, '0')
  return [raw === '1', (on) => setPref(KEY, on ? '1' : '0')]
}
