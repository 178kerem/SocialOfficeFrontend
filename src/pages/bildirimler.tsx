  // src/pages/bildirimler.tsx
  import { useMemo, useState } from "react";
  import { AnimatePresence, motion } from "framer-motion";
  import {
    Bell,
    BadgeCheck,
    CalendarClock,
    Trophy,
    MessageSquare,
    UserCheck,
    Trash2,
  } from "lucide-react";

  /* ——— Minimal UI ——— */
  const shell = {
    panel:
      "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
    pill: "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
  };

  type NotifType =
    | "katilim"
    | "ilgi"
    | "davet"
    | "degerlendirme"
    | "rozet"
    | "yaklasan";

  type Notification = {
    id: number;
    type: NotifType;
    title: string;
    text: string;
    createdAt: string; // ISO
    read: boolean;
    cta?: { label: string; onClick?: () => void };
  };

  /* ——— Seed ——— */
  const seed: Notification[] = [
    {
      id: 1,
      type: "degerlendirme",
      title: "Etkinlik değerlendirme",
      text: "Katıldığınız Bisiklet Sürme etkinliğini nasıl buldunuz?",
      createdAt: minutesAgo(5),
      read: false,
      cta: { label: "Değerlendir" },
    },
    {
      id: 2,
      type: "katilim",
      title: "Katılım",
      text: "Satranç turnuvasına katıldınız.",
      createdAt: minutesAgo(10),
      read: false,
    },
    {
      id: 3,
      type: "ilgi",
      title: "Talep",
      text: "Yeni bir talep oluşturuldu.",
      createdAt: minutesAgo(15),
      read: true,
    },
    {
      id: 4,
      type: "davet",
      title: "Etkinlik Davet",
      text: "21.11.2025 tarihinde kampüs sahasında Futbol Turnuvasına davet edildiniz.",
      createdAt: minutesAgo(15),
      read: false,
      cta: { label: "Katıl" },
    },
    {
      id: 5,
      type: "rozet",
      title: "Rozet",
      text: "Tebrikler! ‘Satranç’ rozetini kazandınız.",
      createdAt: minutesAgo(15),
      read: false,
    },
    {
      id: 6,
      type: "yaklasan",
      title: "Yaklaşan Etkinlik",
      text: "25.12.2025 tarihinde kafe sohbet etkinliğiniz var.",
      createdAt: minutesAgo(10),
      read: true,
    },
  ];

  /* ——— Sayfa ——— */
  export default function NotificationsPage() {
    const [items, setItems] = useState<Notification[]>(seed);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const filtered = useMemo(
      () => items.filter((n) => (showUnreadOnly ? !n.read : true)),
      [items, showUnreadOnly]
    );

    function markAllRead() {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    function toggleRead(id: number) {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
      );
    }
    function remove(id: number) {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }

    return (
      <div className="min-h-dvh w-full bg-gradient-to-b from-indigo-50/40 via-sky-50/40 to-emerald-50/40">
        {/* içerik (navbar ile hizalı) */}
        <div className="ml-16 transition-[margin-left] duration-300 peer-hover/nav:ml-64">
          <div className="mx-auto max-w-3xl px-4 pt-6 pb-10">
            <header className="mb-4">
              <h1 className="text-2xl font-semibold text-slate-900">Bildirimler</h1>
            </header>

            {/* filtre paneli — sade ve tek ton */}
            <div className={`${shell.panel} mb-6 p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Toplam <b>{items.length}</b> · Okunmayan{" "}
                  <b>{items.filter((i) => !i.read).length}</b>
                </p>

                <div className="flex items-center gap-3">
                  <label className="inline-flex select-none items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={showUnreadOnly}
                      onChange={(e) => setShowUnreadOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
                    />
                    Sadece okunmayanlar
                  </label>

                  <button
                    onClick={markAllRead}
                    className={`${shell.pill} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-300`}
                  >
                    Hepsini okundu yap
                  </button>
                </div>
              </div>
            </div>

            {/* liste — tek sütun */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence initial={false}>
                {filtered.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notif={n}
                    onToggleRead={() => toggleRead(n.id)}
                    onRemove={() => remove(n.id)}
                  />
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">
                  Gösterilecek bildirim yok.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function NotificationCard({
    notif,
    onRemove,
  }: {
    notif: Notification;
    onToggleRead: () => void;
    onRemove: () => void;
  }) {
    const MIcon = iconFor(notif.type);
    const time = timeAgo(notif.createdAt);

    return (
      <div className="bg-blue-100/50 rounded-2xl">
        <motion.article
          layout
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.18 }}
          className={[shell.panel, "relative p-5 ring-slate-200/70"].join(" ")}
          aria-live="polite"
        >
          {/* okunmayan için sol ince vurgu + küçük nokta */}
          {!notif.read && (
            <>
              <span
                aria-hidden
                className="absolute left-0 top-5 h-7 w-1 rounded-r-full bg-indigo-400"
              />
              <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </>
          )}

          {/* üst satır: ikon + başlık + zaman + sil */}
          <div className="mb-2 flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
              <MIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-3">
                <h3 className="truncate text-[15px] font-semibold leading-6 text-slate-900">
                  {notif.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] text-slate-500">{time}</span>
                  <button
                    onClick={onRemove}
                    className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100"
                    title="Sil"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">{notif.text}</p>

              {/* alt satır: aksiyonlar */}
              {notif.cta && (
                <div className="mt-4">
                  <button
                    onClick={() => notif.cta?.onClick?.()}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {notif.cta.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </div>
    );
  }


  /* ——— yardımcılar ——— */
  function minutesAgo(mins: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - mins);
    return d.toISOString();
  }
  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "az önce";
    if (m < 60) return `${m} dk önce`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} sa önce`;
    const d = Math.floor(h / 24);
    return `${d} gün önce`;
  }

  function iconFor(t: NotifType) {
    // ikonları koruyoruz; tüm kartlar aynı nötr stilde
    switch (t) {
      case "degerlendirme":
        return MessageSquare;
      case "katilim":
        return UserCheck;
      case "ilgi":
        return Bell;
      case "davet":
        return CalendarClock;
      case "rozet":
        return Trophy;
      case "yaklasan":
        return BadgeCheck;
      default:
        return Bell;
    }
  }
