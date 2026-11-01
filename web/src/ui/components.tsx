import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { groupAbbr, type MuscleGroupId } from '../domain/muscles'
import { VERDICT_SYMBOL, VERDICT_TEXT, type Verdict } from '../domain/compare'
import { WEIGHT_STEPS, formatNumber, holdMultiplier, parseNumber } from '../domain/numbers'
import { REST_PRESETS, formatRest } from '../domain/targets'

export function TopBar(props: {
  title: ReactNode
  subtitle?: string
  icon?: ReactNode
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
      {props.icon}
      <div className="ttl">
        <div className="t1">{props.title}</div>
        {props.subtitle && <div className="t2">{props.subtitle}</div>}
      </div>
      {props.right}
    </div>
  )
}

/** La imagen del ejercicio si existe en exercises, y si no, las iniciales del grupo muscular. */
export function GroupThumb({
  group,
  big,
  exerciseId,
}: {
  group: MuscleGroupId
  big?: boolean
  exerciseId?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`thumb${big ? ' big' : ''}`}>
      {exerciseId && !failed ? (
        <img
          className="thumb-img"
          src={`${import.meta.env.BASE_URL}exercises/${exerciseId}.webp`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        groupAbbr(group)
      )}
    </div>
  )
}

interface HoldTimers {
  wait?: ReturnType<typeof setTimeout>
  every?: ReturnType<typeof setInterval>
  n: number
}

function stopTimers(t: { current: HoldTimers }) {
  clearTimeout(t.current.wait)
  clearInterval(t.current.every)
  t.current = { n: 0 }
}

/** Un botón que repite al mantenerlo apretado y acelera de a poco. */
function HoldButton(props: {
  label: string
  children: ReactNode
  onBump: (times: number) => void
}) {
  const timers = useRef<HoldTimers>({ n: 0 })
  useEffect(() => () => stopTimers(timers), [])
  return (
    <button
      type="button"
      aria-label={props.label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId)
        stopTimers(timers)
        props.onBump(1)
        timers.current.wait = setTimeout(() => {
          timers.current.every = setInterval(() => {
            timers.current.n += 1
            props.onBump(holdMultiplier(timers.current.n))
          }, 110)
        }, 420)
      }}
      onPointerUp={() => stopTimers(timers)}
      onPointerCancel={() => stopTimers(timers)}
      onPointerLeave={() => stopTimers(timers)}
      // con el teclado el clic llega sin puntero
      onClick={(e) => {
        if (e.detail === 0) props.onBump(1)
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {props.children}
    </button>
  )
}

/** Control numérico grande. Se puede tocar el número para escribirlo, y los botones aceleran al mantenerlos apretados. */
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
  const [text, setText] = useState(formatNumber(value))
  const focused = useRef(false)
  const current = useRef(value)
  const decimal = !Number.isInteger(step) || !Number.isInteger(value)

  useEffect(() => {
    current.current = value
    if (!focused.current) setText(formatNumber(value))
  }, [value])

  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min, v))

  return (
    <div className="field">
      {props.label && <label>{props.label}</label>}
      <div className={`stepper${props.small ? ' small' : ''}`}>
        <HoldButton
          label="Restar"
          onBump={(times) => {
            const next = clamp(Number((current.current - step * times).toFixed(2)))
            current.current = next
            onChange(next)
          }}
        >
          −
        </HoldButton>
        <div className="valuewrap">
          <input
            inputMode={decimal ? 'decimal' : 'numeric'}
            enterKeyHint="done"
            value={text}
            aria-label={props.label ?? 'Valor'}
            onFocus={(e) => {
              focused.current = true
              e.currentTarget.select()
            }}
            onChange={(e) => {
              setText(e.target.value)
              const n = parseNumber(e.target.value)
              if (n !== undefined) {
                const v = clamp(n)
                current.current = v
                onChange(v)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            onBlur={() => {
              focused.current = false
              setText(formatNumber(value))
            }}
          />
        </div>
        <HoldButton
          label="Sumar"
          onBump={(times) => {
            const next = clamp(Number((current.current + step * times).toFixed(2)))
            current.current = next
            onChange(next)
          }}
        >
          +
        </HoldButton>
      </div>
    </div>
  )
}

/** Para subir o bajar mucho de una vez sin tantos toques. */
export function QuickChips(props: { amounts: number[]; onPick: (delta: number) => void }) {
  return (
    <div className="quick" role="group" aria-label="Cambios rápidos de peso">
      {props.amounts.map((d) => (
        <button key={d} type="button" className="chip-btn small" onClick={() => props.onPick(d)}>
          {d > 0 ? `+${formatNumber(d)} kg` : `−${formatNumber(Math.abs(d))} kg`}
        </button>
      ))}
    </div>
  )
}

/** Cuánto sube el peso en cada toque, que se recuerda para cada ejercicio. */
export function WeightStepPicker(props: { value: number; onChange: (step: number) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="stack" style={{ gap: 6 }}>
      <button type="button" className="linkbtn" onClick={() => setOpen((v) => !v)}>
        Sube de a {formatNumber(props.value)} kg {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className="chips" role="radiogroup" aria-label="Peso por toque">
          {WEIGHT_STEPS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === props.value}
              className={`chip-btn small${s === props.value ? ' on' : ''}`}
              onClick={() => {
                props.onChange(s)
                setOpen(false)
              }}
            >
              {formatNumber(s)}
            </button>
          ))}
        </div>
      )}
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
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--accent-lo)' }} />
            <stop offset="1" style={{ stopColor: 'var(--accent-hi)' }} />
          </linearGradient>
        </defs>
        <circle className="track" cx="120" cy="120" r={r} fill="none" strokeWidth="14" />
        <circle
          className="bar"
          stroke="url(#ring-grad)"
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
        EntrenAndo
      </NavLink>
      <NavLink to="/ajustes" className={({ isActive }) => (isActive ? 'on' : '')}>
        <NavIcon name="settings" />
        Ajustes
      </NavLink>
    </nav>
  )
}

/** Elige el descanso con los tiempos más comunes, o uno propio. */
export function RestPicker(props: {
  label: string
  value: number
  onChange: (sec: number) => void
  presets?: readonly number[]
}) {
  const presets = props.presets ?? REST_PRESETS
  const custom = !presets.includes(props.value)
  const [other, setOther] = useState(custom)
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="field">
        <label>{props.label}</label>
        <div className="chips" role="radiogroup" aria-label={props.label}>
          {presets.map((sec) => (
            <button
              key={sec}
              type="button"
              role="radio"
              aria-checked={!other && props.value === sec}
              className={`chip-btn${!other && props.value === sec ? ' on' : ''}`}
              onClick={() => {
                setOther(false)
                props.onChange(sec)
              }}
            >
              {formatRest(sec)}
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={other}
            className={`chip-btn${other ? ' on' : ''}`}
            onClick={() => setOther(true)}
          >
            Otro
          </button>
        </div>
      </div>
      {other && (
        <Stepper label="Segundos" value={props.value} step={15} min={5} onChange={props.onChange} />
      )}
    </div>
  )
}

/** Campo de nombre que guarda solo, un instante después de escribir o al salir del campo. */
export function NameField(props: {
  id: string
  label: string
  initial: string
  onSave: (name: string) => void
}) {
  const [name, setName] = useState(props.initial)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const save = (value: string) => {
    clearTimeout(timer.current)
    if (value.trim()) props.onSave(value.trim())
  }
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        id={props.id}
        className="search"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          clearTimeout(timer.current)
          const value = e.target.value
          timer.current = setTimeout(() => save(value), 600)
        }}
        onBlur={(e) => save(e.currentTarget.value)}
      />
    </div>
  )
}
