import { Link, useNavigate } from 'react-router-dom'
import { MODULES, useEnabledModules } from '../../app/modules'
import { ModuleIcon, ModuleName, SuiteLogo } from '../../brand/Logo'
import { Wordmark } from '../../brand/Wordmark'
import { BackupReminder } from '../../app/BackupReminder'
import { InstallCard } from '../../app/install'
import { InProgressCards } from '../gym/InProgress'
import { TopBar } from '../../ui/components'

export function Home() {
  const navigate = useNavigate()
  const { isEnabled } = useEnabledModules()
  const enabled = MODULES.filter((m) => isEnabled(m.id))

  return (
    <>
      <TopBar
        icon={<SuiteLogo size={44} />}
        title={<Wordmark height={26} />}
        subtitle="Un paso a la vez"
      />
      <div className="scroll">
        <div className="stack">
          <InProgressCards hint="tocá para continuar el entrenamiento" />

          <InstallCard />
          <BackupReminder />
        </div>

        <div className="sect">Tus módulos</div>
        <div className="stack">
          {enabled.map((m) => (
            <button
              key={m.id}
              className="card tap mcard"
              disabled={!m.available}
              onClick={() => m.path && navigate(m.path)}
              style={m.available ? undefined : { opacity: 0.6 }}
            >
              <ModuleIcon module={m.id} size={60} />
              <div className="grow">
                <div className="t1">
                  <ModuleName name={m.name} module={m.id} />
                </div>
                <div className="t2">{m.blurb}</div>
              </div>
              {m.available ? (
                <span aria-hidden>→</span>
              ) : (
                <span className="chip muted">PRONTO</span>
              )}
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
