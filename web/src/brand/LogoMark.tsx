import { C_BOX, C_PATH } from './paths'

/** La C de Camino+ con el degradé que gana color. Se adapta al tema con las variables. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox={`${C_BOX.x - 40} ${C_BOX.y - 40} ${C_BOX.w + 80} ${C_BOX.h + 80}`}
      role="img"
      aria-label="Camino+"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--foot-far)' }} />
          <stop offset="1" style={{ stopColor: 'var(--foot-near)' }} />
        </linearGradient>
      </defs>
      <path d={C_PATH} fill="url(#logo-grad)" fillRule="evenodd" />
    </svg>
  )
}
