import { useEffect, useState } from 'react'
import { ANDO_PATH, FEET_GRADIENT, FOOT_BOX, FOOT_PATH, MEJOR_PATH, WORD_BOX } from './paths'

// Misma composición que docs/diseno/logo/pantalla-de-carga-animada
const N = 6
const SF = 0.92
const L = FOOT_BOX.h * SF
const STEP = 0.78 * L
const COLSEP = 0.94 * L
const WORD_W = 660
const WORD_H = (WORD_W * WORD_BOX.h) / WORD_BOX.w
const DURATION = 4.2

function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((x, k) => Math.round(x + ((pb[k] ?? x) - x) * t)).join(',')})`
}

/** Color del degradé de la marca en la posición p, de 0 a 1. */
function brandColor(p: number): string {
  for (let i = 1; i < FEET_GRADIENT.length; i++) {
    const [o1, c1] = FEET_GRADIENT[i - 1]!
    const [o2, c2] = FEET_GRADIENT[i]!
    if (p <= o2) return lerpHex(c1, c2, (p - o1) / (o2 - o1))
  }
  return FEET_GRADIENT[FEET_GRADIENT.length - 1]![1]
}

const FEET = Array.from({ length: N }, (_, i) => ({
  i,
  x: 540 + (i % 2 === 0 ? -COLSEP / 2 : COLSEP / 2),
  y: 455 + L / 2 + i * STEP,
  left: i % 2 === 0,
  // el primer paso (abajo) es naranja y los pasos van tomando los colores del degradé hasta llegar al azul
  color: brandColor(1 - i / (N - 1)),
}))

const FOOT_CX = FOOT_BOX.x + FOOT_BOX.w / 2
const FOOT_CY = FOOT_BOX.y + FOOT_BOX.h / 2

function keyframes() {
  let css = '.sp *{transform-box:fill-box;transform-origin:center}'
  // aparece primero el más lejano (el de abajo), cada uno unos 0,4 segundos después
  ;[...FEET].reverse().forEach((f, k) => {
    const p = 3 + k * 9
    css += `@keyframes sf${f.i}{0%,${p}%{opacity:0;transform:scale(.8)}${p + 5}%{opacity:1;transform:scale(1)}90%{opacity:1}96%,100%{opacity:0}}`
    css += `.sf${f.i}{opacity:0;animation:sf${f.i} ${DURATION}s ease-out infinite}`
  })
  css += `@keyframes stx{0%,58%{opacity:0;transform:scale(.94)}64%{opacity:1;transform:scale(1)}90%{opacity:1}96%,100%{opacity:0}}`
  css += `.stx{opacity:0;animation:stx ${DURATION}s ease-out infinite}`
  css +=
    '@media (prefers-reduced-motion:reduce){.sp .a{animation:none!important;opacity:1!important}}'
  return css
}

const CSS = keyframes()

/** Pantalla de carga, con las huellas apareciendo una a una hasta llegar a MejorAndo. */
export function Splash({ onDone, ms = 4000 }: { onDone: () => void; ms?: number }) {
  const [leaving, setLeaving] = useState(false)
  // se muestra toda la secuencia y se desvanece sobre la aplicación
  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), ms - 450)
    const end = setTimeout(onDone, ms)
    return () => {
      clearTimeout(fade)
      clearTimeout(end)
    }
  }, [onDone, ms])

  return (
    <div
      className={`splash${leaving ? ' leaving' : ''}`}
      onClick={onDone}
      role="status"
      aria-label="Cargando MejorAndo"
    >
      <svg className="sp" viewBox="0 0 1080 1920" fillRule="evenodd">
        <style>{CSS}</style>
        <g className="a stx">
          <svg
            x={540 - WORD_W / 2}
            y={200}
            width={WORD_W}
            height={WORD_H}
            viewBox={`${WORD_BOX.x} ${WORD_BOX.y} ${WORD_BOX.w} ${WORD_BOX.h}`}
          >
            <path d={MEJOR_PATH} fill="var(--text)" fillRule="nonzero" />
            <path d={ANDO_PATH} fill="var(--suite)" fillRule="nonzero" />
          </svg>
        </g>
        {FEET.map((f) => (
          <g key={f.i} transform={`translate(${f.x} ${f.y}) scale(${f.left ? SF : -SF} ${SF})`}>
            <g className={`a sf${f.i}`}>
              <path d={FOOT_PATH} transform={`translate(${-FOOT_CX} ${-FOOT_CY})`} fill={f.color} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}
