import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExercises, useWeightStep } from '../../app/data'
import { useNow, useWakeLock } from '../../app/hooks'
import { playCue } from '../../app/sound'
import { useTestMode } from '../../app/testMode'
import { ModuleIcon } from '../../brand/Logo'
import { db } from '../../db/db'
import {
  completeStep,
  finishSession,
  flowOf,
  previousSets,
  saveFlow,
  stepsOf,
  type NewLog,
} from '../../db/queries'
import { compareExtra, compareSet } from '../../domain/compare'
import { groupLabel } from '../../domain/muscles'
import {
  adjustRest,
  itemsDone,
  restRemainingMs,
  restRemainingSec,
  skipRest,
  type Step,
} from '../../domain/session'
import { formatNumber } from '../../domain/numbers'
import { PHASE_LABEL, restCue, restPhase } from '../../domain/rest'
import { formatRest, formatTarget, startReps } from '../../domain/targets'
import type { Exercise, Session, SetLog } from '../../domain/types'
import {
  GroupThumb,
  QuickChips,
  Ring,
  Stepper,
  TopBar,
  VerdictBadge,
  WeightStepPicker,
} from '../../ui/components'
import { formatDate, formatDuration, itemSummary, itemTitle } from './format'

type Lookup = (id: string) => Exercise | undefined

function liftText(l: { weight: number; reps: number }, ex: Exercise | undefined): string {
  if (ex?.load === 'time') return `${l.reps} s`
  if (ex?.load === 'bodyweight' && l.weight === 0) return `${l.reps} reps`
  return `${formatNumber(l.weight)} kg x ${l.reps}`
}

export function SessionScreen() {
  const { sid = '' } = useParams()
  const session = useLiveQuery(async () => (await db.sessions.get(sid)) ?? null, [sid])
  const { list, byId } = useExercises()
  const steps = useMemo(() => (session ? stepsOf(session, list) : []), [session, list])
  const navigate = useNavigate()

  if (session === undefined || list.length === 0) return null
  if (session === null) {
    return (
      <>
        <TopBar
          icon={<ModuleIcon module="gym" size={36} />}
          title="Entrenamiento"
          onBack={() => navigate('/gym')}
        />
        <div className="empty">No encontramos esta sesión.</div>
      </>
    )
  }
  if (session.status === 'done') return <Summary session={session} byId={byId} />
  return <Active session={session} steps={steps} byId={byId} />
}

/* ======================= sesión en curso ======================= */

function Active({ session, steps, byId }: { session: Session; steps: Step[]; byId: Lookup }) {
  const navigate = useNavigate()
  const [showList, setShowList] = useState(false)
  const flow = flowOf(session)
  const step = steps[flow.stepIndex]
  const done = itemsDone(flow, steps)
  const totalItems = session.plan.length
  useWakeLock(true)

  const finish = (input: { logs?: NewLog[]; extraReps?: number }) =>
    completeStep(db, session.id, steps, input)

  useEffect(() => {
    if (!step) navigate('/gym', { replace: true })
  }, [step, navigate])

  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title={session.trainingName}
        subtitle={`Ejecución ${session.execution} de ${session.executionsTotal} · ejercicio ${Math.min(done + 1, totalItems)} de ${totalItems}`}
        onBack={() => navigate('/gym')}
        right={
          <button
            className="iconbtn"
            aria-label="Lista del entrenamiento"
            onClick={() => setShowList((v) => !v)}
          >
            ☰
          </button>
        }
      />
      <div className="segs" aria-hidden>
        {session.plan.map((p, i) => (
          <span key={p.id} className={i < done ? 'done' : i === done ? 'cur' : ''} />
        ))}
      </div>

      {showList ? (
        <ListView session={session} done={done} byId={byId} onClose={() => setShowList(false)} />
      ) : flow.restEndAt !== null ? (
        <RestView session={session} steps={steps} byId={byId} />
      ) : step?.type === 'approach' ? (
        <ApproachView
          key={flow.stepIndex}
          session={session}
          step={step}
          byId={byId}
          onDone={finish}
        />
      ) : step?.type === 'restpause' ? (
        <RestPauseView
          key={flow.stepIndex}
          session={session}
          step={step}
          byId={byId}
          onDone={finish}
        />
      ) : step ? (
        <SetView key={flow.stepIndex} session={session} step={step} byId={byId} onDone={finish} />
      ) : null}
    </>
  )
}

/* ---------- aproximación ---------- */
function ApproachView(props: {
  session: Session
  step: Extract<Step, { type: 'approach' }>
  byId: Lookup
  onDone: (i: { logs?: NewLog[] }) => void
}) {
  const { session, step, byId } = props
  const ex = byId(step.exerciseId)
  const [wstep] = useWeightStep(ex)
  const prev = useLiveQuery(
    () => previousSets(db, step.exerciseId, 'approach', session.id),
    [step.exerciseId, session.id],
  )
  const [answer, setAnswer] = useState<'ask' | 'yes'>('ask')
  const [rows, setRows] = useState<{ weight: number; reps: number }[] | null>(null)

  if (prev === undefined) return null
  const initial = prev.length
    ? prev.map((s) => ({ weight: s.weight, reps: s.reps }))
    : [{ weight: 0, reps: 10 }]
  const current = rows ?? initial
  const isTime = ex?.load === 'time'

  if (answer === 'ask') {
    return (
      <>
        <div className="scroll">
          <div className="card ask">
            <GroupThumb group={step.group} big />
            <h3 style={{ marginTop: 12 }}>¿Hacemos series de aproximación?</h3>
            <p className="muted">
              Para {groupLabel(step.group)}, antes de {ex?.name ?? 'empezar'}.
            </p>
          </div>
        </div>
        <div className="bottom">
          <div className="two">
            <button className="btn" onClick={() => props.onDone({})}>
              No, ir directo
            </button>
            <button className="btn primary" onClick={() => setAnswer('yes')}>
              Sí
            </button>
          </div>
        </div>
      </>
    )
  }

  const update = (i: number, patch: Partial<{ weight: number; reps: number }>) =>
    setRows(current.map((r, k) => (k === i ? { ...r, ...patch } : r)))

  return (
    <>
      <div className="scroll">
        <div className="ex">
          <GroupThumb group={step.group} big />
          <div>
            <span className="chip">APROXIMACIÓN</span>
            <h2>{ex?.name}</h2>
            <div className="target">{groupLabel(step.group)} · no cuentan para el progreso</div>
          </div>
        </div>
        {current.map((r, i) => (
          <div className="set approach" key={i} style={{ display: 'block' }}>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="tag-aprox">APROX {i + 1}</span>
              {current.length > 1 && (
                <button
                  className="iconbtn"
                  style={{ width: 36, height: 36, marginLeft: 'auto' }}
                  aria-label="Quitar fila"
                  onClick={() => setRows(current.filter((_, k) => k !== i))}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="inputs">
              {!isTime && (
                <Stepper
                  small
                  label="Kg"
                  value={r.weight}
                  step={wstep}
                  onChange={(weight) => update(i, { weight })}
                />
              )}
              <Stepper
                small
                label={isTime ? 'Segundos' : 'Repeticiones'}
                value={r.reps}
                step={1}
                min={1}
                onChange={(reps) => update(i, { reps })}
              />
            </div>
          </div>
        ))}
        <button
          className="btn small"
          onClick={() =>
            setRows([...current, { ...(current[current.length - 1] ?? { weight: 0, reps: 10 }) }])
          }
        >
          + Agregar fila
        </button>
      </div>
      <div className="bottom">
        <button
          className="btn primary"
          onClick={() =>
            props.onDone({
              logs: current
                .filter((r) => r.reps > 0)
                .map((r, i) => ({
                  kind: 'approach',
                  setIndex: i + 1,
                  weight: r.weight,
                  reps: r.reps,
                })),
            })
          }
        >
          Comenzar series efectivas
        </button>
        <div className="hint">Cuando termines de aproximar, pasás a lo que dice la rutina.</div>
      </div>
    </>
  )
}

/* ---------- serie efectiva y JumpSet ---------- */
function SetView(props: {
  session: Session
  step: Extract<Step, { type: 'set' | 'jump' }>
  byId: Lookup
  onDone: (i: { logs?: NewLog[] }) => void
}) {
  const { session, step, byId } = props
  const ex = byId(step.exerciseId)
  const setIndex = step.type === 'set' ? step.setIndex : step.round
  const prev = useLiveQuery(
    () => previousSets(db, step.exerciseId, 'effective', session.id),
    [step.exerciseId, session.id],
  )
  const mine = useLiveQuery(
    () =>
      db.sets
        .where('sessionId')
        .equals(session.id)
        .filter((s) => s.exerciseId === step.exerciseId)
        .sortBy('at'),
    [session.id, step.exerciseId, step.type, setIndex],
  )
  if (prev === undefined || mine === undefined || !ex) return null

  const prevSet = prev.find((s) => s.setIndex === setIndex)
  const effective = mine.filter((s) => s.kind === 'effective' && s.itemId === step.itemId)
  const approach = mine.filter((s) => s.kind === 'approach')
  const lastDone = effective[effective.length - 1]
  const startWeight =
    prevSet?.weight ?? lastDone?.weight ?? approach[approach.length - 1]?.weight ?? 0
  const initialReps = prevSet?.reps ?? startReps(step.target)

  return (
    <SetForm
      key={`${step.itemId}-${setIndex}-${step.type === 'jump' ? step.stepIndex : 0}`}
      session={session}
      step={step}
      ex={ex}
      byId={byId}
      prevSet={prevSet}
      effective={effective}
      approach={approach}
      startWeight={startWeight}
      startReps={initialReps}
      onDone={props.onDone}
    />
  )
}

function SetForm(props: {
  session: Session
  step: Extract<Step, { type: 'set' | 'jump' }>
  ex: Exercise
  byId: Lookup
  prevSet: SetLog | undefined
  effective: SetLog[]
  approach: SetLog[]
  startWeight: number
  startReps: number
  onDone: (i: { logs?: NewLog[] }) => void
}) {
  const { session, step, ex, prevSet } = props
  const [weight, setWeight] = useState(props.startWeight)
  const [wstep, setWstep] = useWeightStep(ex)
  const [reps, setReps] = useState(props.startReps)
  const setIndex = step.type === 'set' ? step.setIndex : step.round
  const total = step.type === 'set' ? step.totalSets : step.rounds
  const verdict = compareSet({ weight, reps }, prevSet)
  const item = session.plan.find((p) => p.id === step.itemId)
  const isTime = ex.load === 'time'
  const weightLabel = ex.load === 'bodyweight' ? 'Kg extra' : 'Kg'
  const restPauseSec = item?.kind === 'restpause' ? item.restPauseSec : 0

  return (
    <>
      <div className="scroll">
        <div className="ex">
          <GroupThumb group={ex.group} exerciseId={ex.id} big />
          <div>
            <span className="chip">{groupLabel(ex.group).toUpperCase()}</span>
            <h2>{ex.name}</h2>
            <div className="plan">
              <span>
                {step.type === 'jump'
                  ? `Ronda ${setIndex} de ${total}`
                  : `Serie ${setIndex} de ${total}`}
              </span>
              <span>
                {formatTarget(step.target)} {isTime ? 's' : 'reps'}
              </span>
              {step.type === 'set' && step.restPauseNext ? (
                <span>rest pause tras {restPauseSec}''</span>
              ) : (
                <span>descanso {formatRest(step.restAfterSec)}</span>
              )}
            </div>
          </div>
        </div>

        {step.type === 'jump' && item?.kind === 'jumpset' && (
          <div style={{ marginBottom: 6 }}>
            {item.steps.map((s, i) => (
              <div key={i}>
                <div className={`jstep${i === step.stepIndex ? ' cur' : ''}`}>
                  <div className="n">{String.fromCharCode(65 + i)}</div>
                  <div className="grow">
                    <b>{props.byId(s.exerciseId)?.name}</b>
                    <div className="target">{formatTarget(s.target)} reps</div>
                  </div>
                </div>
                {i < item.steps.length - 1 && (
                  <div className="jrest">descanso {formatRest(s.restSec)}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {props.approach.length > 0 && step.type === 'set' && setIndex === 1 && (
          <>
            <div className="sect">Aproximación</div>
            {props.approach.map((a, i) => (
              <div className="set approach" key={a.id}>
                <div className="n">{i + 1}</div>
                <div className="res">{liftText(a, ex)}</div>
                <span className="tag-aprox">APROX</span>
              </div>
            ))}
          </>
        )}

        {props.effective.length > 0 && (
          <>
            <div className="sect">Hechas</div>
            {props.effective.map((s) => (
              <div className="set doneset" key={s.id}>
                <div className="n">{s.setIndex}</div>
                <div className="res">
                  {liftText(s, ex)}
                  {s.extraReps !== undefined && <small>+ {s.extraReps} de rest pause</small>}
                </div>
              </div>
            ))}
          </>
        )}

        <div className="sect">Ahora</div>
        <div className="active-set">
          {prevSet && (
            <div className="last" style={{ marginBottom: 8 }}>
              Última vez <b>{liftText(prevSet, ex)}</b>
            </div>
          )}
          <div className="inputs">
            {!isTime && (
              <Stepper label={weightLabel} value={weight} step={wstep} onChange={setWeight} />
            )}
            <Stepper
              label={isTime ? 'Segundos' : 'Repeticiones'}
              value={reps}
              step={1}
              min={1}
              onChange={setReps}
            />
          </div>
          {!isTime && (
            <div className="stack" style={{ marginTop: 8, gap: 4 }}>
              {ex.load === 'external' && (
                <QuickChips
                  amounts={[-10, -5, 5, 10]}
                  onPick={(d) => setWeight((w) => Math.max(0, Number((w + d).toFixed(2))))}
                />
              )}
              <WeightStepPicker value={wstep} onChange={setWstep} />
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <VerdictBadge
              verdict={verdict}
              detail={prevSet ? `antes ${liftText(prevSet, ex)}` : undefined}
            />
          </div>
        </div>
      </div>
      <div className="bottom">
        <button
          className="btn primary"
          onClick={() => {
            playCue('done')
            props.onDone({
              logs: [{ kind: 'effective', setIndex, weight: isTime ? 0 : weight, reps }],
            })
          }}
        >
          Serie hecha
        </button>
        {step.type === 'set' && step.restPauseNext && (
          <div className="hint">
            Última serie con rest pause: después, {restPauseSec}'' de descanso y un tramo más con el
            mismo peso.
          </div>
        )}
      </div>
    </>
  )
}

/* ---------- tramo de rest pause ---------- */
function RestPauseView(props: {
  session: Session
  step: Extract<Step, { type: 'restpause' }>
  byId: Lookup
  onDone: (i: { extraReps?: number }) => void
}) {
  const { session, step, byId } = props
  const ex = byId(step.exerciseId)
  const main = useLiveQuery(
    async () =>
      (await db.sets
        .where('sessionId')
        .equals(session.id)
        .filter(
          (s) => s.itemId === step.itemId && s.setIndex === step.setIndex && s.kind === 'effective',
        )
        .first()) ?? null,
    [session.id, step.itemId, step.setIndex],
  )
  const prev = useLiveQuery(
    () => previousSets(db, step.exerciseId, 'effective', session.id),
    [step.exerciseId, session.id],
  )
  if (main === undefined || prev === undefined || !ex) return null
  const prevExtra = prev.find((s) => s.setIndex === step.setIndex)?.extraReps
  return (
    <RestPauseForm
      key={step.itemId}
      ex={ex}
      weight={main?.weight ?? 0}
      mainReps={main?.reps ?? 0}
      prevExtra={prevExtra}
      onDone={props.onDone}
    />
  )
}

function RestPauseForm(props: {
  ex: Exercise
  weight: number
  mainReps: number
  prevExtra: number | undefined
  onDone: (i: { extraReps?: number }) => void
}) {
  const [extra, setExtra] = useState(props.prevExtra ?? 2)
  const verdict = compareExtra(extra, props.prevExtra)
  return (
    <>
      <div className="scroll">
        <div className="ex">
          <GroupThumb group={props.ex.group} exerciseId={props.ex.id} big />
          <div>
            <span className="chip">REST PAUSE</span>
            <h2>{props.ex.name}</h2>
            <div className="plan">
              <span>mismo peso, hasta el fallo</span>
            </div>
          </div>
        </div>
        <div className="result">
          <div className="l1">Serie que acabás de hacer</div>
          <div className="l2">
            {liftText({ weight: props.weight, reps: props.mainReps }, props.ex)}
          </div>
        </div>
        <div className="active-set">
          {props.prevExtra !== undefined && (
            <div className="last" style={{ marginBottom: 8 }}>
              Última vez <b>+ {props.prevExtra} reps</b>
            </div>
          )}
          <Stepper
            label={`Repeticiones extra con ${formatNumber(props.weight)} kg`}
            value={extra}
            step={1}
            min={0}
            onChange={setExtra}
          />
          <div style={{ marginTop: 10 }}>
            <VerdictBadge
              verdict={verdict}
              detail={props.prevExtra !== undefined ? `antes + ${props.prevExtra}` : undefined}
            />
          </div>
        </div>
      </div>
      <div className="bottom">
        <button className="btn primary" onClick={() => props.onDone({ extraReps: extra })}>
          Listo
        </button>
      </div>
    </>
  )
}

/* ---------- descanso ---------- */
function describeNext(
  step: Step | undefined,
  byId: Lookup,
): { title: string; detail: string } | undefined {
  if (!step) return undefined
  const name = byId(step.exerciseId)?.name ?? ''
  switch (step.type) {
    case 'approach':
      return { title: name, detail: 'Series de aproximación' }
    case 'set':
      return {
        title: name,
        detail: `Serie ${step.setIndex} de ${step.totalSets} · ${formatTarget(step.target)} reps`,
      }
    case 'restpause':
      return { title: name, detail: 'Rest pause, mismo peso hasta el fallo' }
    case 'jump':
      return {
        title: name,
        detail: `Ronda ${step.round} de ${step.rounds} · ${formatTarget(step.target)} reps`,
      }
  }
}

function RestView({ session, steps, byId }: { session: Session; steps: Step[]; byId: Lookup }) {
  const flow = flowOf(session)
  const end = flow.restEndAt ?? 0
  const now = useNow(true)
  const left = restRemainingSec(end, now)
  const fraction =
    flow.restTotalSec > 0 ? restRemainingMs(end, now) / (flow.restTotalSec * 1000) : 0
  const sets = useLiveQuery(
    () => db.sets.where('sessionId').equals(session.id).sortBy('at'),
    [session.id],
  )
  const last = sets?.[sets.length - 1]
  const prev = useLiveQuery(
    () => (last ? previousSets(db, last.exerciseId, last.kind, session.id) : []),
    [last?.id, session.id],
  )
  const verdict =
    last && last.kind === 'effective'
      ? compareSet(
          last,
          prev?.find((s) => s.setIndex === last.setIndex),
        )
      : undefined
  const next = describeNext(steps[flow.stepIndex], byId)
  const [testMode] = useTestMode()
  const phase = restPhase(left)
  const lastCue = useRef<number | undefined>(undefined)

  // un tic en los últimos tres segundos y un aviso al terminar, una sola vez por segundo
  useEffect(() => {
    const cue = restCue(left)
    if (cue && lastCue.current !== left) {
      lastCue.current = left
      playCue(cue)
    }
    if (left > 3) lastCue.current = undefined
  }, [left])

  const change = (d: number) => void saveFlow(db, session.id, adjustRest(flow, d, Date.now()))

  return (
    <div className="restwrap" data-phase={phase}>
      <div className="rest">
        <div className="lbl">{PHASE_LABEL[phase]}</div>
        <Ring fraction={fraction}>{formatRest(left)}</Ring>
        {testMode && (
          <div className="two" style={{ width: '100%', marginBottom: 14 }}>
            <button className="btn small" onClick={() => change(-15)}>
              − 15 s
            </button>
            <button className="btn small" onClick={() => change(15)}>
              + 15 s
            </button>
          </div>
        )}
        {last && (
          <div className="result">
            <div className="l1">{last.kind === 'approach' ? 'Aproximación' : 'Lo que hiciste'}</div>
            <div className="l2">
              {byId(last.exerciseId)?.name} · {liftText(last, byId(last.exerciseId))}
              {last.extraReps !== undefined && ` + ${last.extraReps}`}
            </div>
            {last.kind === 'effective' && <VerdictBadge verdict={verdict} />}
          </div>
        )}
        {next && (
          <div className="next">
            <div className="l1">Sigue</div>
            <div className="l2">{next.title}</div>
            <div className="t2">{next.detail}</div>
          </div>
        )}
      </div>
      <div className="bottom">
        {left > 0 && !testMode ? (
          <button className="btn" disabled>
            Descansando
          </button>
        ) : (
          <button
            className="btn primary"
            onClick={() => void saveFlow(db, session.id, skipRest(flow))}
          >
            {left === 0 ? 'Siguiente' : 'Empezar ya'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- lista del entrenamiento ---------- */
function ListView({
  session,
  done,
  byId,
  onClose,
}: {
  session: Session
  done: number
  byId: Lookup
  onClose: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <div className="scroll">
        <div className="sect">Todos los ejercicios</div>
        {session.plan.map((item, i) => (
          <div key={item.id} className={`item${i < done ? ' done' : i === done ? ' cur' : ''}`}>
            <div className="st">{i < done ? '✓' : i + 1}</div>
            <div className="nm">
              {itemTitle(item, byId)}
              <small>{itemSummary(item)}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="bottom">
        <div className="two">
          <button className="btn" onClick={onClose}>
            Volver
          </button>
          <button
            className="btn danger"
            onClick={async () => {
              if (!confirm) return setConfirm(true)
              await finishSession(db, session.id)
            }}
          >
            {confirm ? 'Confirmar fin' : 'Terminar'}
          </button>
        </div>
      </div>
    </>
  )
}

/* ======================= resumen ======================= */
function Summary({ session, byId }: { session: Session; byId: Lookup }) {
  const navigate = useNavigate()
  const sets = useLiveQuery(
    () => db.sets.where('sessionId').equals(session.id).sortBy('at'),
    [session.id],
  )
  if (!sets) return null
  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title={session.trainingName}
        subtitle={`${formatDate(session.startedAt)} · ${formatDuration(session.startedAt, session.endedAt)}`}
        onBack={() => navigate('/gym')}
      />
      <div className="scroll">
        <div className="card center" style={{ marginBottom: 12 }}>
          <span className="chip">ENTRENAMIENTO TERMINADO</span>
          <div className="t1" style={{ marginTop: 8 }}>
            {sets.filter((s) => s.kind === 'effective').length} series efectivas
          </div>
        </div>
        {session.plan.map((item) => {
          const exerciseIds =
            item.kind === 'jumpset' ? item.steps.map((s) => s.exerciseId) : [item.exerciseId]
          return (
            <div className="card" key={item.id} style={{ marginBottom: 10 }}>
              <div className="t1">{itemTitle(item, byId)}</div>
              {exerciseIds.map((exId) => {
                const rows = sets.filter((s) => s.exerciseId === exId)
                if (!rows.length) return null
                return (
                  <div key={exId} style={{ marginTop: 6 }}>
                    {item.kind === 'jumpset' && <div className="t2">{byId(exId)?.name}</div>}
                    {rows.map((s) => (
                      <div key={s.id} className="row" style={{ padding: '3px 0' }}>
                        {s.kind === 'approach' ? (
                          <span className="tag-aprox">APROX</span>
                        ) : (
                          <span className="chip muted">{s.setIndex}</span>
                        )}
                        <span
                          style={s.kind === 'approach' ? { color: 'var(--approach)' } : undefined}
                        >
                          {liftText(s, byId(exId))}
                          {s.extraReps !== undefined && ` + ${s.extraReps} rest pause`}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="bottom">
        <button className="btn primary" onClick={() => navigate('/gym')}>
          Listo
        </button>
      </div>
    </>
  )
}
