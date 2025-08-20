import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Check,
  Minus,
  Sparkles,
  Wand2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// ————————————————————————————————————————
// Pastel Talepler & Etkinlikler — düzenlenmiş sürüm
// • Daha düzenli grid yerleşim
// • Etkinlik kartlarında oy (up/down)
// • AI Önerici başlık + konuyu kendi üretir
// ————————————————————————————————————————

type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  place: string;
  capacity: number;
  up: number;
  down: number;
  status?: "pending" | "approved" | "rejected";
};

type RequestItem = {
  id: string;
  title: string;
  details: string;
  up: number;
  down: number;
  status?: "pending" | "approved" | "rejected";
};

const pastel = {
  surface:
    "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border border-slate-200/70 shadow-sm",
  chip: "rounded-full px-2.5 py-1 text-xs font-medium",
  btn: "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60",
  iconBtn:
    "inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
};

const initialEvents: EventItem[] = [
  {
    id: crypto.randomUUID(),
    title: "Satranç Turnuvası",
    description: "Kampüste satranç turnuvası düzenlenmesini talep ediyorum.",
    date: "11/11/2025",
    place: "Tüblak",
    capacity: 250,
    up: 132,
    down: 6,
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
    up: 98,
    down: 12,
    status: "pending",
  },
  {
    id: crypto.randomUUID(),
    title: "Bisiklet Yarışı",
    description: "Kampüs içi bisiklet yarışı öneriyorum.",
    date: "23/04/2026",
    place: "Merkez Kampüs",
    capacity: 120,
    up: 67,
    down: 5,
    status: "pending",
  },
];

const initialRequests: RequestItem[] = [
  {
    id: crypto.randomUUID(),
    title: "Su & Atıştırmalık Otomatı",
    details:
      "Bölüme giriş katına su ve çeşitli atıştırmalıkların olduğu otomatlar talep ediyorum.",
    up: 250,
    down: 28,
    status: "pending",
  },
  {
    id: crypto.randomUUID(),
    title: "Geri Dönüşüm Kutuları",
    details:
      "Her kata kağıt, plastik ve metal için ayrı geri dönüşüm kutuları talep ediyorum.",
    up: 198,
    down: 14,
    status: "pending",
  },
];

// Basit AI önerici — örnek havuzdan üretir
const topicPool = [
  "Spor",
  "Sağlık",
  "Kültür",
  "Teknoloji",
  "Gönüllülük",
  "Müzik",
  "Kariyer",
];
const categoryPool = ["Turnuva", "Atölye", "Seminer", "Yarışma", "Buluşma"];
const titlePool = [
  "Kampüs Koşusu",
  "Kodlama Atölyesi",
  "Akustik Akşamı",
  "Satranç Gecesi",
  "Gönüllülük Buluşması",
  "Fotoğraf Yürüyüşü",
  "Mindfulness Seansı",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

export default function EtkinlikTalepOnayPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);

  // ——— AI Etkinlik Önerici state ———
  const [ai, setAI] = useState({
    title: "",
    topic: "",
    category: "",
    quota: 50,
  });

  const suggestEvent = () => {
    const title = pick(titlePool);
    const topic = pick(topicPool);
    const category = pick(categoryPool);
    const quota = Math.floor(40 + Math.random() * 200);
    setAI({ title, topic, category, quota });
  };

  const addGeneratedEvent = () => {
    const title = ai.title || pick(titlePool);
    const topic = ai.topic || pick(topicPool);
    const cat = ai.category || pick(categoryPool);
    const newItem: EventItem = {
      id: crypto.randomUUID(),
      title,
      description: `${topic} / ${cat} başlığında topluluk etkinliği önerisi.`,
      date: new Date().toLocaleDateString(),
      place: "Duyurulacak",
      capacity: Math.max(10, Math.min(1000, Number(ai.quota) || 50)),
      up: 0,
      down: 0,
      status: "pending",
    };
    setEvents((prev) => [newItem, ...prev]);
  };

  const approveEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
  const rejectEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));

  const voteEvent = (id: string, dir: "up" | "down") =>
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, up: e.up + (dir === "up" ? 1 : 0), down: e.down + (dir === "down" ? 1 : 0) }
          : e
      )
    );

  const approveRequest = (id: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
  const rejectRequest = (id: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));

  const filteredEvents = useMemo(() => events, [events]);
  const filteredRequests = useMemo(() => requests, [requests]);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-indigo-50/50 via-sky-50/40 to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Başlık */}
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Talepler & Etkinlikler</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge color="bg-emerald-100 text-emerald-700 border border-emerald-200">Minimal</Badge>
            <Badge color="bg-indigo-100 text-indigo-700 border border-indigo-200">Pastel</Badge>
            <Badge color="bg-sky-100 text-sky-700 border border-sky-200">Düzenli Grid</Badge>
          </div>
        </div>

        {/* GRID LAYOUT  */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* AI ÖNERİCİ — üstte / solda ve sticky */}
          <section className={`xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 order-1 xl:order-none xl:sticky xl:top-6 h-fit`}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Etkinlik Üret</h2>
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </header>

            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Başlık (AI)</span>
                <input
                  value={ai.title}
                  readOnly
                  placeholder="AI önerisi için 'Öner' tuşuna basın"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Konu (AI)</span>
                <input
                  value={ai.topic}
                  readOnly
                  placeholder="AI otomatik belirler"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Kategori</span>
                <input
                  value={ai.category}
                  onChange={(e) => setAI((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Örn. Turnuva / Atölye"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Yaklaşık Katılımcı Kotası</span>
                <input
                  type="number"
                  min={10}
                  value={ai.quota}
                  onChange={(e) => setAI((f) => ({ ...f, quota: Number(e.target.value) }))}
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={suggestEvent}
                className={`${pastel.btn} border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 focus:ring-sky-400`}
              >
                <Sparkles className="h-4 w-4" /> Öner
              </button>
              <button
                onClick={addGeneratedEvent}
                className={`${pastel.btn} border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-400`}
              >
                <Wand2 className="h-4 w-4" /> Etkinlik Üret
              </button>
            </div>
          </section>

          {/* ETKİNLİKLER */}
          <section className={`xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 order-2 xl:order-none`}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Talep Edilen Etkinlikler</h2>
            </header>

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
                        <h3 className="truncate text-base font-semibold text-slate-800">{ev.title}</h3>
                        <Badge color="bg-violet-100 text-violet-700 border border-violet-200">Etkinlik</Badge>
                        {ev.status === "approved" && (
                          <Badge color="bg-emerald-100 text-emerald-700 border border-emerald-200">Onaylandı</Badge>
                        )}
                        {ev.status === "rejected" && (
                          <Badge color="bg-rose-100 text-rose-700 border border-rose-200">Reddedildi</Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{ev.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <Stat icon={Calendar} label={ev.date} />
                        <Stat icon={MapPin} label={ev.place} />
                        <Stat icon={Users} label={`${ev.capacity} kişi`} />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <button
                          onClick={() => voteEvent(ev.id, "up")}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 hover:bg-emerald-100"
                        >
                          <ThumbsUp className="h-4 w-4" /> {ev.up}
                        </button>
                        <button
                          onClick={() => voteEvent(ev.id, "down")}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700 hover:bg-rose-100"
                        >
                          <ThumbsDown className="h-4 w-4" /> {ev.down}
                        </button>
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
          </section>

          {/* TALEPLER */}
          <section className={`xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 order-3 xl:order-none`}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Talepler</h2>
            </header>

            <AnimatePresence initial={false}>
              {filteredRequests.map((rq) => (
                <motion.div
                  key={rq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3 rounded-xl border border-slate-200 bg-white/70 p-4 last:mb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-800">{rq.title}</h3>
                        <Badge color="bg-sky-100 text-sky-700 border border-sky-200">Talep</Badge>
                        {rq.status === "approved" && (
                          <Badge color="bg-emerald-100 text-emerald-700 border border-emerald-200">Onaylandı</Badge>
                        )}
                        {rq.status === "rejected" && (
                          <Badge color="bg-rose-100 text-rose-700 border border-rose-200">Reddedildi</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{rq.details}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          <Check className="h-4 w-4" /> {rq.up}
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700">
                          <Minus className="h-4 w-4" /> {rq.down}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 space-x-2">
                      <button
                        onClick={() => approveRequest(rq.id)}
                        className={`${pastel.iconBtn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-400`}
                        title="Onayla"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => rejectRequest(rq.id)}
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
          </section>
        </div>
      </div>
    </div>
  );
}
