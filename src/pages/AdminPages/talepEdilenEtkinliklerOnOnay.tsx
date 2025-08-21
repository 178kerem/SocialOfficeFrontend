import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Users, Check, Minus } from "lucide-react";

/** ——— Tipler ——— */
type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  place: string;
  capacity: number;
  status?: "pending" | "approved" | "rejected";
  tags?: string[];
};

/** ——— UI helpers ——— */
const pastel = {
  surface:
    "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border border-slate-200/70 shadow-sm",
  chip: "rounded-full px-2.5 py-1 text-xs font-medium",
  btn: "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2",
  iconBtn:
    "inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
  panelHeight: "h-[calc(100dvh-8rem)]",
};

const initialEvents: EventItem[] = [
  {
    id: crypto.randomUUID(),
    title: "Satranç Turnuvası",
    description: "Kampüste satranç turnuvası düzenlenmesini talep ediyorum.",
    date: "11/11/2025",
    place: "Tüblak",
    capacity: 250,
    status: "pending",
  },
  {
    id: crypto.randomUUID(),
    title: "Fotoğraf Çekme Yarışması",
    description:
      "Fotoğraf çekme yarışması düzenlenmesi talep ediyorum — teması özgür.",
    date: "11/11/2025",
    place: "Tüblak",
    capacity: 180,
    status: "pending",
  },
  {
    id: crypto.randomUUID(),
    title: "Bisiklet Yarışı",
    description: "Kampüs içi bisiklet yarışı öneriyorum.",
    date: "23/04/2026",
    place: "Merkez Kampüs",
    capacity: 120,
    status: "pending",
  },
];

/** ——— Küçük bileşenler ——— */
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`${pastel.chip} ${color}`}>{children}</span>;
}

function Stat({ icon: Icon, label }: { icon: any; label: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 opacity-70" />
      <span>{label}</span>
    </div>
  );
}

/** ——— Sayfa ——— */
export default function EtkinlikTalepOnOnayPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  /** ——— Onay/Reddet ——— */
  const approveEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
  const rejectEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));

  const filteredEvents = useMemo(() => events, [events]);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-indigo-50/50 via-sky-50/40 to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Başlık */}
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Talep Edilen Etkinlikler Ön Onay</h1>
        </div>

        {/* Talep Edilen Etkinlikler */}
        <section
          className={`xl:col-span-12 ${pastel.surface} rounded-2xl p-4 sm:p-6 flex flex-col ${pastel.panelHeight}`}
        >
          <div className="flex-1 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filteredEvents.map((ev) => (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3 rounded-xl border border-slate-200 bg-white/70 p-4 last:mb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-800">
                          {ev.title}
                        </h3>
                        <Badge color="bg-violet-100 text-violet-700 border border-violet-200">
                          Etkinlik
                        </Badge>
                        {ev.status === "approved" && (
                          <Badge color="bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Onaylandı
                          </Badge>
                        )}
                        {ev.status === "rejected" && (
                          <Badge color="bg-rose-100 text-rose-700 border border-rose-200">
                            Reddedildi
                          </Badge>
                        )}
                      </div>

                      {/* Etiketler (kategoriler) */}
                      {ev.tags && ev.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ev.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-medium text-fuchsia-800 ring-1 ring-fuchsia-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ev.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <Stat icon={Calendar} label={ev.date} />
                        <Stat icon={MapPin} label={ev.place} />
                        <Stat icon={Users} label={`${ev.capacity} kişi`} />
                      </div>
                    </div>

                    <div className="shrink-0 space-x-2">
                      <button
                        onClick={() => approveEvent(ev.id)}
                        className={`${pastel.iconBtn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-400`}
                        title="Onayla"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => rejectEvent(ev.id)}
                        className={`${pastel.iconBtn} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-400`}
                        title="Reddet"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
