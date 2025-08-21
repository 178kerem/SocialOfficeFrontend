import { useMemo, useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

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
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function markTouched(name: keyof FormState) {
    setTouched((t) => ({ ...t, [name]: true }))
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
      onSuccess?.(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-sky-50/50 to-emerald-50/40 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-900/5 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-300 to-sky-300 text-white ring-1 ring-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                onBlur={() => markTouched("firstName")}
                error={touched.firstName && errors.firstName}
              />
              <Input
                name="lastName"
                placeholder="Soyad"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                onBlur={() => markTouched("lastName")}
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
              onBlur={() => markTouched("email")}
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
              onBlur={() => markTouched("sicil")}
              error={touched.sicil && errors.sicil}
            />

            {/* Departman / Birim — Searchable Combobox (non-creatable) */}
            <div className="grid grid-cols-2 gap-3 z-40">
              <SearchSelect
                label="Departman"
                value={form.dept}
                options={["Bilgi İşlem", "İnsan Kaynakları", "Proje Yönetimi", "Lojistik", "Diğer"]}
                placeholder="Departman seç…"
                onChange={(v) => setForm((f) => ({ ...f, dept: v }))}
                onBlurTouched={() => markTouched("dept")}
                error={touched.dept && errors.dept}
              />
              <SearchSelect
                label="Birim"
                value={form.unit}
                options={["A Birimi", "B Birimi", "C Birimi", "Diğer"]}
                placeholder="Birim seç…"
                onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                onBlurTouched={() => markTouched("unit")}
                error={touched.unit && errors.unit}
              />
            </div>

            {/* Şifreler */}
            <Input
              name="password"
              type="password"
              placeholder="Şifre"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => markTouched("password")}
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
              onBlur={() => markTouched("password2")}
              error={touched.password2 && errors.password2}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="group relative w-full h-11 rounded-xl overflow-hidden bg-indigo-500 text-white text-sm font-semibold ring-1 ring-indigo-400/40 hover:bg-indigo-500/90 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-[120%]" />
              {submitting ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Zaten hesabınız var mı?{" "}
            <a href="/login" className="font-medium text-indigo-600 hover:underline">Giriş yapın</a>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Searchable Combobox (non-creatable) ---------- */
function SearchSelect({
  label,
  value,
  options,
  onChange,
  onBlurTouched,
  placeholder = "Seç…",
  error,
  z = 40,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  onBlurTouched?: () => void
  placeholder?: string
  error?: string | false
  z?: number
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)

  const norm = (s: string) => s.toLocaleLowerCase("tr-TR")
  const filtered = useMemo(() => {
    const nq = norm(q)
    return options.filter((o) => (nq ? norm(o).includes(nq) : true))
  }, [q, options])

  // dışarı tıkla → kapat
  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current) return
      if (!boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc, { capture: true })
    document.addEventListener("touchstart", onDoc, { capture: true })
    return () => {
      document.removeEventListener("mousedown", onDoc, { capture: true } as any)
      document.removeEventListener("touchstart", onDoc, { capture: true } as any)
    }
  }, [])

  const select = (v: string) => {
    onChange(v)
    setQ("")
    setOpen(false)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const exact = filtered.find((o) => norm(o) === norm(q))
      if (exact) select(exact)
      else if (filtered.length === 1) select(filtered[0])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="relative" ref={boxRef}>
        <input
          value={open ? q : value}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setOpen(true)
            setQ("")
          }}
          onBlur={() => {
            // bir miktar geciktir ki listeden seçilebilsin
            setTimeout(() => {
              setOpen(false)
              onBlurTouched?.()
            }, 120)
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={[
            "h-11 w-full rounded-xl border px-3 pr-9 text-sm text-slate-800 outline-none transition-shadow",
            "bg-white/70",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {/* arrow */}
        <svg
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04L10 13.5 4.17 8.25a.75.75 0 011.06-1.04z" />
        </svg>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-[${z}] mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5`}
              onMouseDown={(e) => e.preventDefault()} // blur olmadan seçim
              role="listbox"
            >
              <div className="max-h-52 overflow-auto py-1">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Eşleşen seçenek yok
                  </div>
                ) : (
                  filtered.map((opt) => {
                    const selected = opt === value
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => select(opt)}
                        aria-selected={selected}
                        className={[
                          "block w-full px-3 py-2 text-left text-sm",
                          selected
                            ? "bg-sky-50 text-sky-700"
                            : "text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error ? <p className="text-[11px] text-rose-600" role="alert">{error}</p> : null}
    </label>
  )
}

/* ---------- küçük yardımcı inputlar ---------- */
function Input(props: {
  name: keyof FormState
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  autoComplete?: string
  leftIcon?: React.ReactNode
  error?: string | false
}) {
  const { leftIcon, error, placeholder, ...rest } = props
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
          aria-label={placeholder}
          aria-invalid={!!error}
          className={[
            "h-11 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition-shadow",
            leftIcon ? "pl-10" : "",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 bg-white/70 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
          placeholder={placeholder}
        />
      </div>
      {error ? <p className="text-[11px] text-rose-600" role="alert">{error}</p> : null}
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
