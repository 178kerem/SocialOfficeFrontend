import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/navbar";
import Register from "@/pages/register";
import InterestSelect from "@/pages/InterestsSelect";
import EventsPage from "@/pages/events";
import CalendarPage from "./pages/calendar";
import RequestsPage from "./pages/requestEvents";
import NotificationsPage from "./pages/bildirimler";
import FikirlerPage from "./pages/fikirler";
import TaleplerPage from "./pages/talepler";
import ProfileDashboard from "./pages/profile";
import IdeasPage from "./pages/AdminPages/fikirSecimPage";
import EtkinlikTalepOnayPage from "./pages/AdminPages/talepEtkinlikOnayPage";
import SettingsPage from "./pages/settings";
import Login from "./pages/login";
import IlgiTakip from "./pages/AdminPages/ilgiAlanıtakip";   
import EtkinlikOnOnayPage from "./pages/AdminPages/talepEdilenEtkinliklerOnOnay";

type Profile = {
  firstName: string; 
  lastName: string; 
  email: string;
  sicil: string; 
  dept: string; 
  unit: string;
};

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sol sabit navbar */}
      <Navbar fixed />

      {/* İçerik: nav dar (w-16) iken ml-16, hover’da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="min-h-screen">
          <Routes>
            {/* Hepsi KİLİTSİZ */}
            <Route
              path="/register"
              element={
                <Register
                  onSuccess={(form) => {
                    setProfile(form);
                    navigate("/interests");
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
                    setInterests(sel);
                    navigate("/events");
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
                      {profile ? (
                        <>
                          <b>{profile.firstName} {profile.lastName}</b> • {profile.email} • {interests.length} ilgi alanı
                        </>
                      ) : (
                        "Profil bilgisi yok"
                      )}
                    </div>
                  </div>

                  <EventsPage />
                </div>
              }
            />

            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfileDashboard />} />
            <Route path="/fikirler" element={<FikirlerPage />} />
            <Route path="/talepler" element={<TaleplerPage />} />
            <Route path="/admin/etkinlik-on-onay" element={<EtkinlikOnOnayPage />} />


            <Route path="/admin/fikir-secim" element={<IdeasPage />} />
            <Route path="/admin/talep-etkinlik-onay" element={<EtkinlikTalepOnayPage />} />
            <Route path="/admin/ilgi-alani-takip" element={<IlgiTakip />} />   

            {/* Default yönlendirmeler */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
