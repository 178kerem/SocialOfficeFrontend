// src/App.tsx
import { useState, type ReactNode } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/navbar";
import Register from "@/pages/LoginRegister/register";
import Login from "@/pages/LoginRegister/login";
import InterestSelect from "@/pages/InterestSelect";
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
import IlgiTakip from "./pages/AdminPages/ilgiAlanıtakip";
import EtkinlikOnOnayPage from "./pages/AdminPages/talepEdilenEtkinliklerOnOnay";
import { AuthProvider, useAuth } from "./context/AuthContext";

type Profile = {
  userId: string;
  fullName: string;
  email: string;
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const raw = localStorage.getItem("profile");
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  });

  const [interests, setInterests] = useState<string[]>([]);
  const navigate = useNavigate();
  const auth = useAuth();
  const location = useLocation();

  // Logout olunca profile temizle
  if (!auth.isAuthenticated && profile) {
    setProfile(null);
    localStorage.removeItem("profile");
  }

  // Login & Register sayfalarında Navbar gizle
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <Navbar fixed />}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="min-h-screen">
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Register */}
            <Route path="/register" element={<Register />} />

            {/* Interests */}
            <Route
              path="/interests"
              element={
                <ProtectedRoute>
                  <InterestSelect
                    initial={interests}
                    onDone={(sel) => {
                      setInterests(sel);
                      navigate("/events");
                    }}
                  />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        {profile ? <b>{profile.fullName}</b> : "Profil bilgisi yok"}
                      </div>
                    </div>
                    <EventsPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />
            <Route path="/fikirler" element={<ProtectedRoute><FikirlerPage /></ProtectedRoute>} />
            <Route path="/talepler" element={<ProtectedRoute><TaleplerPage /></ProtectedRoute>} />
            <Route path="/admin/etkinlik-on-onay" element={<ProtectedRoute><EtkinlikOnOnayPage /></ProtectedRoute>} />
            <Route path="/admin/fikir-secim" element={<ProtectedRoute><IdeasPage /></ProtectedRoute>} />
            <Route path="/admin/ilgi-alani-takip" element={<ProtectedRoute><IlgiTakip /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/talep-etkinlik-onay" element={<ProtectedRoute><EtkinlikTalepOnayPage /></ProtectedRoute>} />

            {/* Defaults */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
