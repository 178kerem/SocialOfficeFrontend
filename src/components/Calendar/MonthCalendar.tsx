import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

/* ---------- Types ---------- */
export type CalendarEvent = {
  id: string | number
  title: string
  date: string          // "YYYY-MM-DD"
  imageUrl?: string
  time?: string         // "HH:mm"
  location?: string
  category?: string
  scope?: "Birim" | "Departman" | "Kurumsal"
  description?: string
  meta?: Record<string, unknown>
}

export type MonthCalendarProps = {
  events: CalendarEvent[]
  initialDate?: Date
  locale?: string
  onEventClick?: (ev: CalendarEvent) => void
  onDayClick?: (isoDate: string) => void
  renderEventImage?: (ev: CalendarEvent) => ReactNode
  className?: string
}

/* Renk halkaları */
const RING_CLASSES = [
  "ring-emerald-300",
  "ring-sky-300",
  "ring-violet-300",
  "ring-amber-300",
  "ring-rose-300",
  "ring-cyan-300",
  "ring-fuchsia-300",
]

export default function MonthCalendar({
  events,
  initialDate = new Date(),
  locale = "tr-TR",
  onEventClick,
  onDayClick,
  renderEventImage,
  className,
}: MonthCalendarProps) {
  const [cursor, setCursor] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )
  const [modalDate, setModalDate] = useState<string | null>(null)

  const monthLabel = cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })
  const grid = useMemo(() => buildMonthGrid(cursor), [cursor])

  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const list = m.get(ev.date) ?? []
      list.push(ev)
      m.set(ev.date, list)
    }
    for (const [k, list] of m) {
      list.sort(
        (a, b) =>
          String(a.id).localeCompare(String(b.id)) ||
          a.title.localeCompare(b.title, "tr")
      )
      m.set(k, list)
    }
    return m
  }, [events])

  function gotoPrev() { setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function gotoNext() { setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }
  function gotoToday() { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)) }

  const weekDays = useMemo(() => ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"], [])
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

      {/* Grid */}
      <div className="flex-1 min-h-0 p-3">
        <div className="grid h-full grid-cols-7 grid-rows-6 gap-2">
          {grid.map(({ date, inMonth }) => {
            const key = toKey(date)
            const evs = eventsByDate.get(key) ?? []
            const isToday = isSame(date, today)
            const dow = date.getDay()
            const isWeekend = dow === 0 || dow === 6

            return (
              <div
                key={key}
                className={[
                  "relative rounded-xl border p-2 shadow-sm flex flex-col",
                  isWeekend
                    ? "border-rose-100 bg-gradient-to-br from-rose-50 to-white"
                    : "border-sky-100 bg-gradient-to-br from-sky-50 to-white",
                  inMonth ? "" : "opacity-60",
                ].join(" ")}
                onClick={() => { onDayClick?.(key); if (evs.length) setModalDate(key) }}
                onKeyDown={(e) => e.key === "Enter" && (onDayClick?.(key), evs.length && setModalDate(key))}
                role="button"
                tabIndex={0}
              >
                {/* Gün numarası */}
                <div className="flex items-center justify-between">
                  <span className={["text-xs font-semibold text-slate-600", isToday ? "text-blue-700" : ""].join(" ")}>
                    {date.getDate()}
                  </span>
                  {isToday && <span className="rounded-full bg-blue-100/80 text-[10px] text-blue-700 px-1.5 py-0.5 ring-1 ring-blue-200">Bugün</span>}
                </div>

                {/* İçerik */}
                <div className="mt-1 flex-1">
                  {evs.length === 0 ? (
                    <div className="h-[84px]" />
                  ) : evs.length <= 2 ? (
                    <div className="w-full flex justify-center items-start gap-2">
                      {evs.slice(0, 2).map((ev, i) => (
                        <div
                          key={ev.id}
                          className={[
                            "relative h-[72px] w-[110px] overflow-hidden rounded-lg shadow-sm ring-2",
                            ringClassFor(ev.id),
                          ].join(" ")}
                        >
                          {renderEventImage ? (
                            <div className="h-full w-full">{renderEventImage(ev)}</div>
                          ) : ev.imageUrl ? (
                            <img
                              src={ev.imageUrl}
                              alt={ev.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <GradientPlaceholder seed={`${ev.id}-thumb-${i}`} />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/35 backdrop-blur-sm px-1 py-0.5">
                            <div className="text-[10px] font-medium leading-tight text-white line-clamp-1">
                              {ev.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-inner">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {evs.length} Etkinlik
                      </span>
                    </div>
                  )}
                </div>

                {isToday && <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-inset ring-blue-300/60" />}
              </div>
            )
          })}
        </div>
      </div>

      {modalDate && (
        <DayGallery
          isoDate={modalDate}
          locale={locale}
          events={eventsByDate.get(modalDate) ?? []}
          onClose={() => setModalDate(null)}
          onEventClick={onEventClick}
          renderEventImage={renderEventImage}
        />
      )}
    </div>
  )
}

/* ---------- Gün galerisi modal ---------- */
function DayGallery({ isoDate, locale, events, onClose, onEventClick, renderEventImage }: {
  isoDate: string
  locale: string
  events: CalendarEvent[]
  onClose: () => void
  onEventClick?: (ev: CalendarEvent) => void
  renderEventImage?: (ev: CalendarEvent) => ReactNode
}) {
  const label = new Date(isoDate + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  })
  const [show, setShow] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const beginClose = () => setShow(false)
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target === panelRef.current && !show) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
      <div className={["absolute inset-0 bg-black/40 transition-opacity duration-200", show ? "opacity-100" : "opacity-0"].join(" ")} onClick={beginClose}/>
      <div
        ref={panelRef}
        onTransitionEnd={handleTransitionEnd}
        className={[
          "relative z-10 w-full max-w-4xl",
          "rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur",
          "transition-transform transition-opacity duration-200",
          show ? "opacity-100 scale-100" : "opacity-0 scale-90",
          "max-h-[88vh] overflow-hidden"
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-medium text-slate-800">{label}</div>
          <button onClick={beginClose} className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">Kapat</button>
        </div>
        <div className="p-4 flex flex-col items-center overflow-y-auto max-h-[72vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center items-start">
            {events.map((ev, i) => (
              <article key={ev.id} className={["overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition", "ring-2", ringClassFor(ev.id)].join(" ")}>
                <div className="aspect-[4/3] w-full bg-slate-200 overflow-hidden">
                  {renderEventImage ? renderEventImage(ev) : ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : <GradientPlaceholder seed={`${ev.id}-${i}`} />}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{ev.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    {ev.time && <span>⏰ {ev.time}</span>}
                    {ev.location && <span>📍 {ev.location}</span>}
                    {ev.category && <span>🏷️ {ev.category}</span>}
                    {ev.scope && <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-700 ring-1 ring-blue-200">{ev.scope}</span>}
                  </div>
                  {ev.description && <p className="mt-2 text-xs text-slate-600 line-clamp-3">{ev.description}</p>}
                  <button onClick={() => onEventClick?.(ev)} className="mt-3 w-full rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Detay</button>
                </div>
              </article>
            ))}
            {events.length === 0 && <div className="col-span-full text-center text-sm text-slate-600 py-6">Bu günde etkinlik yok.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Görsel yoksa degrade placeholder ---------- */
function GradientPlaceholder({ seed }: { seed: string }) {
  const idx = simpleHash(seed) % GRADIENTS.length
  const g = GRADIENTS[idx]
  return <div className={`h-full w-full ${g} opacity-90`} />
}
const GRADIENTS = [
  "bg-gradient-to-br from-rose-200 via-rose-100 to-white",
  "bg-gradient-to-br from-amber-200 via-amber-100 to-white",
  "bg-gradient-to-br from-emerald-200 via-emerald-100 to-white",
  "bg-gradient-to-br from-sky-200 via-sky-100 to-white",
  "bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-white",
  "bg-gradient-to-br from-indigo-200 via-indigo-100 to-white",
]

/* ---------- Utilities ---------- */
function buildMonthGrid(anchor: Date) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const day = firstOfMonth.getDay()
  const offset = (day + 6) % 7
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
