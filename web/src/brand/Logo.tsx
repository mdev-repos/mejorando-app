import logoUrl from './assets/logo.svg'
import alimentando from './assets/modulo-alimentando.svg'
import caminando from './assets/modulo-caminando.svg'
import entrenando from './assets/modulo-entrenando.svg'

export type ModuleId = 'gym' | 'alimentacion' | 'pasos'

const ICONS: Record<ModuleId, string> = {
  gym: entrenando,
  alimentacion: alimentando,
  pasos: caminando,
}

/** El círculo de tres sectores, uno por módulo. */
export function SuiteLogo({ size = 40 }: { size?: number }) {
  return <img className="logo-mark" src={logoUrl} width={size} height={size} alt="MejorAndo" />
}

/** El ícono de cada módulo, con su color y su imagen. */
export function ModuleIcon({ module, size = 40 }: { module: ModuleId; size?: number }) {
  return (
    <img
      className="module-icon"
      src={ICONS[module]}
      width={size}
      height={size}
      alt=""
      aria-hidden
    />
  )
}

/** Escribe el nombre de un módulo con "Ando" resaltado, como en el logotipo. */
export function ModuleName({ name, module }: { name: string; module?: ModuleId }) {
  const i = name.indexOf('Ando')
  if (i < 0) return <>{name}</>
  return (
    <>
      {name.slice(0, i)}
      <span className="ando" data-m={module}>
        {name.slice(i)}
      </span>
    </>
  )
}
