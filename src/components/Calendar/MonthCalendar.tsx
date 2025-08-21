import { useMemo, useState, type ReactNode } from "react"

/* ---------- Types ---------- */
export type CalendarEvent = {
  id: string | number
  title: string        // Kullanılmıyor (tasarım gereği yazı gizli), tipte kalsın
  date: string         // "YYYY-MM-DD"
  imageUrl?: string
  meta?: Record<string, unknown>
}

export type MonthCalendarProps = {
  events: CalendarEvent[]
  initialDate?: Date
  locale?: string                 // default: "tr-TR"
  maxVisiblePerDay?: number       // default: 3 (görsel adedi)
  onEventClick?: (ev: CalendarEvent) => void
  onDayClick?: (isoDate: string) => void
  renderEvent?: (ev: CalendarEvent) => ReactNode // istersen özel görsel render
  className?: string                // dış sarmalayıcıya ek class (örn. h-full)
}

/* YUMUŞAK RENK HALKALARI – tailwind purge için sınıflar sabit dizide */
const RING_CLASSES = [
  "ring-emerald-300",
  "ring-sky-300",
  "ring-violet-300",
  "ring-amber-300",
  "ring-rose-300",
  "ring-cyan-300",
  "ring-fuchsia-300",
]

/* ---------- Component ---------- */
export default function MonthCalendar({
  events,
  initialDate = new Date(),
  locale = "tr-TR",
  maxVisiblePerDay = 3,
  onEventClick,
  onDayClick,
  renderEvent,
  className,
}: MonthCalendarProps) {
  const [cursor, setCursor] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )
  const [modalDate, setModalDate] = useState<string | null>(null)

  const monthLabel = cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })
  const grid = useMemo(() => buildMonthGrid(cursor), [cursor])

  // events by date
  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const list = m.get(ev.date) ?? []
      list.push(ev)
      m.set(ev.date, list)
    }
    // stabil sıralama (id/title; görünmez ama deterministik çıksın)
    for (const [k, list] of m) {
      list.sort((a, b) => String(a.id).localeCompare(String(b.id)) || a.title.localeCompare(b.title))
      m.set(k, list)
    }
    return m
  }, [events])

  function gotoPrev() { setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function gotoNext() { setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }
  function gotoToday() { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)) }

  const weekDays = useMemo(
    () => ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    []
  )
  const today = new Date()

  return (
    <div className={["flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur", className ?? ""].join(" ")}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button onClick={gotoPrev} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 shadow-sm">{"<"}</button>
          <button onClick={gotoNext} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 shadow-sm">{">"}</button>
          <button onClick={gotoToday} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 shadow-sm">Bugün</button>
        </div>
        <div className="text-lg font-semibold capitalize text-slate-800">{monthLabel}</div>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 gap-2 px-3 pt-3 text-xs font-medium text-slate-500">
        {weekDays.map((d) => <div key={d} className="px-2 text-center">{d}</div>)}
      </div>

      {/* Grid – tam yükseklik */}
      <div className="flex-1 min-h-0 p-3">
        <div className="grid h-full grid-cols-7 grid-rows-6 gap-2">
          {grid.map(({ date, inMonth }, idx) => {
            const key = toKey(date)
            const evs = eventsByDate.get(key) ?? []
            const isToday = isSame(date, today)
            const dow = date.getDay() // 0=Sun,6=Sat
            const isWeekend = dow === 0 || dow === 6

            return (
              <div
                key={key}
                className={[
                  // arka planı yumuşak degrade; hafta içi mavi, sonu pembe ton
                  "relative rounded-xl border p-2 shadow-sm flex flex-col",
                  isWeekend
                    ? "border-rose-100 bg-gradient-to-br from-rose-50 to-white"
                    : "border-sky-100 bg-gradient-to-br from-sky-50 to-white",
                  inMonth ? "" : "opacity-60",
                ].join(" ")}
                onDoubleClick={() => onDayClick?.(key)}
              >
                {/* Gün numarası */}
                <div className="flex items-center justify-between">
                  <span className={["text-xs font-semibold text-slate-600", isToday ? "text-blue-700" : ""].join(" ")}>
                    {date.getDate()}
                  </span>
                  {isToday && <span className="rounded-full bg-blue-100/80 text-[10px] text-blue-700 px-1.5 py-0.5 ring-1 ring-blue-200">Bugün</span>}
                </div>

                {/* Görsel thumbnails (yazısız) */}
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {evs.slice(0, maxVisiblePerDay).map((ev, i) => (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick?.(ev)}
                      className={[
                        "group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-200 ring-2 transition",
                        ringClassFor(ev.id),
                        "hover:scale-[1.02] hover:brightness-105"
                      ].join(" ")}
                      title="Etkinlik görseli"
                    >
                      {renderEvent ? (
                        // Özel görsel render etmek istersen:
                        renderEvent(ev)
                      ) : ev.imageUrl ? (
                        <img
                          src={ev.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <GradientPlaceholder seed={`${ev.id}-${i}`} />
                      )}
                    </button>
                  ))}

                  {/* Daha fazlası varsa: yazısız “+” fayansı */}
                  {evs.length > maxVisiblePerDay && (
                    <button
                      onClick={() => setModalDate(key)}
                      className="aspect-[4/3] w-full rounded-lg border-2 border-dashed border-slate-300 bg-white/70 hover:bg-white shadow-inner grid place-items-center"
                      aria-label="Daha fazla"
                      title="Daha fazla"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-500">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Bugün vurgusu (yumuşak halka) */}
                {isToday && <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-inset ring-blue-300/60" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal – gün galerisi (sadece görseller) */}
      {modalDate && (
        <DayGallery
          isoDate={modalDate}
          locale={locale}
          events={eventsByDate.get(modalDate) ?? []}
          onClose={() => setModalDate(null)}
          onEventClick={onEventClick}
          renderEvent={renderEvent}
        />
      )}
    </div>
  )
}

/* ---------- Görsel yoksa renkli placeholder ---------- */
function GradientPlaceholder({ seed }: { seed: string }) {
  const idx = simpleHash(seed) % GRADIENTS.length
  const g = GRADIENTS[idx]
  return (
    <div className={`h-full w-full ${g} opacity-90`} />
  )
}
const GRADIENTS = [
  "bg-gradient-to-br from-rose-200 via-rose-100 to-white",
  "bg-gradient-to-br from-amber-200 via-amber-100 to-white",
  "bg-gradient-to-br from-emerald-200 via-emerald-100 to-white",
  "bg-gradient-to-br from-sky-200 via-sky-100 to-white",
  "bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-white",
  "bg-gradient-to-br from-indigo-200 via-indigo-100 to-white",
]

/* ---------- Gün galerisi modal (yazısız) ---------- */
function DayGallery({
  isoDate, locale, events, onClose, onEventClick, renderEvent,
}: {
  isoDate: string
  locale: string
  events: CalendarEvent[]
  onClose: () => void
  onEventClick?: (ev: CalendarEvent) => void
  renderEvent?: (ev: CalendarEvent) => ReactNode
}) {
  const label = new Date(isoDate + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-20 w-full max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-medium text-slate-800">{label}</div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">Kapat</button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {events.map((ev, i) => (
              <button
                key={ev.id}
                onClick={() => onEventClick?.(ev)}
                className={["aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-200 ring-2", ringClassFor(ev.id), "hover:scale-[1.01] transition"].join(" ")}
                title="Etkinlik görseli"
              >
                {renderEvent ? (
                  renderEvent(ev)
                ) : ev.imageUrl ? (
                  <img src={ev.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <GradientPlaceholder seed={`${ev.id}-${i}`} />
                )}
              </button>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center text-sm text-slate-600 py-6">
                Görsel yok.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Utilities ---------- */
function buildMonthGrid(anchor: Date) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const day = firstOfMonth.getDay()       // 0=Sun,1=Mon...
  const offset = (day + 6) % 7            // Monday-first
  const start = new Date(year, month, 1 - offset)
  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    cells.push({ date: d, inMonth: d.getMonth() === month })
  }
  return cells
}
function toKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}
function isSame(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function ringClassFor(id: string | number) {
  const idx = simpleHash(String(id)) % RING_CLASSES.length
  return RING_CLASSES[idx]
}
function simpleHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
