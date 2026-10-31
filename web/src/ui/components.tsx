import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { groupAbbr, type MuscleGroupId } from '../domain/muscles'
import { VERDICT_SYMBOL, VERDICT_TEXT, type Verdict } from '../domain/compare'

export function TopBar(props: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <div className="topbar">
      {props.onBack && (
        <button className="iconbtn" onClick={props.onBack} aria-label="Volver">
          ←
        </button>
      )}
      <div className="ttl">
        <div className="t1">{props.title}</div>
        {props.subtitle && <div className="t2">{props.subtitle}</div>}
      </div>
      {props.right}
    </div>
  )
}

export function GroupThumb({ group, big }: { group: MuscleGroupId; big?: boolean }) {
  return <div className={`thumb${big ? ' big' : ''}`}>{groupAbbr(group)}</div>
}

function fmt(n: number): string {
  return String(Number(n.toFixed(2)))
}

/** Control numérico grande, con botones de ± y escritura directa. */
export function Stepper(props: {
  label?: string
  value: number
  step: number
  min?: number
  max?: number
  small?: boolean
  onChange: (v: number) => void
}) {
  const { value, step, min = 0, max, onChange } = props
  const [text, setText] = useState(fmt(value))
  const focused = useRef(false)
  useEffect(() => {
    if (!focused.current) setText(fmt(value))
  }, [value])

  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min, v))
  const bump = (d: number) => onChange(clamp(Number((value + d).toFixed(2))))

  return (
    <div className="field">
      {props.label && <label>{props.label}</label>}
      <div className={`stepper${props.small ? ' small' : ''}`}>
        <button type="button" aria-label="Restar" onClick={() => bump(-step)}>
          −
        </button>
        <input
          inputMode="decimal"
          value={text}
          aria-label={props.label ?? 'Valor'}
          onFocus={(e) => {
            focused.current = true
            e.currentTarget.select()
          }}
          onChange={(e) => {
            setText(e.target.value)
            const n = Number(e.target.value.replace(',', '.'))
            if (e.target.value !== '' && Number.isFinite(n)) onChange(clamp(n))
          }}
          onBlur={() => {
            focused.current = false
            setText(fmt(value))
          }}
        />
        <button type="button" aria-label="Sumar" onClick={() => bump(step)}>
          +
        </button>
      </div>
    </div>
  )
}

export function VerdictBadge({
  verdict,
  detail,
}: {
  verdict: Verdict | undefined
  detail?: string
}) {
  if (!verdict) {
    return <div className="badge same">Sin comparación todavía</div>
  }
  return (
    <div className={`badge ${verdict}`}>
      <span aria-hidden>{VERDICT_SYMBOL[verdict]}</span>
      <span>
        {VERDICT_TEXT[verdict]}
        {detail ? ` · ${detail}` : ''}
      </span>
    </div>
  )
}

export function Ring({ fraction, children }: { fraction: number; children: ReactNode }) {
  const r = 108
  const c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 240 240" aria-hidden>
        <circle className="track" cx="120" cy="120" r={r} fill="none" strokeWidth="14" />
        <circle
          className="bar"
          cx="120"
          cy="120"
          r={r}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, fraction)))}
        />
      </svg>
      <div className="time">{children}</div>
    </div>
  )
}

const ICONS = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  gym: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />,
  settings: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 4v6M10 14v6" />,
} as const

function NavIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      className="ic"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  )
}

export function BottomNav() {
  return (
    <nav className="nav" aria-label="Principal">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'on' : '')}>
        <NavIcon name="home" />
        Inicio
      </NavLink>
      <NavLink to="/gym" className={({ isActive }) => (isActive ? 'on' : '')}>
        <NavIcon name="gym" />
        Gym+
      </NavLink>
      <NavLink to="/ajustes" className={({ isActive }) => (isActive ? 'on' : '')}>
        <NavIcon name="settings" />
        Ajustes
      </NavLink>
    </nav>
  )
}
