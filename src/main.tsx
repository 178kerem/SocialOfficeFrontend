// src/main.tsx (veya src/index.tsx)
import React, { StrictMode } from "react"
import EtkinlikTalepOnayPage from "./AdminPages/talepEtkinlikOnayPage"
import EventsPage from "./pages/events"
import { createRoot } from "react-dom/client"
import "./index.css"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FikirlerPage />
  </StrictMode>,
)