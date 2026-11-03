import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModuleIcon, SuiteLogo } from '../brand/Logo'
import { TopBar } from '../ui/components'
import {
  CHANGE_LABEL,
  compareVersions,
  formatReleaseDate,
  releasesSince,
  useReleases,
  type Release,
} from './novedades'
import { setPref, usePref } from './prefs'

const KEY = 'mejorando.version-vista'

/** La versión inmediatamente anterior a `version` en la lista, o 0.0.0 si no hay. */
function previousOf(releases: Release[], version: string): string {
  const older = releases
    .map((r) => r.version)
    .filter((v) => compareVersions(v, version) < 0)
    .sort((a, b) => compareVersions(b, a))
  return older[0] ?? '0.0.0'
}

/** Las novedades de cada versión, una debajo de la otra. */
export function ReleaseList({ releases }: { releases: Release[] }) {
  return (
    <div className="releases">
      {releases.map((r) => (
        <section key={r.version} className="release">
          <h3>
            Versión {r.version}
            <small>{formatReleaseDate(r.date)}</small>
          </h3>
          <ul>
            {r.changes.map((c, i) => (
              <li key={i}>
                <span className={`tipo ${c.type}`}>{CHANGE_LABEL[c.type]}</span>
                {c.text}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** Pantalla con todo el historial de cambios, que se abre desde Ajustes. */
export function NovedadesScreen() {
  const navigate = useNavigate()
  const releases = useReleases(false)
  return (
    <>
      <TopBar
        icon={<ModuleIcon module="gym" size={36} />}
        title="Novedades"
        subtitle={`Versión instalada ${__APP_VERSION__}`}
        onBack={() => navigate('/ajustes')}
      />
      <div className="scroll">
        {releases === undefined ? null : releases ? (
          <ReleaseList releases={releases} />
        ) : (
          <div className="empty">No pudimos cargar las novedades. Probá de nuevo con conexión.</div>
        )}
      </div>
    </>
  )
}

/**
 * Después de actualizar, muestra una sola vez qué cambió. En una instalación nueva no aparece,
 * porque ya está el paseo de bienvenida.
 */
export function WhatsNewDialog() {
  const vista = usePref(KEY, '')
  const paseoHecho = usePref('mejorando.paseo', '') === 'hecho'
  const nuevaInstalacion = vista === '' && !paseoHecho
  const releases = useReleases(false)

  useEffect(() => {
    // sin versión anotada y sin paseo hecho es una instalación nueva: se anota la actual y listo
    if (nuevaInstalacion) setPref(KEY, __APP_VERSION__)
  }, [nuevaInstalacion])

  if (vista === __APP_VERSION__ || nuevaInstalacion || !releases) return null
  // sin versión anotada (quien venía de antes de existir este aviso) solo se muestra la actual
  const desde = vista || previousOf(releases, __APP_VERSION__)
  const nuevas = releasesSince(releases, desde).filter(
    (r) => compareVersions(r.version, __APP_VERSION__) <= 0,
  )
  const lista = nuevas.length ? nuevas : releases.slice(0, 1)
  const close = () => setPref(KEY, __APP_VERSION__)
  return (
    <div className="tour-back">
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="novedades-titulo">
        <div className="tour-top">
          <SuiteLogo size={40} />
          <button className="btn small" onClick={close}>
            Cerrar
          </button>
        </div>
        <h2 id="novedades-titulo">Se actualizó MejorAndo</h2>
        <p className="t2">Esto es lo que cambió desde la última vez.</p>
        <ReleaseList releases={lista.slice(0, 3)} />
        <button className="btn primary" onClick={close}>
          Entendido
        </button>
      </div>
    </div>
  )
}
