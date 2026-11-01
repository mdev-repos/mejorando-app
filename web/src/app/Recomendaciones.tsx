import { RECOMENDACIONES } from './links'

const externo = { target: '_blank', rel: 'noopener noreferrer' } as const

/** Qué conviene hacer antes de entrenar o de cambiar la alimentación, con algunas referencias. */
export function Recomendaciones() {
  return (
    <div className="stack">
      <p className="t2">
        MejorAndo no reemplaza a un profesional de la salud. Antes de empezar un plan, consultá con
        tu médico.
      </p>
      <p className="t2">
        <strong>Para entrenar</strong>, consultá con un médico o un deportólogo. Como referencia, el
        canal de{' '}
        <a href={RECOMENDACIONES.ecnYoutube} {...externo}>
          Roberto Amorosi y la Escuela de Culturismo Natural
        </a>{' '}
        y su{' '}
        <a href={RECOMENDACIONES.ecnWeb} {...externo}>
          academia
        </a>
        .
      </p>
      <p className="t2">
        <strong>Para comer</strong>, consultá primero con un médico y un nutricionista. Como
        referencia, el canal de{' '}
        <a href={RECOMENDACIONES.holwayYoutube} {...externo}>
          Francis Holway
        </a>
        , nutricionista argentino, y las entrevistas que le hicieron en otros canales.
      </p>
    </div>
  )
}
