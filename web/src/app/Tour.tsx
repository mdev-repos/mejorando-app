import { useEffect, useRef, useState } from 'react'
import { SuiteLogo } from '../brand/Logo'
import { Recomendaciones } from './Recomendaciones'
import { setPref, usePref } from './prefs'

const KEY = 'mejorando.paseo'

/** Vuelve a mostrar el paseo la próxima vez que se renderice. */
export function replayTour(): void {
  setPref(KEY, '')
}

function finish(): void {
  setPref(KEY, 'hecho')
}

interface Paso {
  titulo: string
  cuerpo: React.ReactNode
}

const PASOS: Paso[] = [
  {
    titulo: 'Bienvenido a MejorAndo',
    cuerpo: (
      <>
        <p>
          Una app para planificar tus entrenamientos de fuerza y seguirlos serie por serie. Funciona
          sin conexión y tus datos quedan en tu teléfono.
        </p>
        <p className="t2">
          Es una versión beta, así que puede tener errores. Contámelos desde Ajustes.
        </p>
      </>
    ),
  },
  {
    titulo: 'Tu plan, en cuatro niveles',
    cuerpo: (
      <>
        <ol className="tour-niveles">
          <li>
            <strong>Macrociclo</strong>
            <span>agrupa tus rutinas, por ejemplo &quot;Principiante&quot;</span>
          </li>
          <li>
            <strong>Mesociclo</strong>
            <span>es una rutina, por ejemplo &quot;PPL&quot;</span>
          </li>
          <li>
            <strong>Día</strong>
            <span>por ejemplo &quot;Empuje&quot;, con sus ejercicios</span>
          </li>
          <li>
            <strong>Ejecución</strong>
            <span>cada vez que hacés ese día</span>
          </li>
        </ol>
      </>
    ),
  },
  {
    titulo: 'Armá tu primera rutina',
    cuerpo: (
      <>
        <p>
          En <strong>EntrenAndo</strong> tocá &quot;Nuevo macrociclo&quot;, creá un mesociclo y
          agregale sus días. En cada día elegís los ejercicios por grupo muscular, con sus series y
          repeticiones.
        </p>
        <p className="t2">Si algo te falta, podés crear tu propio ejercicio.</p>
      </>
    ),
  },
  {
    titulo: 'Entrená y compará',
    cuerpo: (
      <>
        <p>
          Cada serie se compara con la anterior y te dice si mejoraste. El descanso lo fija la
          rutina, cambia de color cuando se acaba y avisa con sonido y vibración.
        </p>
        <p className="t2">
          Las series de aproximación se guardan aparte y no entran en la comparación.
        </p>
      </>
    ),
  },
  {
    titulo: 'Cuidá tus datos',
    cuerpo: (
      <>
        <p>
          Todo vive en este teléfono. Guardá una copia desde Ajustes de vez en cuando, porque es tu
          respaldo.
        </p>
        <p className="t2">
          También podés pasarle una rutina a otra persona desde cada macrociclo, sin tu historial.
        </p>
      </>
    ),
  },
  {
    titulo: 'Antes de empezar',
    cuerpo: <Recomendaciones />,
  },
]

/** Paseo de bienvenida. Se muestra la primera vez y se puede repetir desde Ajustes. */
export function Tour() {
  const hecho = usePref(KEY, '') === 'hecho'
  const [i, setI] = useState(0)
  const siguiente = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    siguiente.current?.focus()
  }, [i, hecho])
  if (hecho) return null
  const ultimo = i === PASOS.length - 1
  const paso = PASOS[i]!
  return (
    <div className="tour-back">
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-titulo">
        <div className="tour-top">
          <SuiteLogo size={40} />
          <button className="btn small" onClick={finish}>
            Saltar
          </button>
        </div>
        <h2 id="tour-titulo">{paso.titulo}</h2>
        <div className="tour-cuerpo">{paso.cuerpo}</div>
        <div className="tour-dots" aria-hidden>
          {PASOS.map((_, k) => (
            <i key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        <p className="t2 center" aria-live="polite">
          Paso {i + 1} de {PASOS.length}
        </p>
        <div className="two">
          <button className="btn small" disabled={i === 0} onClick={() => setI(i - 1)}>
            Anterior
          </button>
          <button
            ref={siguiente}
            className="btn small primary"
            onClick={() => (ultimo ? finish() : setI(i + 1))}
          >
            {ultimo ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
