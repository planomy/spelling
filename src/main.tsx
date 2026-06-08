import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './hooks/useTheme'
import { SpellingProvider } from './hooks/useSpellingStore'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SpellingProvider>
        <App />
      </SpellingProvider>
    </ThemeProvider>
  </StrictMode>,
)
