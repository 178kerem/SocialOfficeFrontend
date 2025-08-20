import { useMemo, useState } from "react"

type Tab = "profile" | "security"

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile")

  // ---- Profile state ----
  const [profile, setProfile] = useState({
    firstName: "Tim",
    lastName: "Cook",
    email: "tim.cook@example.com",
    title: "Product Manager",
    language: "Türkçe",
    employeeId: "123456",
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ---- Security state ----
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [newPass2, setNewPass2] = useState("")
  const [savingSecurity, setSavingSecurity] = useState(false)

  const secChecks = useMemo(() => {
    const len = newPass.length >= 8
    const up  = /[A-Z]/.test(newPass)
    const low = /[a-z]/.test(newPass)
    const dig = /\d/.test(newPass)
    const sym = /[^A-Za-z0-9]/.test(newPass)
    const match = !!newPass && newPass === newPass2
    return { len, up, low, dig, sym, match }
  }, [newPass, newPass2])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSavingProfile(true)
      // await fetch("/api/settings/profile", { method:"POST", body: JSON.stringify(profile) })
      alert("Profil kaydedildi (örnek).")
    } finally {
      setSavingProfile(false)
    }
  }

  async function saveSecurity(e: React.FormEvent) {
    e.preventDefault()
    if (!secChecks.len || !secChecks.up || !secChecks.low || !secChecks.dig || !secChecks.sym || !secChecks.match) {
      alert("Şifre koşullarını sağlayın.")
      return
    }
    try {
      setSavingSecurity(true)
      // await fetch("/api/settings/security", { method:"POST", body: JSON.stringify({ oldPass, newPass }) })
      alert("Şifre güncellendi (örnek).")
      setOldPass(""); setNewPass(""); setNewPass2("")
    } finally {
      setSavingSecurity(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SOL yan menü (sayfa içi) */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Ayarlar</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <nav className="rounded-xl border border-slate-200 bg-white p-2">
              <button
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab === "profile" ? "bg-slate-100 font-medium" : "hover:bg-slate-50"}`}
                onClick={() => setTab("profile")}
              >
                Kullanıcı Bilgileri
              </button>
              <button
                className={`mt-1 w-full rounded-lg px-3 py-2 text-left text-sm ${tab === "security" ? "bg-slate-100 font-medium" : "hover:bg-slate-50"}`}
                onClick={() => setTab("security")}
              >
                Güvenlik & Şifre
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="col-span-12 md:col-span-9">
            {tab === "profile" ? (
              <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-lg font-medium text-slate-900">Kullanıcı Bilgileri</h2>
                <div className="space-y-3">
                  <Row label="İsim">
                    <Two>
                      <Input value={profile.firstName} onChange={(v)=>setProfile(p=>({...p, firstName:v}))} />
                      <Input value={profile.lastName} onChange={(v)=>setProfile(p=>({...p, lastName:v}))} />
                    </Two>
                  </Row>
                  <Row label="E-posta">
                    <Input type="email" value={profile.email} onChange={(v)=>setProfile(p=>({...p, email:v}))}/>
                  </Row>
                  <Row label="Sicil Numarası">
                    <Input value={profile.employeeId} onChange={(v)=>setProfile(p=>({...p, employeeId:v}))}/>
                  </Row>
                  <Row label="Ünvan">
                    <Input value={profile.title} onChange={(v)=>setProfile(p=>({...p, title:v}))}/>
                  </Row>
                  <Row label="Dil">
                    <Select value={profile.language} onChange={(v)=>setProfile(p=>({...p, language:v}))}
                      options={["Türkçe","English","Deutsch","Français"]}/>
                  </Row>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingProfile ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={saveSecurity} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-lg font-medium text-slate-900">Güvenlik & Şifre</h2>

                <div className="space-y-3">
                  <Row label="Mevcut Şifre"><Input type="password" value={oldPass} onChange={setOldPass}/></Row>
                  <Row label="Yeni Şifre"><Input type="password" value={newPass} onChange={setNewPass}/></Row>
                  <Row label="Şifre Tekrar"><Input type="password" value={newPass2} onChange={setNewPass2}/></Row>
                </div>

                {/* Şifre kuralları */}
                <ul className="mt-4 space-y-1 text-xs">
                  <Check ok={secChecks.len}  text="En az 8 karakter" />
                  <Check ok={secChecks.up}   text="En az bir büyük harf (A-Z)" />
                  <Check ok={secChecks.low}  text="En az bir küçük harf (a-z)" />
                  <Check ok={secChecks.dig}  text="En az bir rakam (0-9)" />
                  <Check ok={secChecks.sym}  text="En az bir sembol (!@#$…)" />
                  <Check ok={secChecks.match} text="Şifreler eşleşiyor" />
                </ul>

                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={()=>{setOldPass(""); setNewPass(""); setNewPass2("")}}
                          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                    Sıfırla
                  </button>
                  <button
                    type="submit"
                    disabled={savingSecurity}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {savingSecurity ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

/* ---------- küçük yardımcı bileşenler ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3">
      <div className="col-span-12 sm:col-span-4 text-sm text-slate-600">{label}</div>
      <div className="col-span-12 sm:col-span-8">{children}</div>
    </div>
  )
}
function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}
function Input({ value, onChange, type="text" }:{
  value: string; onChange: (v:string)=>void; type?: string
}) {
  return (
    <input
      value={value}
      onChange={(e)=>onChange(e.target.value)}
      type={type}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
    />
  )
}
function Select({ value, onChange, options }:{
  value: string; onChange: (v:string)=>void; options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e)=>onChange(e.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-700" : "text-slate-600"}`}>
      <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${ok ? "bg-emerald-100" : "bg-slate-200"}`}>
        {ok ? "✓" : "×"}
      </span>
      {text}
    </li>
  )
}
