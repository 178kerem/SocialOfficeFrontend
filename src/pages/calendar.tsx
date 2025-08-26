// src/pages/calendar.tsx
import  { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, Filter, X } from "lucide-react";

/* ───────────── Tipler ───────────── */
type CalendarEvent = {
  id: string;
  title: string;
  date: string;            // "YYYY-MM-DD"
  time?: string;
  location?: string;
  category?: string;       // Spor, Eğitim, vb.
  scope?: string;          // Birim/Departman/Kurumsal
  description?: string;
  imageUrl?: string;
};

/* ───────────── Seed ───────────── */
const seed: CalendarEvent[] = [
  { id: "1",  title: "Satranç Turnuvası",     date: "2025-08-14", time: "18:00", location: "Kampüs A", category: "Spor",    scope: "Kurumsal",
    imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop", description: "Ödüllü hızlı satranç turnuvası. Başlangıç seviyesine açık." },
  { id: "2",  title: "Satranç Workshop",      date: "2025-08-14", time: "16:00", location: "Salon 3",   category: "Eğitim",  scope: "Departman",
    imageUrl: "https://images.unsplash.com/photo-1529694157871-62f3d4f7e3c1?q=80&w=600&auto=format&fit=crop", description: "Açılış prensipleri ve orta oyun stratejileri." },
  { id: "3",  title: "Yoga Seansı",           date: "2025-08-15", time: "07:30", location: "Açık Alan", category: "Sağlık",  scope: "Birim",
    imageUrl: "https://images.unsplash.com/photo-1518609571773-39b7d303a86f?q=80&w=600&auto=format&fit=crop" },
  { id: "4",  title: "Teknik Eğitim: React",  date: "2025-08-18", time: "13:30", location: "Lab-1",     category: "Eğitim",  scope: "Departman",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=600&auto=format&fit=crop", description: "Modern React (Hooks + Router) uygulamalı atölye." },
  { id: "5",  title: "Futbol Maçı",           date: "2025-08-18", time: "19:00", location: "Saha-2",    category: "Spor",    scope: "Birim",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop" },
  { id: "6",  title: "Yeni Yıl Partisi",      date: "2025-08-20", time: "21:00", location: "Kantin",    category: "Sosyal",  scope: "Kurumsal",
    imageUrl: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=600&auto=format&fit=crop" },
  { id: "7",  title: "Kamp Etkinliği",        date: "2025-08-20", time: "10:00", location: "Orman Kamp Alanı", category: "Outdoor", scope: "Departman",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop", description: "Gece konaklamalı doğa yürüyüşü ve kamp ateşi." },
  { id: "8",  title: "Koşu Kulübü",           date: "2025-08-22", time: "06:45", location: "Stad",      category: "Spor",    scope: "Birim",
    imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop" },
  { id: "9",  title: "Fotoğraf Gezisi",       date: "2025-08-25", time: "09:00", location: "Eski Şehir",category: "Kültür",  scope: "Kurumsal",
    imageUrl: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=600&auto=format&fit=crop", description: "Mimari ve sokak fotoğrafçılığı rotası." },
  { id: "10", title: "Toplantı: Q3 Planlama", date: "2025-08-25", time: "11:00", location: "Toplantı Odası B", category: "İş", scope: "Departman",
    imageUrl: "https://images.unsplash.com/photo-1529336953121-4d9df0a1aa49?q=80&w=600&auto=format&fit=crop" },
  { id: "11", title: "Satranç Final Maçı",    date: "2025-08-25", time: "20:00", location: "Salon 1",   category: "Spor",    scope: "Kurumsal",
    imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
];

/* ───────────── Görsel dil ───────────── */
const CAT_STYLE: Record<string, string> = {
  Spor: "bg-amber-200 text-amber-900 ring-amber-300",
  Eğitim: "bg-violet-200 text-violet-900 ring-violet-300",
  Sağlık: "bg-emerald-200 text-emerald-900 ring-emerald-300",
  Sosyal: "bg-teal-200 text-teal-900 ring-teal-300",
  Outdoor: "bg-lime-200 text-lime-900 ring-lime-300",
  Kültür: "bg-sky-200 text-sky-900 ring-sky-300",
  İş: "bg-rose-200 text-rose-900 ring-rose-300",
  default: "bg-slate-200 text-slate-900 ring-slate-300",
};

/* ───────────── Yardımcılar ───────────── */
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const parseYMD = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const fmtYMD = (d: Date) => `${d.getFullYear()}-${`${d.getMonth()+1}`.padStart(2,"0")}-${`${d.getDate()}`.padStart(2,"0")}`;
const startOfGrid = (d: Date) => { const f = new Date(d.getFullYear(), d.getMonth(), 1, 12); const off = f.getDay(); const r = new Date(f); r.setDate(f.getDate()-off); return r; };
const endOfGrid   = (d: Date) => { const l = new Date(d.getFullYear(), d.getMonth()+1, 0, 12); const off = 6-l.getDay(); const r = new Date(l); r.setDate(l.getDate()+off); return r; };

/* ───────────── Takvim Sayfası ───────────── */
export default function CalendarPage() {
  const [monthDate, setMonthDate] = useState(new Date(2025, 7, 1)); // Aug 2025
  const [events] = useState<CalendarEvent[]>(seed);
  const categories = useMemo(() => Array.from(new Set(events.map(e => e.category || "Diğer"))), [events]);

  const [openFilters, setOpenFilters] = useState(false);
  const [activeCats, setActiveCats] = useState<string[]>(categories);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const monthLabel = monthDate.toLocaleString("tr-TR", { month: "long", year: "numeric" });

  // gün listesi
  const days = useMemo(() => {
    const start = startOfGrid(monthDate);
    const end = endOfGrid(monthDate);
    const list: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) list.push(new Date(d));
    while (list.length < 42) { const last = list[list.length-1]; const next = new Date(last); next.setDate(last.getDate()+1); list.push(next); }
    return list.slice(0, 42);
  }, [monthDate]);

  const mapByDay = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    const filtered = events.filter(e => !e.category || activeCats.includes(e.category));
    for (const ev of filtered) {
      const k = fmtYMD(parseYMD(ev.date));
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(ev);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => (a.time || "").localeCompare(b.time || "") || a.title.localeCompare(b.title));
      m.set(k, arr);
    }
    return m;
  }, [events, activeCats]);

  const todayKey = fmtYMD(new Date());
  const changeMonth = (delta: number) => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1, 12));
  const resetToday  = () => { const t = new Date(); setMonthDate(new Date(t.getFullYear(), t.getMonth(), 1, 12)); };

  const gridKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`; // ay geçiş animasyonu için key

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Başlık ve kontroller */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
                <CalendarDays className="mr-2 h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
              </div>
              <div className="inline-flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <button onClick={() => changeMonth(-1)} className="px-2 py-2 hover:bg-slate-50" aria-label="Önceki ay">
                  <ChevronLeft className="h-4 w-4 text-slate-700" />
                </button>
                <button onClick={resetToday} className="px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Bugün
                </button>
                <button onClick={() => changeMonth(1)} className="px-2 py-2 hover:bg-slate-50" aria-label="Sonraki ay">
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Filtreler */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenFilters(v => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" /> Filtreler
              </motion.button>
              {activeCats.length !== categories.length && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCats(categories)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                  title="Tüm filtreleri temizle"
                >
                  Sıfırla
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Filtre alanı: kayar açılır */}
          <AnimatePresence initial={false}>
            {openFilters && (
              <motion.div
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mb-4 overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((c) => {
                    const on = activeCats.includes(c);
                    const cls = on
                      ? "ring-1 " + (CAT_STYLE[c] || CAT_STYLE.default)
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
                    return (
                      <motion.button
                        key={c}
                        onClick={() =>
                          setActiveCats((prev) =>
                            prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                          )
                        }
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ y: -1 }}
                        className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${cls}`}
                      >
                        {c}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gün başlıkları */}
          <div className="sticky top-0 z-10 mb-2 grid grid-cols-7 gap-3 bg-gradient-to-b from-white to-transparent py-1">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium tracking-wide text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Takvim grid: ay değişimde slide/fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={gridKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid grid-cols-7 gap-3"
            >
              {days.map((d, idx) => {
                const key = fmtYMD(d);
                const inMonth = d.getMonth() === monthDate.getMonth();
                const list = mapByDay.get(key) || [];
                const isToday = key === todayKey;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={[
                      "group relative min-h-[120px] rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200",
                      inMonth ? "" : "opacity-50",
                    ].join(" ")}
                  >
                    {/* Tarih */}
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-600">{d.getDate()}</div>
                      {isToday && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                    </div>

                    {/* Etkinlikler */}
                    <div className="mt-2 space-y-1.5">
                      {list.slice(0, 3).map((ev) => {
                        const pill = CAT_STYLE[ev.category || ""] || CAT_STYLE.default;
                        return (
                          <motion.button
                            key={ev.id}
                            layoutId={`ev-${ev.id}`} // shared layout -> modal
                            onClick={() => setSelected(ev)}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full truncate rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 ${pill} shadow-sm`}
                            title={`${ev.title}${ev.time ? " • " + ev.time : ""}`}
                          >
                            {ev.time ? `${ev.time} • ` : ""}{ev.title}
                          </motion.button>
                        );
                      })}
                      {list.length > 3 && (
                        <div className="text-[11px] text-slate-500">+{list.length - 3} daha</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modal: merkezde scale-in + shared layout; backdrop fade */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              key="modal"
              className="fixed inset-0 z-50 grid place-items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                layoutId={`ev-${selected.id}`}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">{selected.title}</h3>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg p-1 hover:bg-slate-100"
                    onClick={() => setSelected(null)}
                  >
                    <X className="h-4 w-4 text-slate-700" />
                  </motion.button>
                </div>
                <div className="space-y-2 px-4 py-4 text-sm">
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-900">Tarih:</span> {selected.date}{selected.time ? ` ${selected.time}` : ""}
                  </div>
                  {selected.location && (
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-900">Konum:</span> {selected.location}
                    </div>
                  )}
                  {selected.category && (
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-900">Kategori:</span> {selected.category}
                    </div>
                  )}
                  {selected.scope && (
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-900">Kapsam:</span> {selected.scope}
                    </div>
                  )}
                  {selected.description && <p className="mt-2 text-slate-700">{selected.description}</p>}
                </div>
                <div className="flex justify-end gap-2 border-t px-4 py-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                    onClick={() => setSelected(null)}
                  >
                    Kapat
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
