import { useEffect } from 'react'
import { FOOT_BOX, FOOT_PATH, PLUS_TEXT_BOX, PLUS_TEXT_PATH } from './paths'

// Misma composición que docs/diseno/logo/pantalla-de-carga-animada-*.svg
const N = 6
const SCALE = 1
const L = FOOT_BOX.h * SCALE
const STEP = 0.78 * L
const COLSEP = 0.94 * L
const TEXT_SCALE = 0.95
const DURATION = 4.2

const feet = Array.from({ length: N }, (_, i) => ({
  i,
  x: 540 + (i % 2 === 0 ? -COLSEP / 2 : COLSEP / 2),
  y: 440 + L / 2 + i * STEP,
  left: i % 2 === 0,
  t: i / (N - 1),
}))

const FOOT_CX = FOOT_BOX.x + FOOT_BOX.w / 2
const FOOT_CY = FOOT_BOX.y + FOOT_BOX.h / 2

function keyframes() {
  let css = '.sp *{transform-box:fill-box;transform-origin:center}'
  // aparece primero el más lejano (el de abajo), cada uno unos 0,4 segundos después
  const order = [...feet].reverse()
  order.forEach((f, k) => {
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
const TEXT_W = PLUS_TEXT_BOX.w * TEXT_SCALE

/** Pantalla de carga, con las huellas apareciendo una a una hasta llegar al "Plus +". */
export function Splash({ onDone, ms = 2800 }: { onDone: () => void; ms?: number }) {
  useEffect(() => {
    const id = setTimeout(onDone, ms)
    return () => clearTimeout(id)
  }, [onDone, ms])

  return (
    <div className="splash" onClick={onDone} role="status" aria-label="Cargando Camino+">
      <svg className="sp" viewBox="0 0 1080 1920" fillRule="evenodd">
        <style>{CSS}</style>
        <g
          transform={`translate(${540 - TEXT_W / 2} 200) scale(${TEXT_SCALE}) translate(${-PLUS_TEXT_BOX.x} ${-PLUS_TEXT_BOX.y})`}
        >
          <g className="a stx">
            <path d={PLUS_TEXT_PATH} fill="var(--text)" />
          </g>
        </g>
        {feet.map((f) => (
          <g
            key={f.i}
            transform={`translate(${f.x} ${f.y}) scale(${f.left ? SCALE : -SCALE} ${SCALE})`}
          >
            <g className={`a sf${f.i}`}>
              <path
                d={FOOT_PATH}
                transform={`translate(${-FOOT_CX} ${-FOOT_CY})`}
                style={{
                  fill: `color-mix(in srgb, var(--foot-near) ${(1 - f.t) * 100}%, var(--foot-far))`,
                }}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}
