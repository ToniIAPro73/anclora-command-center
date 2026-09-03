import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Anclora Design System — tokens + component primitives (canonical CSS core).
// Importado ANTES de index.css a proposito: index.css redefine los tokens de
// marca y los aliases semanticos de superficie/estado por tema, preservando
// la composicion visual; el resto de tokens estructurales del DS (spacing,
// radius, shadow y action geometry) queda intacto.
import '@anclora/design-system/tokens/core.css'
import '@anclora/design-system/tokens/semantic.css'
import '@anclora/design-system/components/button.css'
import '@anclora/design-system/components/data-table.css'
import '@anclora/design-system/components/status-badge.css'
import '@anclora/design-system/components/modal.css'
import '@anclora/design-system/components/empty-state.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
