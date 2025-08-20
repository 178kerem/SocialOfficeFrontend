// src/main.tsx (veya src/index.tsx)
import React, { StrictMode } from "react"
import EtkinlikTalepOnayPage from "./AdminPages/talepEtkinlikOnayPage"
import EventsPage from "./pages/events"
import { createRoot } from "react-dom/client"
import "./index.css"

import App from "./App"                   // App => Register sayfasını render ediyor
import Navbar from "./components/navbar" // senin navbar bileşenin

createRoot(document.getElementById("root")!).render(
  <StrictMode>

    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Üst navbar */}
      <EventsPage/>

      {/* İçerik */}
      <main className="flex-1">
        <App />
      </main>
    </div>
  </StrictMode>
)

