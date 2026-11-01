import type { Equipment, Exercise, LoadKind } from './types'
import { EXTRA_EXERCISES } from './catalogExtra'
import type { MuscleGroupId } from './muscles'

function ex(
  id: string,
  name: string,
  group: MuscleGroupId,
  equipment: Equipment,
  load: LoadKind = 'external',
): Exercise {
  return { id, name, group, equipment, load }
}

/** Catálogo inicial. Los ejercicios propios de cada persona se suman aparte. */
const CORE_EXERCISES: Exercise[] = [
  ex('press-banca', 'Press banca', 'pectorales', 'barra'),
  ex('press-banca-inclinado', 'Press inclinado con mancuernas', 'pectorales', 'mancuernas'),
  ex('aperturas-mancuernas', 'Aperturas con mancuernas', 'pectorales', 'mancuernas'),
  ex('cruces-polea', 'Cruces en polea', 'pectorales', 'polea'),
  ex('press-pecho-maquina', 'Press de pecho en máquina', 'pectorales', 'maquina'),
  ex('fondos-pecho', 'Fondos en paralelas', 'pectorales', 'peso-corporal', 'bodyweight'),

  ex('dominadas', 'Dominadas', 'espalda', 'peso-corporal', 'bodyweight'),
  ex('remo-barra', 'Remo con barra', 'espalda', 'barra'),
  ex('jalon-pecho', 'Jalón al pecho', 'espalda', 'polea'),
  ex('remo-mancuerna', 'Remo con mancuerna', 'espalda', 'mancuernas'),
  ex('remo-polea-baja', 'Remo en polea baja', 'espalda', 'polea'),

  ex('press-militar', 'Press militar', 'hombros', 'barra'),
  ex('elevaciones-laterales', 'Elevaciones laterales', 'hombros', 'mancuernas'),
  ex('pajaros', 'Pájaros (deltoides posterior)', 'hombros', 'mancuernas'),
  ex('face-pull', 'Face pull', 'hombros', 'polea'),

  ex('curl-barra', 'Curl con barra', 'biceps', 'barra'),
  ex('curl-martillo', 'Curl martillo', 'biceps', 'mancuernas'),
  ex('curl-inclinado', 'Curl inclinado', 'biceps', 'mancuernas'),
  ex('curl-polea', 'Curl en polea', 'biceps', 'polea'),

  ex('extension-polea', 'Extensión de tríceps en polea', 'triceps', 'polea'),
  ex('press-frances', 'Press francés', 'triceps', 'barra'),
  ex('fondos-triceps', 'Fondos en banco', 'triceps', 'peso-corporal', 'bodyweight'),
  ex('patada-triceps', 'Patada de tríceps', 'triceps', 'mancuernas'),

  ex('sentadilla', 'Sentadilla', 'cuadriceps', 'barra'),
  ex('prensa', 'Prensa de piernas', 'cuadriceps', 'maquina'),
  ex('extension-cuadriceps', 'Extensión de cuádriceps', 'cuadriceps', 'maquina'),
  ex('zancadas', 'Zancadas', 'cuadriceps', 'mancuernas'),
  ex('sentadilla-bulgara', 'Sentadilla búlgara', 'cuadriceps', 'mancuernas'),

  ex('peso-muerto-rumano', 'Peso muerto rumano', 'isquios', 'barra'),
  ex('curl-femoral-tumbado', 'Curl femoral tumbado', 'isquios', 'maquina'),
  ex('curl-femoral-sentado', 'Curl femoral sentado', 'isquios', 'maquina'),

  ex('hip-thrust', 'Hip thrust', 'gluteos', 'barra'),
  ex('patada-gluteo-polea', 'Patada de glúteo en polea', 'gluteos', 'polea'),
  ex('abduccion-maquina', 'Abducción en máquina', 'gluteos', 'maquina'),

  ex('gemelos-parado', 'Gemelos de pie', 'pantorrillas', 'maquina'),
  ex('gemelos-sentado', 'Gemelos sentado', 'pantorrillas', 'maquina'),

  ex('crunch', 'Crunch', 'abdominales', 'peso-corporal', 'bodyweight'),
  ex('plancha', 'Plancha', 'abdominales', 'peso-corporal', 'time'),
  ex('elevacion-piernas', 'Elevación de piernas', 'abdominales', 'peso-corporal', 'bodyweight'),
  ex('rueda-abdominal', 'Rueda abdominal', 'abdominales', 'otro', 'bodyweight'),
]

export const SEED_EXERCISES: Exercise[] = [...CORE_EXERCISES, ...EXTRA_EXERCISES]
