import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IdeasPage from './AdminPages/fikirSecimPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdeasPage />
  </StrictMode>,
)
