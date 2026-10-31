import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Splash } from '../brand/Splash'
import { db } from '../db/db'
import { seedCatalog } from '../db/queries'
import { AddItem } from '../features/gym/AddItem'
import { GymHome } from '../features/gym/GymHome'
import { SessionScreen } from '../features/gym/Session'
import { TrainingEditor } from '../features/gym/TrainingEditor'
import { Home } from '../features/home/Home'
import { Settings } from '../features/settings/Settings'
import { BottomNav } from '../ui/components'
import { useApplyTheme } from './theme'

const TOP_LEVEL = new Set(['/', '/gym', '/ajustes'])

function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gym" element={<GymHome />} />
        <Route path="/gym/entrenamiento/:id" element={<TrainingEditor />} />
        <Route path="/gym/entrenamiento/:id/agregar" element={<AddItem />} />
        <Route path="/gym/sesion/:sid" element={<SessionScreen />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {TOP_LEVEL.has(pathname) && <BottomNav />}
    </div>
  )
}

function alreadyShown(): boolean {
  try {
    return sessionStorage.getItem('camino.splash') === '1'
  } catch {
    return false
  }
}

export function App({ splash = true }: { splash?: boolean }) {
  const [ready, setReady] = useState(false)
  const [splashDone, setSplashDone] = useState(!splash || alreadyShown())
  useApplyTheme()

  useEffect(() => {
    void seedCatalog(db).then(() => setReady(true))
  }, [])

  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem('camino.splash', '1')
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
