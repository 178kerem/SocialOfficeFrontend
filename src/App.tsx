import { useState } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Navbar from "@/components/navbar"
import Register from "@/pages/register"
import InterestSelect from "@/pages/InterestsSelect"
import EventsPage from "@/pages/events"
import CalendarPage from "./pages/calendar"
import { Calendar } from "lucide-react"
import NotificationsPage from "@/pages/bildirimler"
import RequestsPage from "./pages/requestEvents" // 👈 ekle

type Profile = {
  firstName: string; lastName: string; email: string;
  sicil: string; dept: string; unit: string
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sol sabit navbar */}
      <Navbar fixed />

      {/* İçerik: nav dar (w-16) iken ml-16, hover’da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="min-h-screen">
          <Routes>
            <Route
              path="/register"
              element={
                <Register
                  onSuccess={(form) => {
                    setProfile(form)
                    navigate("/interests")
                  }}
                />
              }
            />

            <Route
              path="/interests"
              element={
                <InterestSelect
                  initial={interests}
                  onDone={(sel) => {
                    setInterests(sel)
                    navigate("/events")
                  }}
                />
              }
            />

            <Route
              path="/events"
              element={
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {profile
                        ? (<><b>{profile.firstName} {profile.lastName}</b> • {profile.email} • {interests.length} ilgi alanı</>)
                        : "Profil bilgisi yok"}
                    </div>
                    <button
                      onClick={() => alert("Profil kaydedildi (örnek).")}
                      className="rounded-lg bg-emerald-600 text-white text-sm font-medium px-3 py-2 hover:bg-emerald-700"
                    >
                      Profili Kaydet
                    </button>
                  </div>

                  {/* Events içeriği — Navbar bu dosyada değil */}
                  <EventsPage />
                </div>
              }
            />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* default: /register’a yönlendir */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
