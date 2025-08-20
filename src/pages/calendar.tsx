import { useMemo, useState } from "react"
import Navbar from "@/components/navbar"

type CalendarEvent = {
  id: number
  title: string
  date: string // "YYYY-MM-DD"
  imageUrl?: string
}

const sample: CalendarEvent[] = [
  { id: 1, title: "Satranç Turnuvası", date: "2025-08-14", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: 2, title: "Satranç Turnuvası", date: "2025-08-15", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: 3, title: "Satranç Turnuvası", date: "2025-08-16", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: 4, title: "Teknik Eğitim",     date: "2025-08-18" },
  { id: 5, title: "Futbol Maçı",       date: "2025-08-18" },
  { id: 6, title: "Yeni Yıl Partisi",  date: "2025-08-20" },
  { id: 7, title: "Kamp Etkinliği",    date: "2025-08-20" },
]

export default function CalendarPage() {
  // başlangıç: bugünün ayı
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1)) // ay başı

  // Bu ayın label'ı
  const monthLabel = cursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })

  // Ay görünümü için 6x7 = 42 hücre (Pzt başlangıçlı)
  const days = useMemo(() => buildMonthGrid(cursor), [cursor])

  // Etkinlikleri tarih => liste halinde grupla
  const evByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of sample) {
      const key = ev.date
      const list = map.get(key) ?? []
      list.push(ev)
      map.set(key, list)
    }
    return map
  }, [])

  function prevMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sol sabit navbar (nav component'inizde group/nav + peer/nav olduğundan emin olun) */}
      <Navbar activeId="calendar" fixed />

      {/* İçerik: nav dar (w-16) iken ml-16, hover'da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">Takvim</h1>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">{"<"}</button>
              <div className="min-w-44 text-center text-slate-700 font-medium capitalize">{monthLabel}</div>
              <button onClick={nextMonth} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">{">"}</button>
            </div>
          </header>

          {/* Hafta başlıkları (Pzt–Paz) */}
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-slate-500 mb-2">
            {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((d) => (
              <div key={d} className="px-2">{d}</div>
            ))}
          </div>

          {/* Ay 6x7 grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map(({ date, inMonth }) => {
              const key = toKey(date)
              const evs = evByDate.get(key) ?? []
              const count = evs.length
              const isToday = isSameDate(date, today)

              return (
                <div
                  key={key}
                  className={[
                    "h-32 rounded-xl border p-2 bg-white",
                    inMonth ? "border-slate-200" : "border-slate-100 opacity-60",
                    "shadow-sm"
                  ].join(" ")}
                >
                  {/* Gün numarası */}
                  <div className="flex items-center justify-between">
                    <span className={[
                      "text-xs font-medium",
                      isToday ? "text-blue-600" : "text-slate-600"
                    ].join(" ")}>
                      {date.getDate()}
                    </span>
                    {isToday && <span className="rounded-full bg-blue-100 text-[10px] text-blue-700 px-1.5 py-0.5">Bugün</span>}
                  </div>

                  {/* İçerik */}
                  <div className="mt-2">
                    {count === 0 && (
                      <div className="h-[84px]" />
                    )}

                    {count === 1 && (
                      <OneEventCell ev={evs[0]} />
                    )}

                    {count > 1 && (
                      <div className="h-[84px] grid place-items-center">
                        <span className="text-slate-700 text-sm font-medium">{count} Etkinlik</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- küçük yardımcı parçalar ---------- */

function OneEventCell({ ev }: { ev: CalendarEvent }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 hover:bg-slate-100 transition">
      <div className="h-10 w-12 overflow-hidden rounded-md bg-slate-200 shrink-0">
        {ev.imageUrl ? (
          <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-800 truncate" title={ev.title}>
          {ev.title}
        </p>
      </div>
    </div>
  )
}

function buildMonthGrid(anchor: Date) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const firstOfMonth = new Date(year, month, 1)

  // Pazartesi başlangıçlı haftanın ilk günü
  const day = firstOfMonth.getDay() // 0=Paz, 1=Pzt...
  const offset = (day + 6) % 7 // Pzt=0, Sal=1, ... Paz=6
  const start = new Date(year, month, 1 - offset)

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push({ date: d, inMonth: d.getMonth() === month })
  }
  return cells
}

function toKey(d: Date) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${dd}`
}
function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}
