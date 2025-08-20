
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IdeasPage from './pages/AdminPages/fikirSecimPage'
import Dashboard from './profile'
import EtkinlikTalepOnayPage from './pages/AdminPages/talepEtkinlikOnayPage'
import Register from './pages/register'
import FikirlerPage from './pages/fikirler'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FikirlerPage />
  </StrictMode>,
)