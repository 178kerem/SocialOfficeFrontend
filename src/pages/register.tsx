import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
type FormState = {
  firstName: string
  lastName: string
  email: string
  sicil: string
  dept: string
  unit: string
  password: string
  password2: string
}

type RegisterProps = {
  onSuccess?: (data: FormState) => void
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  sicil: "",
  dept: "",
  unit: "",
  password: "",
  password2: "",
}

const initialTouched: Record<keyof FormState, boolean> = {
  firstName: false,
  lastName: false,
  email: false,
  sicil: false,
  dept: false,
  unit: false,
  password: false,
  password2: false,
}

export default function Register({ onSuccess }: RegisterProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(initialTouched)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {}

    if (!form.firstName.trim()) e.firstName = "Zorunlu"
    if (!form.lastName.trim()) e.lastName = "Zorunlu"

    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.email.toLowerCase().endsWith("@tubitak.gov.tr")
    if (!emailOk) e.email = "Geçerli bir TÜBİTAK e-posta girin"

    if (!form.sicil.trim()) e.sicil = "Zorunlu"
    if (!form.dept) e.dept = "Seçin"
    if (!form.unit) e.unit = "Seçin"

    if (form.password.length < 6) e.password = "En az 6 karakter"
    if (form.password2 !== form.password) e.password2 = "Şifreler uyuşmuyor"

    return e
  }, [form])

  const isValid = Object.keys(errors).length === 0

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true } as typeof t))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      sicil: true,
      dept: true,
      unit: true,
      password: true,
      password2: true,
    })
    if (!isValid) return

    try {
      setSubmitting(true)
      // TODO: API entegrasyonu
      // await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })

      // akış: başarıyla kaydolunca bir sonraki adıma geç
      onSuccess?.(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white shadow p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z" />
                <path strokeWidth={1.5} d="M4 20a8 8 0 0116 0" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Hesap oluşturun</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {/* Ad Soyad */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="firstName"
                placeholder="Ad"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && errors.firstName}
              />
              <Input
                name="lastName"
                placeholder="Soyad"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
              />
            </div>

            {/* E-posta */}
            <Input
              name="email"
              type="email"
              placeholder="ad.soyad@tubitak.gov.tr"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              leftIcon={
                <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth={1.5} d="M3 6l9 7 9-7" />
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                </svg>
              }
              error={touched.email && errors.email}
            />

            {/* Sicil */}
            <Input
              name="sicil"
              placeholder="Sicil No"
              autoComplete="off"
              value={form.sicil}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.sicil && errors.sicil}
            />

            {/* Departman / Birim */}
            <div className="grid grid-cols-2 gap-3">
              <Select
                name="dept"
                value={form.dept}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Departman"
                options={["Bilgi İşlem", "İnsan Kaynakları", "Proje Yönetimi", "Lojistik", "Diğer"]}
                error={touched.dept && errors.dept}
              />
              <Select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Birim"
                options={["A Birimi", "B Birimi", "C Birimi", "Diğer"]}
                error={touched.unit && errors.unit}
              />
            </div>

            {/* Şifre */}
            <Input
              name="password"
              type="password"
              placeholder="Şifre"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              leftIcon={<LockIcon />}
              error={touched.password && errors.password}
            />
            <Input
              name="password2"
              type="password"
              placeholder="Şifre Tekrar"
              autoComplete="new-password"
              value={form.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password2 && errors.password2}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full rounded bg-blue-600 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Zaten hesabınız var mı?{" "}
            < Link to="/login" className="text-blue-600 hover:underline">
                 Giriş yapın
                </Link>
              </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- küçük yardımcı bileşenler ---------- */

function Input(props: {
  name: keyof FormState
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  leftIcon?: React.ReactNode
  error?: string | false
}) {
  const { leftIcon, error, ...rest } = props
  return (
    <div className="space-y-1">
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          aria-invalid={!!error}
          className={[
            "w-full rounded border px-3 py-1.5 text-sm outline-none",
            leftIcon ? "pl-10" : "",
            error ? "border-red-400 focus:border-red-400 ring-2 ring-red-100" : "border-slate-300 focus:border-slate-400 ring-2 ring-transparent focus:ring-blue-200",
          ].join(" ")}
        />
      </div>
      {error ? <p className="text-[11px] text-red-600" role="alert">{error}</p> : null}
    </div>
  )
}

function Select(props: {
  name: keyof FormState
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  placeholder: string
  options: string[]
  error?: string | false
}) {
  const { placeholder, options, error, ...rest } = props
  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          {...rest}
          aria-invalid={!!error}
          className={[
            "w-full appearance-none rounded border bg-white py-1.5 pl-3 pr-8 text-sm outline-none",
            error ? "border-red-400 focus:border-red-400 ring-2 ring-red-100" : "border-slate-300 focus:border-slate-400 ring-2 ring-transparent focus:ring-blue-200",
          ].join(" ")}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </span>
      </div>
      {error ? <p className="text-[11px] text-red-600" role="alert">{error}</p> : null}
    </div>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M7 10V7a5 5 0 1110 0v3" />
      <rect x="5" y="10" width="14" height="10" rx="2" />
    </svg>
  )
}
