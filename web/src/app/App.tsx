import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Splash } from '../brand/Splash'
import { db } from '../db/db'
import { seedCatalog } from '../db/queries'
import { AddItem } from '../features/gym/AddItem'
import { GymHome } from '../features/gym/GymHome'
import { SessionScreen } from '../features/gym/Session'
import { DayEditor } from '../features/gym/DayEditor'
import { MacroScreen } from '../features/gym/MacroScreen'
import { MesoScreen } from '../features/gym/MesoScreen'
import { Home } from '../features/home/Home'
import { Settings } from '../features/settings/Settings'
import { BottomNav } from '../ui/components'
import { unlockAudio } from './sound'
import { requestPersistence } from './storage'
import { useApplyTheme } from './theme'

const TOP_LEVEL = new Set(['/', '/gym', '/ajustes'])

function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="app" data-module={pathname.startsWith('/gym') ? 'gym' : 'suite'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gym" element={<GymHome />} />
        <Route path="/gym/macro/:id" element={<MacroScreen />} />
        <Route path="/gym/meso/:id" element={<MesoScreen />} />
        <Route path="/gym/dia/:id" element={<DayEditor />} />
        <Route path="/gym/dia/:id/agregar" element={<AddItem />} />
        <Route path="/gym/sesion/:sid" element={<SessionScreen />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {TOP_LEVEL.has(pathname) && <BottomNav />}
    </div>
  )
}

function alreadyShown(): boolean {
  // con ?splash en la dirección se fuerza la pantalla de carga, para revisarla
  if (new URLSearchParams(window.location.search).has('splash')) return false
  try {
    return sessionStorage.getItem('mejorando.splash') === '1'
  } catch {
    return false
  }
}

export function App({ splash = true }: { splash?: boolean }) {
  const [ready, setReady] = useState(false)
  const [splashDone, setSplashDone] = useState(!splash || alreadyShown())
  useApplyTheme()

  // los navegadores solo dejan sonar después del primer toque
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    return () => window.removeEventListener('pointerdown', unlockAudio)
  }, [])

  useEffect(() => {
    void seedCatalog(db).then(() => setReady(true))
    void requestPersistence()
  }, [])

  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem('mejorando.splash', '1')
    } catch {
      /* sin almacenamiento de sesión */
    }
    setSplashDone(true)
  }, [])

  return (
    <BrowserRouter>
      {!splashDone && <Splash onDone={finishSplash} />}
      {ready && <Shell />}
    </BrowserRouter>
  )
}
