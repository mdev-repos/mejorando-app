import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { UpdatePrompt } from './app/UpdatePrompt'
import '@fontsource-variable/figtree'
import './styles/tokens.css'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>,
)
