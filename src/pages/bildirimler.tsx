import { useMemo, useState } from "react"
import Navbar from "@/components/navbar"
import {
  Bell, BadgeCheck, CalendarClock, Trophy, MessageSquare, UserCheck, Trash2
} from "lucide-react"

type NotifType = "katilim" | "ilgi" | "davet" | "degerlendirme" | "rozet" | "yaklasan"

type Notification = {
  id: number
  type: NotifType
  title: string
  text: string
  createdAt: string  // ISO
  read: boolean
  cta?: { label: string; onClick?: () => void }
}

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
    text: "Tebrikler! Satranç etkinliğine sık katılımınızdan dolayı ‘Satranç’ rozetini kazandınız.",
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
]

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(seed)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filtered = useMemo(
    () => items.filter(n => (showUnreadOnly ? !n.read : true)),
    [items, showUnreadOnly]
  )

  function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }
  function toggleRead(id: number) {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: !n.read } : n)))
  }
  function remove(id: number) {
    setItems(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar fixed />

      {/* içerik */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">Bildirimler</h1>
          </header>

          <div className="rounded-lg bg-white border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
              <button
                onClick={markAllRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Hepsini Okundu Olarak İşaretle
              </button>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  />
                  Sadece okunmayanlar
                </label>
              </div>
            </div>
          </div>

          {/* 2 kolonlu düzen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
                onToggleRead={() => toggleRead(n.id)}
                onRemove={() => remove(n.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-sm text-slate-600">
                Gösterilecek bildirim yok.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------ Kart ------------- */
function NotificationCard({
  notif,
  onToggleRead,
  onRemove,
}: {
  notif: Notification
  onToggleRead: () => void
  onRemove: () => void
}) {
  const Icon = iconFor(notif.type)
  const time = timeAgo(notif.createdAt)

  return (
    <article
      className={[
        "relative rounded-xl border bg-white p-4 shadow-sm",
        notif.read ? "border-slate-200 opacity-80" : "border-slate-300",
      ].join(" ")}
      aria-live="polite"
    >
      {/* sağ üst: sil */}
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 p-1 rounded-md text-slate-500 hover:bg-slate-100"
        title="Sil"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-900">{notif.title}</h3>
            <span className="text-[11px] text-slate-500">{time}</span>
          </div>

          <p className="text-sm text-slate-700 mt-1">{notif.text}</p>

          <div className="mt-3 flex items-center gap-2">
            {!notif.read && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                Yeni
              </span>
            )}

            {notif.cta && (
              <button
                onClick={() => notif.cta?.onClick?.()}
                className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                {notif.cta.label}
              </button>
            )}

            <button
              onClick={onToggleRead}
              className="ml-auto rounded-md text-xs px-2 py-1 border border-slate-300 hover:bg-slate-50"
            >
              {notif.read ? "Okunmadı yap" : "Okundu yap"}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ----------- yardımcılar ----------- */
function minutesAgo(mins: number) {
  const d = new Date()
  d.setMinutes(d.getMinutes() - mins)
  return d.toISOString()
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "az önce"
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  return `${d} gün önce`
}
function iconFor(t: NotifType) {
  switch (t) {
    case "degerlendirme": return MessageSquare
    case "katilim": return UserCheck
    case "ilgi": return Bell
    case "davet": return CalendarClock
    case "rozet": return Trophy
    case "yaklasan": return BadgeCheck
    default: return Bell
  }
}
