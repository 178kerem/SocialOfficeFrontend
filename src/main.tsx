import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TalepEtkinlikOnay from './AdminPages/talepEtkinlikOnayPage'
import Dashboard from './profile'
import EtkinlikTalepOnayPage from './AdminPages/talepEtkinlikOnayPage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EtkinlikTalepOnayPage />
  </StrictMode>,
)
