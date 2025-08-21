import { useMemo, useState } from "react"

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

type LoginProps = {
  onSuccess?: (data: LoginForm) => void
}

const initial: LoginForm = {
  email: "",
  password: "",
  remember: true,
}

export default function Login({ onSuccess }: LoginProps) {
  const [form, setForm] = useState<LoginForm>(initial)
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({
    email: false,
    password: false,
    remember: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof LoginForm, string>> = {}
    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.email.toLowerCase().endsWith("@tubitak.gov.tr")
    if (!emailOk) e.email = "Geçerli bir TÜBİTAK e-posta girin"
    if (form.password.length < 6) e.password = "En az 6 karakter"
    return e
  }, [form])

  const isValid = Object.keys(errors).length === 0

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, type, checked, value } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }
  function handleBlur(
    e: React.FocusEvent<HTMLInputElement>
  ) {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true, remember: true })
    if (!isValid) return

    try {
      setSubmitting(true)
      // TODO: backend entegrasyonu
      // const res = await fetch("/api/login", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) })
      // if (!res.ok) throw new Error("Giriş başarısız")
      onSuccess?.(form)
    } catch (err) {
      alert("Giriş başarısız (örnek).")
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
              <svg className="h-6 w-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z" />
                <path strokeWidth={1.5} d="M4 20a8 8 0 0116 0" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <LockIcon />
                </span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Şifre"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.password && errors.password)}
                  className={[
                    "w-full rounded border px-3 py-1.5 text-sm outline-none",
                    "pl-10 pr-10",
                    touched.password && errors.password
                      ? "border-red-400 focus:border-red-400 ring-2 ring-red-100"
                      : "border-slate-300 focus:border-slate-400 ring-2 ring-transparent focus:ring-blue-200",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPass ? "Gizle" : "Göster"}
                </button>
              </div>
              {touched.password && errors.password ? (
                <p className="text-[11px] text-red-600" role="alert">{errors.password}</p>
              ) : null}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                Beni hatırla
              </label>

              <a className="text-xs text-blue-600 hover:underline" href="/forgot-password">
                Şifremi unuttum
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full rounded bg-blue-600 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Henüz hesabınız yok mu?{" "}
            <a href="/register" className="text-blue-600 hover:underline">Kayıt olun</a>
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------- küçük yardımcılar -------- */
function Input(props: {
  name: keyof LoginForm
  value: any
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
            error
              ? "border-red-400 focus:border-red-400 ring-2 ring-red-100"
              : "border-slate-300 focus:border-slate-400 ring-2 ring-transparent focus:ring-blue-200",
          ].join(" ")}
        />
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
