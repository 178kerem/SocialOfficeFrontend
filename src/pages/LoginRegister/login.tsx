// src/pages/LoginRegister/login.tsx
import React, { useState, useMemo, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

const initial: LoginForm = { email: "", password: "", remember: true };

export default function Login() {
  const [form, setForm] = useState<LoginForm>(initial);
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({
    email: false,
    password: false,
    remember: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const e: Partial<Record<keyof LoginForm, string>> = {};
    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.email.toLowerCase().endsWith("@tubitak.gov.tr");
    if (!emailOk) e.email = "Geçerli bir TÜBİTAK e-posta girin";
    if (form.password.length < 6) e.password = "En az 6 karakter";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, remember: true });
    if (!isValid) return;

    try {
      setSubmitting(true);

      // <-- burada tipi any olarak belirledim, TS hatasını çözer
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
        auth.login(token, email, userId, type, form.remember);
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        // Kullanıcının toasty görmesi için kısa gecikme
        setTimeout(() => navigate("/events"), 1000);
      } else {
        toast.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Giriş başarısız, sunucuya ulaşılamadı veya kimlik doğrulama başarısız.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-sky-50/50 to-emerald-50/40 px-4">
      <div className="w-full max-w-md">
        {/* Toast container */}
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-900/5 p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-18 w-18 place-items-center">
              <img src={logo} alt="Sosyal Ofis" className="h-18 w-18 object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sosyal Ofis</h1>
            <p className="text-slate-600 text-sm">Giriş yapın</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="ad.soyad@tubitak.gov.tr"
              value={form.email}
              onChange={e =>
                setForm(f => ({ ...f, email: e.target.value }))
              }
              onBlur={e => setTouched(t => ({ ...t, email: true }))}
              leftIcon={<Mail className="h-5 w-5" />}
              error={touched.email && errors.email}
            />

            <div className="space-y-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Şifre"
                  value={form.password}
                  onChange={e =>
                    setForm(f => ({ ...f, password: e.target.value }))
                  }
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  aria-invalid={!!(touched.password && errors.password)}
                  className={[
                    "w-full rounded-xl border px-3 py-2 text-sm outline-none pl-10 pr-10",
                    touched.password && errors.password
                      ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70"
                      : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center rounded-md px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-rose-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={e =>
                  setForm(f => ({ ...f, remember: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-300"
              />
              Beni hatırla
            </label>

            <button
              type="submit"
              disabled={!isValid || submitting}
              aria-busy={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          aria-invalid={!!error}
          className={[
            "w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white placeholder:text-slate-400 transition-all duration-200",
            leftIcon ? "pl-10" : "",
            error
              ? "border-rose-300 focus:border-rose-400 ring-4 ring-rose-100/70"
              : "border-slate-300 focus:border-sky-400 ring-4 ring-sky-100/70",
          ].join(" ")}
        />
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
