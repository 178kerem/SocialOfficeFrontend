import { useState } from "react"
import Navbar from "@/components/navbar"
import Register from "@/pages/register"
import InterestSelect from "@/pages/InterestsSelect"
import EventsPage from "@/pages/events"

type Step = "register" | "interests" | "events"
type Profile = {
  firstName: string; lastName: string; email: string;
  sicil: string; dept: string; unit: string
}

export default function App() {
  const [step, setStep] = useState<Step>("register")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [interests, setInterests] = useState<string[]>([])

  return (
   <div className="min-h-screen bg-slate-50 flex">
     

      {/* içerik alanı */}
      <main className="flex-1 overflow-y-auto">
        {step === "register" && (
          <Register onSuccess={(form) => { setProfile(form); setStep("interests") }} />
        )}

        {step === "interests" && (
          <InterestSelect initial={interests} onDone={(sel) => { setInterests(sel); setStep("events") }} />
        )}

        {step === "events" && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {profile ? <><b>{profile.firstName} {profile.lastName}</b> • {profile.email} • {interests.length} ilgi alanı</> : "Profil bilgisi yok"}
              </div>
              <button
                onClick={() => alert("Profil kaydedildi (örnek).")}
                className="rounded-lg bg-emerald-600 text-white text-sm font-medium px-3 py-2 hover:bg-emerald-700"
              >
                Profili Kaydet
              </button>
            </div>

            {/* Events içeriği konteyner içinde */}
            <EventsPage />
            <Navbar/>
          </div>
        )}
      </main>
    </div>
  )
}

function EventsPageWrapper({
  profile, interests,
}: { profile: Profile | null; interests: string[] }) {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {profile
            ? (<><b>{profile.firstName} {profile.lastName}</b> • {profile.email} • {interests.length} ilgi alanı</>)
            : "Profil bilgisi yok"}
        </div>
        <button
          onClick={() => {
            // TODO: profile + interests'i API'ye POST et
            // fetch('/api/profile', { method:'POST', body: JSON.stringify({ profile, interests }) })
            alert("Profil kaydedildi (örnek).")
          }}
          className="rounded-lg bg-emerald-600 text-white text-sm font-medium px-3 py-2 hover:bg-emerald-700"
        >
          Profili Kaydet
        </button>
      </div>

      <EventsPage />
    </div>
  )
}
