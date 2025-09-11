// UserCreate.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ChevronDown } from "lucide-react";
import api from "src/api";
import logo from "../../assets/logo.png";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  sicil: string;
  dept: string;
  unit: string;
  password: string;
  password2: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  sicil: "",
  dept: "",
  unit: "",
  password: "",
  password2: "",
};

const initialTouched: Record<keyof FormState, boolean> = {
  firstName: false,
  lastName: false,
  email: false,
  sicil: false,
  dept: false,
  unit: false,
  password: false,
  password2: false,
};

export default function UserCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState(initialTouched);
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Zorunlu";
    if (!form.lastName.trim()) e.lastName = "Zorunlu";
    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.email.toLowerCase().endsWith("@tubitak.gov.tr");
    if (!emailOk) e.email = "Geçerli bir TÜBİTAK e-posta girin";
    if (!form.sicil.trim()) e.sicil = "Zorunlu";
    if (!form.dept) e.dept = "Seçin";
    if (!form.unit) e.unit = "Seçin";
    if (form.password.length < 6) e.password = "En az 6 karakter";
    if (form.password2 !== form.password) e.password2 = "Şifreler uyuşmuyor";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function markTouched(name: keyof FormState) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      sicil: true,
      dept: true,
      unit: true,
      password: true,
      password2: true,
    });
    if (!isValid) return;

    try {
      setSubmitting(true);
      // Backend'e kullanıcı ekleme
      await api.post("/User", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.sicil, // backend phone alanına sicil verdik
        dept: form.dept,
        unit: form.unit,
      });
      alert("Kayıt başarılı!");
      navigate("/users"); // kullanıcı listesine yönlendir
    } catch (err) {
      console.error(err);
      alert("Kayıt sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-sky-50/50 to-emerald-50/40 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-900/5 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-18 w-18 place-items-center">
              <img src={logo} alt="Sosyal Ofis" className="h-18 w-18 object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Hesap oluşturun</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="firstName"
                placeholder="Ad"
                value={form.firstName}
                onChange={handleChange}
                onBlur={() => markTouched("firstName")}
                error={touched.firstName && errors.firstName}
              />
              <Input
                name="lastName"
                placeholder="Soyad"
                value={form.lastName}
                onChange={handleChange}
                onBlur={() => markTouched("lastName")}
                error={touched.lastName && errors.lastName}
              />
            </div>

            <Input
              name="email"
              type="email"
              placeholder="ad.soyad@tubitak.gov.tr"
              value={form.email}
              onChange={handleChange}
              onBlur={() => markTouched("email")}
              leftIcon={<Mail className="h-5 w-5" aria-hidden />}
              error={touched.email && errors.email}
            />

            <Input
              name="sicil"
              placeholder="Sicil No"
              value={form.sicil}
              onChange={handleChange}
              onBlur={() => markTouched("sicil")}
              error={touched.sicil && errors.sicil}
            />

            <div className="grid grid-cols-2 gap-3 z-40">
              <SearchSelect
                label="Departman"
                value={form.dept}
                options={["Bilgi İşlem", "İnsan Kaynakları", "Proje Yönetimi", "Lojistik", "Diğer"]}
                onChange={(v) => setForm((f) => ({ ...f, dept: v }))}
                onBlurTouched={() => markTouched("dept")}
                error={touched.dept && errors.dept}
              />
              <SearchSelect
                label="Birim"
                value={form.unit}
                options={["A Birimi", "B Birimi", "C Birimi", "Diğer"]}
                onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                onBlurTouched={() => markTouched("unit")}
                error={touched.unit && errors.unit}
              />
            </div>

            <Input
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Şifre"
              value={form.password}
              onChange={handleChange}
              onBlur={() => markTouched("password")}
              leftIcon={<Lock className="h-5 w-5" aria-hidden />}
              rightIconButton={{
                onClick: () => setShowPwd((s) => !s),
                icon: showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
              }}
              error={touched.password && errors.password}
            />
            <Input
              name="password2"
              type={showPwd2 ? "text" : "password"}
              placeholder="Şifre Tekrar"
              value={form.password2}
              onChange={handleChange}
              onBlur={() => markTouched("password2")}
              leftIcon={<Lock className="h-5 w-5" />}
              rightIconButton={{
                onClick: () => setShowPwd2((s) => !s),
                icon: showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
              }}
              error={touched.password2 && errors.password2}
            />

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="group relative w-full h-11 rounded-xl overflow-hidden bg-indigo-500 text-white text-sm font-semibold ring-1 ring-indigo-400/40 hover:bg-indigo-500/90 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- SearchSelect ---------- */
function SearchSelect({
  label,
  value,
  options,
  onChange,
  error,
  onBlurTouched,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  error?: string | false;
  onBlurTouched?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const norm = (s: string) => s.toLocaleLowerCase("tr-TR");
  const filtered = useMemo(() => {
    const nq = norm(q);
    return options.filter((o) => (nq ? norm(o).includes(nq) : true));
  }, [q, options]);

  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, { capture: true });
    document.addEventListener("touchstart", onDoc, { capture: true });
    return () => {
      document.removeEventListener("mousedown", onDoc, { capture: true } as any);
      document.removeEventListener("touchstart", onDoc, { capture: true } as any);
    };
  }, []);

  const select = (v: string) => {
    onChange(v);
    setQ("");
    setOpen(false);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="relative z-40" ref={boxRef}>
        <input
          value={open ? q : value}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          onBlur={() => setTimeout(() => {
            setOpen(false);
            onBlurTouched?.();
          }, 120)}
          placeholder={`Seç…`}
          className={[
            "h-11 w-full rounded-xl border px-3 pr-9 text-sm text-slate-800 outline-none transition-shadow bg-white/70",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
        />
        <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
            >
              <div className="max-h-52 overflow-auto py-1">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">Eşleşen seçenek yok</div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => select(opt)}
                      className={[
                        "block w-full px-3 py-2 text-left text-sm",
                        opt === value ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </label>
  );
}

/* ---------- Input ---------- */
function Input(props: {
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  leftIcon?: React.ReactNode;
  rightIconButton?: { onClick: () => void; icon: React.ReactNode };
  error?: string | false;
}) {
  const { leftIcon, rightIconButton, error, placeholder, ...rest } = props;
  return (
    <div className="space-y-1">
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
        <input
          {...rest}
          placeholder={placeholder}
          className={[
            "h-11 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition-shadow",
            leftIcon ? "pl-10" : "",
            rightIconButton ? "pr-10" : "",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 bg-white/70 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
        />
        {rightIconButton && (
          <button
            type="button"
            onClick={rightIconButton.onClick}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500"
          >
            {rightIconButton.icon}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
