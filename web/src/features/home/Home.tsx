import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router-dom'
import { useEnabledModules, MODULES } from '../../app/modules'
import { LogoMark } from '../../brand/LogoMark'
import { db } from '../../db/db'
import { TopBar } from '../../ui/components'

export function Home() {
  const navigate = useNavigate()
  const { isEnabled } = useEnabledModules()
  const active = useLiveQuery(() => db.sessions.where('status').equals('active').first(), [])
  const enabled = MODULES.filter((m) => isEnabled(m.id))

  return (
    <>
      <TopBar title="Camino+" subtitle="Tu camino, un paso a la vez" right={<LogoMark />} />
      <div className="scroll">
        {active && (
          <button className="card tap" onClick={() => navigate(`/gym/sesion/${active.id}`)}>
            <span className="chip">EN CURSO</span>
            <div className="t1" style={{ marginTop: 8 }}>
              {active.trainingName}
            </div>
            <div className="t2">Tocá para continuar el entrenamiento</div>
          </button>
        )}

        <div className="sect">Tus módulos</div>
        <div className="stack">
          {enabled.map((m) => (
            <button
              key={m.id}
              className="card tap"
              disabled={!m.available}
              onClick={() => m.path && navigate(m.path)}
              style={m.available ? undefined : { opacity: 0.6 }}
            >
              <div className="row">
                <div className="grow">
                  <div className="t1">{m.name}</div>
                  <div className="t2">{m.blurb}</div>
                </div>
                {m.available ? (
                  <span aria-hidden>→</span>
                ) : (
                  <span className="chip muted">PRÓXIMAMENTE</span>
                )}
              </div>
            </button>
          ))}
          {enabled.length === 0 && (
            <div className="empty">
              No tenés módulos activos. Podés encenderlos desde <Link to="/ajustes">Ajustes</Link>.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
