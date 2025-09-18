import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

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

export default function Register() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>(
    Object.fromEntries(Object.keys(initialForm).map(k => [k, false])) as Record<
      keyof FormState,
      boolean
    >
  );
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const markTouched = (name: keyof FormState) => {
    setTouched(t => ({ ...t, [name]: true }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(
      Object.fromEntries(Object.keys(form).map(k => [k, true])) as Record<
        keyof FormState,
        boolean
      >
    );
    if (!isValid) return;

    try {
      setSubmitting(true);

      // 1. Kullanıcıyı kaydet
      await api.post<FormState>("/user", form);

      // 2. Kayıttan sonra otomatik login ol
      const res: any = await api.post("/User/login", {
        email: form.email,
        password: form.password,
      });

      const payload = res?.data?.data ?? res?.data ?? {};
      const token = payload.token ?? "";
      const userId = String(payload.userId ?? "");
      const email = payload.email ?? form.email;
      const type = payload.type ?? "";

      if (res.status === 200 && token) {
        auth.login(token, email, userId, type, true);
        toast.success("Kayıt başarılı! Hoşgeldiniz.");
        navigate("/interests");
      } else {
        toast.error("Kayıt başarılı ama giriş yapılamadı.");
      }
    } catch (err) {
      console.error("Kullanıcı oluşturulamadı:", err);
      toast.error("Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-sky-50/50 to-emerald-50/40 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-900/5 p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-18 w-18 place-items-center">
              <img src={logo} alt="Sosyal Ofis" className="h-18 w-18 object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Hesap oluşturun</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-3">
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

            <Input
              name="email"
              type="email"
              placeholder="ad.soyad@tubitak.gov.tr"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => markTouched("email")}
              leftIcon={<Mail className="h-5 w-5" />}
              error={touched.email && errors.email}
            />

            <Input
              name="sicil"
              placeholder="Sicil No"
              autoComplete="off"
              value={form.sicil}
              onChange={handleChange}
              onBlur={() => markTouched("sicil")}
              error={touched.sicil && errors.sicil}
            />

            <div className="grid grid-cols-2 gap-3">
              <SearchSelect
                label="Departman"
                value={form.dept}
                options={["Bilgi İşlem", "İnsan Kaynakları", "Proje Yönetimi", "Lojistik", "Diğer"]}
                placeholder="Departman seç…"
                onChange={v => setForm(f => ({ ...f, dept: v }))}
                onBlurTouched={() => markTouched("dept")}
                error={touched.dept && errors.dept}
              />
              <SearchSelect
                label="Birim"
                value={form.unit}
                options={["A Birimi", "B Birimi", "C Birimi", "Diğer"]}
                placeholder="Birim seç…"
                onChange={v => setForm(f => ({ ...f, unit: v }))}
                onBlurTouched={() => markTouched("unit")}
                error={touched.unit && errors.unit}
              />
            </div>

            <Input
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Şifre"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => markTouched("password")}
              leftIcon={<Lock className="h-5 w-5" />}
              rightIconButton={{
                onClick: () => setShowPwd(s => !s),
                icon: showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
                label: showPwd ? "Şifreyi gizle" : "Şifreyi göster",
              }}
              error={touched.password && errors.password}
            />

            <Input
              name="password2"
              type={showPwd2 ? "text" : "password"}
              placeholder="Şifre Tekrar"
              autoComplete="new-password"
              value={form.password2}
              onChange={handleChange}
              onBlur={() => markTouched("password2")}
              leftIcon={<Lock className="h-5 w-5" />}
              rightIconButton={{
                onClick: () => setShowPwd2(s => !s),
                icon: showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
                label: showPwd2 ? "Şifreyi gizle" : "Şifreyi göster",
              }}
              error={touched.password2 && errors.password2}
            />

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full h-11 rounded-xl bg-indigo-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Input Component ---------- */
function Input(props: {
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  leftIcon?: React.ReactNode;
  rightIconButton?: { onClick: () => void; icon: React.ReactNode; label?: string };
  error?: string | false;
}) {
  const { leftIcon, rightIconButton, error, placeholder, ...rest } = props;
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
            rightIconButton ? "pr-10" : "",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 bg-white/70 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
          placeholder={placeholder}
        />
        {rightIconButton && (
          <button
            type="button"
            onClick={rightIconButton.onClick}
            aria-label={rightIconButton.label ?? "Göster/Gizle"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {rightIconButton.icon}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

/* ---------- SearchSelect Component ---------- */
function SearchSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Seç…",
  error,
  onBlurTouched,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | false;
  onBlurTouched?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

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
    setOpen(false);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="relative z-40" ref={boxRef}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={[
            "h-11 w-full rounded-xl border px-3 text-sm text-left outline-none transition-shadow",
            value ? "text-slate-900" : "text-slate-400",
            error
              ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200"
              : "border-slate-200 ring-2 ring-transparent focus:border-slate-300 focus:ring-sky-200",
          ].join(" ")}
        >
          {value || placeholder}
        </button>

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</div>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-52 overflow-auto">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => select(opt)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  opt === value ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </label>
  );
}
