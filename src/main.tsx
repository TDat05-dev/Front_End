import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/index.scss'
import App from './App.tsx'
import ThemeProvider from './context/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
        <App />
    </ThemeProvider>
  </StrictMode>,
)
