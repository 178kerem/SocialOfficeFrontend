// src/pages/LoginRegister/login.tsx
import React, { useState, useMemo, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../../api";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginProps = {
  onSuccess: (data: {
    token: string;
    profile: { userId: string; fullName: string; email: string };
    remember: boolean;
  }) => void;
};

const initial: LoginForm = { email: "", password: "", remember: true };

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [form, setForm] = useState<LoginForm>(initial);
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({
    email: false,
    password: false,
    remember: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof LoginForm, string>> = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.email.toLowerCase().endsWith("@tubitak.gov.tr");
    if (!emailOk) e.email = "Geçerli bir TÜBİTAK e-posta girin";
    if (form.password.length < 6) e.password = "En az 6 karakter";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, remember: true });
    if (!isValid) return;

    try {
      setSubmitting(true);

      // Axios v1 uyumlu, tipleri 'any' ile hallettik
      const res: any = await api.post("/User/login", { email: form.email, password: form.password });

      console.log("login response:", res?.data);

      // backend dönüşünü esnek parse et
      const payload = res?.data?.data ?? res?.data ?? {};
      const token = payload.token ?? payload.Token ?? "";
      const userId = payload.userId ?? payload.UserId ?? "";
      const fullName = payload.fullName ?? payload.FullName ?? `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim();
      const email = payload.email ?? payload.Email ?? form.email;

      if (res.status === 200 && token) {
        onSuccess({
          token,
          profile: { userId: String(userId), fullName: String(fullName), email: String(email) },
          remember: form.remember,
        });
      } else {
        alert("Giriş başarısız!");
      }
    } catch (err) {
      console.error("Login hatası:", err);
      alert("Giriş başarısız, sunucuya ulaşılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Sosyal Ofis" className="h-18 w-18 object-contain" />
          <h1 className="mt-2 text-xl font-semibold text-slate-700">Giriş Yap</h1>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
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
                  "w-full rounded-xl border px-3 py-2 text-sm outline-none pl-10 pr-10",
                  touched.password && errors.password ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70" : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPass ? "Gizle" : "Göster"}
              </button>
            </div>
            {touched.password && errors.password ? <p className="text-[11px] text-rose-600" role="alert">{errors.password}</p> : null}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} onBlur={handleBlur} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-300" />
            Beni hatırla
          </label>

          <button type="submit" disabled={!isValid || submitting} aria-busy={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          Hesabınız yok mu? <Link to="/register" className="text-blue-600 hover:underline">Kaydolun</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

/* ---------- Küçük yardımcı Input ---------- */
function Input(props: {
  name: keyof LoginForm;
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  leftIcon?: React.ReactNode;
  error?: string | false;
}) {
  const { leftIcon, error, ...rest } = props;
  return (
    <div className="space-y-1">
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</span>}
        <input {...rest} aria-invalid={!!error} className={["w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white placeholder:text-slate-400 transition-all duration-200", leftIcon ? "pl-10" : "", error ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70" : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70"].join(" ")} />
      </div>
      {error ? <p className="text-[11px] text-rose-600" role="alert">{error}</p> : null}
    </div>
  );
}
