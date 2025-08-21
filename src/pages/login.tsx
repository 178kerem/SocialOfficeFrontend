import { useMemo, useState, type FocusEvent, type ChangeEvent, type FormEvent } from "react"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import logo from "../assets/logo.png";

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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, type, checked, value } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true, remember: true })
    if (!isValid) return
    try {
      setSubmitting(true)
      // TODO: backend entegrasyonu
      onSuccess?.(form)
    } catch (err) {
      alert("Giriş başarısız (örnek).")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div
          className="
            rounded-2xl border border-slate-200 bg-white
            shadow-[0_10px_30px_-15px_rgba(2,6,23,0.12)]
            transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(2,6,23,0.18)]
            p-6
          "
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative mx-auto mb-3 grid place-items-center">
              <img src={logo} alt="Sosyal Ofis" className="h-18 w-18 object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Email */}
            <Input
              name="email"
              type="email"
              placeholder="ad.soyad@tubitak.gov.tr"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              leftIcon={<Mail className="h-5 w-5" aria-hidden />}
              error={touched.email && errors.email}
            />

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-5 w-5" aria-hidden />
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
                    "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                    "bg-white placeholder:text-slate-400",
                    "transition-all duration-200",
                    "pl-10 pr-10",
                    touched.password && errors.password
                      ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70"
                      : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1
                    rounded-md px-2 py-1 text-[11px]
                    text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors
                  "
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPass ? "Gizle" : "Göster"}
                </button>
              </div>
              {touched.password && errors.password ? (
                <p className="text-[11px] text-rose-600" role="alert">{errors.password}</p>
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
                  className="
                    h-4 w-4 rounded border-slate-300 text-sky-600
                    focus:ring-2 focus:ring-sky-300 focus:ring-offset-0
                  "
                />
                Beni hatırla
              </label>

              <a className="text-xs text-sky-700 hover:text-sky-800 hover:underline" href="/forgot-password">
                Şifremi unuttum
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              aria-busy={submitting}
              className={[
                "w-full inline-flex items-center justify-center gap-2",
                "rounded-xl py-2 text-sm font-medium text-white",
                "bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600",
                "shadow-sm ring-1 ring-inset ring-white/10",
                "transition-all duration-200 active:scale-[0.995]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Henüz hesabınız yok mu?{" "}
            <a href="/register" className="text-sky-700 hover:text-sky-800 hover:underline">
              Kayıt olun
            </a>
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
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
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
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          aria-invalid={!!error}
          className={[
            "w-full rounded-xl border px-3 py-2 text-sm outline-none",
            "bg-white placeholder:text-slate-400",
            "transition-all duration-200",
            leftIcon ? "pl-10" : "",
            error
              ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70"
              : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70",
          ].join(" ")}
        />
      </div>
      {error ? <p className="text-[11px] text-rose-600" role="alert">{error}</p> : null}
    </div>
  )
}
