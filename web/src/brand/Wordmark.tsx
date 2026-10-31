import { ANDO_PATH, MEJOR_PATH, WORD_BOX } from './paths'

/** MejorAndo con "Mejor" en el color del texto y "Ando" en el color propio de la suite. */
export function Wordmark({ height = 28 }: { height?: number }) {
  return (
    <svg
      className="wordmark"
      viewBox={`${WORD_BOX.x} ${WORD_BOX.y} ${WORD_BOX.w} ${WORD_BOX.h}`}
      height={height}
      role="img"
      aria-label="MejorAndo"
    >
      <path d={MEJOR_PATH} fill="var(--text)" fillRule="nonzero" />
      <path d={ANDO_PATH} fill="var(--suite)" fillRule="nonzero" />
    </svg>
  )
}
