import React, { useEffect, useMemo, useRef, useState } from "react";
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

/** ——— Tipler ——— */
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
  tags?: string[]; // çoklu kategori rozetleri
};

type RequestItem = {
  id: string;
  title: string;
  details: string;
  up: number;
  down: number;
  status?: "pending" | "approved" | "rejected";
};

type AIState = {
  title: string;
  topic: string;
  categories: string[];   // seçili kategoriler
  categoryQuery: string;  // sadece arama (free add yok)
  quota: number;
  scope: "kurum" | "departman" | "birim";
  unit: string;
};

/** ——— UI helpers ——— */
const pastel = {
  surface:
    "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border border-slate-200/70 shadow-sm",
  chip: "rounded-full px-2.5 py-1 text-xs font-medium",
  btn: "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60",
  iconBtn:
    "inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
  /** Panel yüksekliği: viewport - üst/alt boşluk (8rem) */
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

/** ——— Havuzlar ——— */
const topicPool = ["Spor", "Sağlık", "Kültür", "Teknoloji", "Gönüllülük", "Müzik", "Kariyer"];
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
const unitPool = ["A Birimi", "B Birimi", "C Birimi"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
export default function EtkinlikTalepOnayPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);

  // AI Önerici state (çoklu kategori, searchable combobox)
  const [ai, setAI] = useState<AIState>({
    title: "",
    topic: "",
    categories: [],
    categoryQuery: "",
    quota: 50,
    scope: "kurum",
    unit: "A Birimi",
  });
  const [catOpen, setCatOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent | TouchEvent) => {
      if (!comboboxRef.current) return;
      if (!comboboxRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown, { capture: true });
    document.addEventListener("touchstart", onDocDown, { capture: true });
    return () => {
      document.removeEventListener("mousedown", onDocDown, { capture: true } as any);
      document.removeEventListener("touchstart", onDocDown, { capture: true } as any);
    };
  }, []);


  /** ——— Kategori combobox mantığı ——— */
  const normalized = (s: string) => s.toLocaleLowerCase("tr-TR");
  const filteredOptions = useMemo(() => {
    const q = normalized(ai.categoryQuery);
    return categoryPool
      .filter((opt) => !ai.categories.includes(opt))
      .filter((opt) => (q ? normalized(opt).includes(q) : true));
  }, [ai.categoryQuery, ai.categories]);

  const selectCategory = (opt: string) => {
    if (!ai.categories.includes(opt)) {
      setAI((f) => ({ ...f, categories: [...f.categories, opt], categoryQuery: "" }));
    }
    setCatOpen(false); // ← eklendi
  };

  const removeCategory = (label: string) => {
    setAI((f) => ({ ...f, categories: f.categories.filter((c) => c !== label) }));
  };

  const onCategoryKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Sadece listede varsa ekle
      const exact = filteredOptions.find(
        (o) => normalized(o) === normalized(ai.categoryQuery)
      );
      if (exact) selectCategory(exact);
      else if (filteredOptions.length === 1) selectCategory(filteredOptions[0]);
      // değilse ekleme
    } else if (e.key === "Escape") {
      setCatOpen(false);
    }
  };

  /** ——— Öner ve üret ——— */
  const suggestEvent = () => {
    setAI((s) => ({
      ...s,
      title: s.title || pick(titlePool),
      topic: s.topic || pick(topicPool),
      categories: s.categories.length ? s.categories : [pick(categoryPool)],
      categoryQuery: "",
      quota: s.quota || Math.floor(40 + Math.random() * 200),
    }));
  };

  const addGeneratedEvent = () => {
    const title = ai.title || pick(titlePool);
    const topic = ai.topic || pick(topicPool);
    const cats = ai.categories.length ? ai.categories : [pick(categoryPool)];
    const newItem: EventItem = {
      id: crypto.randomUUID(),
      title,
      description: `${topic} / ${cats.join(", ")} başlığında topluluk etkinliği önerisi. Çap: ${ai.scope}, Birim: ${ai.unit}.`,
      date: new Date().toLocaleDateString(),
      place: "Duyurulacak",
      capacity: Math.max(10, Math.min(1000, Number(ai.quota) || 50)),
      up: 0,
      down: 0,
      status: "pending",
      tags: cats,
    };
    setEvents((prev) => [newItem, ...prev]);
  };

  /** ——— Onay/Reddet ——— */
  const approveEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
  const rejectEvent = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));

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
        </div>

        {/* Sabit yükseklikli 3 panel */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* AI ÖNERİCİ */}
          <section
            className={`order-1 xl:order-none xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 flex flex-col ${pastel.panelHeight}`}
          >
            {/* header */}
            <header className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Etkinlik Üret</h2>
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </header>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid grid-cols-1 gap-3">
                {/* Başlık */}
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-600">Başlık (AI)</span>
                  <input
                    value={ai.title}
                    onChange={(e) => setAI((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Etkinlik başlığı"
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                    autoComplete="off"
                  />
                </label>

                {/* Konu */}
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-600">Konu (AI)</span>
                  <input
                    value={ai.topic}
                    onChange={(e) => setAI((f) => ({ ...f, topic: e.target.value }))}
                    placeholder="Örn. Spor, Kültür, Teknoloji…"
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                    autoComplete="off"
                  />
                </label>

                {/* Kategoriler: chip + searchable combobox (sadece listeden seçilir) */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-slate-600">Kategoriler</span>

                  {/* Seçili chip'ler */}
                  <div className="flex flex-wrap gap-2">
                    {ai.categories.length === 0 ? (
                      <span className="text-xs text-slate-500">Henüz kategori eklenmedi.</span>
                    ) : (
                      ai.categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => removeCategory(cat)}
                          title="Kaldır"
                          className="inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-medium text-fuchsia-800 ring-1 ring-fuchsia-200 hover:bg-fuchsia-200"
                        >
                          {cat} <span className="text-fuchsia-900/70">×</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Combobox */}
                  <div className="relative" ref={comboboxRef}>
                    <input
                      value={ai.categoryQuery}
                      onChange={(e) => setAI((f) => ({ ...f, categoryQuery: e.target.value }))}
                      onFocus={() => setCatOpen(true)}
                      onBlur={() => setTimeout(() => setCatOpen(false), 120)} // click tamamlanabilsin diye küçük gecikme
                      onKeyDown={onCategoryKeyDown}
                      placeholder="Kategori yazın ve listeden seçin…"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={catOpen}
                    />

                    <AnimatePresence>
                      {catOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
                        >
                          <div className="max-h-48 overflow-auto py-1">
                            {filteredOptions.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-slate-500">Eşleşen seçenek yok</div>
                            ) : (
                              filteredOptions.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => selectCategory(opt)}
                                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  {opt}
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Çap & Birim */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600">Etkinlik Çapı</span>
                    <select
                      value={ai.scope}
                      onChange={(e) =>
                        setAI((f) => ({ ...f, scope: e.target.value as AIState["scope"] }))
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="kurum">Kurum</option>
                      <option value="departman">Departman</option>
                      <option value="birim">Birim</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600">Birim</span>
                    <select
                      value={ai.unit}
                      onChange={(e) => setAI((f) => ({ ...f, unit: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {unitPool.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Kota */}
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
            </div>

            {/* footer: butonlar panelin en altında sabit */}
            <div className="mt-4 ml-auto flex flex-wrap items-center gap-2 shrink-0">
              <motion.button
                onClick={suggestEvent}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className={`${pastel.btn} group relative overflow-hidden border border-sky-200 bg-sky-50 text-sky-700 ring-1 ring-sky-100 transition-colors hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-[120%]"
                />
                <Sparkles className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                Öner
              </motion.button>
              <motion.button
                onClick={addGeneratedEvent}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className={`${pastel.btn} group relative overflow-hidden border border-indigo-200 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-[120%]"
                />
                <Wand2 className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                Etkinlik Üret
              </motion.button>
            </div>
          </section>

          {/* ETKİNLİKLER */}
          <section
            className={`order-2 xl:order-none xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 flex flex-col ${pastel.panelHeight}`}
          >
            <header className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Talep Edilen Etkinlikler</h2>
            </header>

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

                        {/* Sadece gösterim: like/dislike */}
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <div className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            <ThumbsUp className="h-4 w-4" /> {ev.up}
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700">
                            <ThumbsDown className="h-4 w-4" /> {ev.down}
                          </div>
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

          {/* TALEPLER */}
          <section
            className={`order-3 xl:order-none xl:col-span-4 ${pastel.surface} rounded-2xl p-4 sm:p-6 flex flex-col ${pastel.panelHeight}`}
          >
            <header className="mb-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Talepler</h2>
            </header>

            <div className="flex-1 overflow-y-auto pr-1">
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
                          <h3 className="truncate text-base font-semibold text-slate-800">
                            {rq.title}
                          </h3>
                          <Badge color="bg-sky-100 text-sky-700 border border-sky-200">Talep</Badge>
                          {rq.status === "approved" && (
                            <Badge color="bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Onaylandı
                            </Badge>
                          )}
                          {rq.status === "rejected" && (
                            <Badge color="bg-rose-100 text-rose-700 border border-rose-200">
                              Reddedildi
                            </Badge>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
