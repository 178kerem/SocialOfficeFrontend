import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"   // 👈 ekle
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>                           

      <div className="min-h-screen bg-slate-50">
        <App/>
      </div>

    </BrowserRouter>
  </StrictMode>
)