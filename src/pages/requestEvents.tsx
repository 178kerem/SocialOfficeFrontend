// src/pages/requestEvents.tsx
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Tag as TagIcon,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Plus,
  X,
  Search,
  History,
  BarChart3,
  Star,
  Users,
} from "lucide-react";

/* ----------------- Tipler ----------------- */
type Scope = "Birim" | "Departman" | "Kurumsal";

type RequestItem = {
  id: number;
  baslik: string;
  konu: string;
  tarih: string; // "YYYY-MM-DD"
  konum: string;
  kategori: string;
  buyukluk: Scope;
  imageUrl?: string;
  up: number;
  down: number;
  createdAt: string; // ISO
};

type ItemWithVote = RequestItem & {
  userVote: 1 | -1 | 0;
  /** Kontenjan (opsiyonel) */
  capacity?: number | null; // toplam kontenjan (null/undefined: sınırsız)
  enrolled?: number; // kayıtlı kişi
};

type SortKey = "newest" | "oldest" | "mostNet" | "mostUp";

type RatingDist = { [stars: number]: number }; // 5..1
type PastEvent = {
  id: number;
  ad: string;
  tarih: string; // "YYYY-MM-DD"
  kategori: string;
  konum: string;
  katilim: number;
  puanOrt: number; // 0-5
  puanSay: number;
  dagilim: RatingDist;
};

/* ----------------- Seed verileri ----------------- */
const seed: RequestItem[] = [
  {
    id: 1,
    baslik: "Satranç Turnuvası",
    konu: "Satranç turnuvası düzenlenmesini talep ediyorum",
    tarih: "2025-11-11",
    konum: "Kampüs",
    kategori: "Sosyal",
    buyukluk: "Kurumsal",
    imageUrl: "",
    up: 250,
    down: 20,
    createdAt: "2025-08-15T10:00:00Z",
  },
  {
    id: 2,
    baslik: "Bisiklet Yarışı",
    konu: "Kampüs içi bisiklet yarışı istiyoruz",
    tarih: "2025-09-05",
    konum: "Açık Alan",
    kategori: "Spor",
    buyukluk: "Departman",
    up: 80,
    down: 5,
    createdAt: "2025-08-10T09:00:00Z",
  },
  {
    id: 3,
    baslik: "Teknik Eğitim: React",
    konu: "Modern React eğitimi",
    tarih: "2025-10-01",
    konum: "Eğitim Salonu A",
    kategori: "Eğitim",
    buyukluk: "Birim",
    up: 120,
    down: 10,
    createdAt: "2025-08-18T13:30:00Z",
  },
];

const pastSeed: PastEvent[] = [
  {
    id: 101,
    ad: "2024 Bahar Satranç Kupası",
    tarih: "2024-04-21",
    kategori: "Sosyal",
    konum: "Konferans Salonu 2",
    katilim: 86,
    puanOrt: 4.6,
    puanSay: 128,
    dagilim: { 5: 78, 4: 35, 3: 10, 2: 3, 1: 2 },
  },
  {
    id: 102,
    ad: "Kurumsal Bisiklet Turu",
    tarih: "2024-06-15",
    kategori: "Spor",
    konum: "Kampüs Çevresi",
    katilim: 140,
    puanOrt: 4.8,
    puanSay: 210,
    dagilim: { 5: 170, 4: 28, 3: 8, 2: 3, 1: 1 },
  },
  {
    id: 103,
    ad: "React ile Modern Frontend",
    tarih: "2025-02-10",
    kategori: "Eğitim",
    konum: "Eğitim Salonu A",
    katilim: 120,
    puanOrt: 4.5,
    puanSay: 95,
    dagilim: { 5: 60, 4: 22, 3: 9, 2: 3, 1: 1 },
  },
  {
    id: 104,
    ad: "Bilardo Tanışma Günü",
    tarih: "2024-11-05",
    kategori: "Sosyal",
    konum: "Spor Kompleksi - Bilardo Salonu",
    katilim: 52,
    puanOrt: 4.2,
    puanSay: 47,
    dagilim: { 5: 20, 4: 16, 3: 8, 2: 2, 1: 1 },
  },
];

/* ----------------- UI helpers ----------------- */
const shell = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

function chipPalette(size: Scope) {
  switch (size) {
    case "Birim":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "Departman":
      return "bg-violet-100 text-violet-800 ring-violet-200";
    default:
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }
}

/* ----------------- Animasyonlu sayaç ----------------- */
function AnimatedNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className={className}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

/* ----------------- Aramasız pastel SelectBox ----------------- */
function SelectBox({
  label,
  value,
  options,
  onChange,
  z = 50,
}: {
  label: string;
  value: string;
  options: { value: string | number; label: string }[];
  onChange: (v: any) => void;
  z?: number;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? "";

  React.useEffect(() => {
    const h = (e: MouseEvent | TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.("[data-selectbox]")) setOpen(false);
    };
    document.addEventListener("mousedown", h, { capture: true });
    document.addEventListener("touchstart", h, { capture: true });
    return () => {
      document.removeEventListener("mousedown", h as any, { capture: true } as any);
      document.removeEventListener("touchstart", h as any, { capture: true } as any);
    };
  }, []);

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-slate-600">{label}</span>
      <div className="relative flex-1" data-selectbox>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 pr-9 text-left text-sm text-slate-700 outline-none focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {current}
        </button>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              style={{ zIndex: z }} // dinamik z-index
              className="absolute mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
              role="listbox"
            >
              <div className="max-h-56 overflow-auto py-1">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus:outline-none",
                      opt.value === value && "bg-slate-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </label>
  );
}

/* ----------------- RequestCard ----------------- */
function RequestCard({ it, vote }: { it: ItemWithVote; vote: (id: number, dir: 1 | -1) => void }) {
  const my = it.userVote ?? 0;

  const capacity = it.capacity ?? undefined; // undefined -> belirtilmedi
  const enrolled = typeof it.enrolled === "number" ? Math.max(0, it.enrolled) : undefined;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70"
    >
      {/* Görsel */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {it.imageUrl ? (
          <img
            src={it.imageUrl}
            alt={it.baslik}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}

        {/* Çap chip */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
            chipPalette(it.buyukluk)
          )}
        >
          {it.buyukluk}
        </span>
      </div>

      {/* İçerik */}
      <div className="p-4">
        {/* Kategori + başlık + konu */}
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
            {it.kategori}
          </span>
        </div>
        <h3 className="truncate text-base font-semibold text-slate-900">{it.baslik}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{it.konu}</p>

        {/* Detaylar */}
        <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-slate-700">
          <li className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{formatDate(it.tarih)}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{it.konum}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-slate-400" />
            <span>{it.kategori}</span>
          </li>

          {/* Kontenjan: DÜZ METİN */}
          <li className="mt-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4 text-slate-400" />
              {capacity === undefined && (
                <span className="text-slate-700">Kontenjan: Belirtilmedi</span>
              )}
              {typeof capacity === "number" && (
                <span className= "text-slate-700">
                  Kontenjan: {capacity} kişi
                  {typeof enrolled === "number"}
                </span>
              )}
            </div>
          </li>
        </ul>

        {/* Oy alanı */}
        <div className="mt-4 flex items-stretch gap-2">
          <motion.button
            onClick={() => vote(it.id, 1)}
            aria-pressed={my === 1}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            animate={{
              boxShadow: my === 1 ? "0 8px 20px rgba(16,185,129,0.25)" : "0 0px 0px rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-semibold transition-colors",
              my === 1
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
            title="Beğen"
          >
            <ThumbsUp className="h-5 w-5" />
            <AnimatedNumber value={it.up} className="tabular-nums" />
          </motion.button>

          <motion.button
            onClick={() => vote(it.id, -1)}
            aria-pressed={my === -1}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            animate={{
              boxShadow: my === -1 ? "0 8px 20px rgba(244,63,94,0.25)" : "0 0px 0px rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-semibold transition-colors",
              my === -1
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
            title="Beğenme"
          >
            <ThumbsDown className="h-5 w-5" />
            <AnimatedNumber value={it.down} className="tabular-nums" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/* ----------------- Geçmiş paneli (SAĞDAN KAYAN POPUP) ----------------- */
function RatingBars({ dist }: { dist: RatingDist }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="mt-2 space-y-1.5">
      {[5, 4, 3, 2, 1].map((s) => {
        const val = dist[s] ?? 0;
        const pct = Math.round((val / total) * 100);
        return (
          <div key={s} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-[11px] font-semibold text-slate-600">{s}★</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60">
              <div
                className={cn(
                  "h-full",
                  s >= 4 ? "bg-emerald-400/80" : s === 3 ? "bg-amber-400/80" : "bg-rose-400/80"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PastEventItem({ e }: { e: PastEvent }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{e.ad}</h4>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(e.tarih)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {e.konum}
            </span>
            <span className="inline-flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5 text-slate-400" />
              {e.kategori}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Star className="h-3.5 w-3.5" />
            {e.puanOrt.toFixed(1)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">{e.puanSay} oy</div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-500">Katılım: {e.katilim}</div>
      <RatingBars dist={e.dagilim} />
    </div>
  );
}

function PastEventsDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PastEvent[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Arka plan */}
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
          {/* Sağdan kayan panel */}
          <motion.aside
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="absolute right-0 top-0 h-full w-[min(420px,92vw)] overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl"
            aria-modal
            role="dialog"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
                  <BarChart3 className="h-4 w-4 text-slate-700" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Geçmiş Etkinlikler & Değerlendirmeler
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Kapat"
                title="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {data.map((e) => (
                <PastEventItem key={e.id} e={e} />
              ))}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------- Sayfa ----------------- */
export default function RequestsPage() {
  const [items, setItems] = useState<ItemWithVote[]>(
    // örnek: düz gösterimin çalışması için bazılarına capacity/enrolled ekleyebilirsin
    seed.map((i) => ({
      ...i,
      userVote: 0,
      // örnek veri (isteğe bağlı):
      capacity: i.id === 1 ? 64 : i.id === 2 ? 50 : i.id === 3 ? 40 : undefined,
      enrolled: i.id === 1 ? 52 : i.id === 2 ? 25 : i.id === 3 ? 22 : undefined,
    }))
  );

  // filtre/sıralama
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"Tümü" | Scope>("Tümü");
  const [cat, setCat] = useState<string>("Tüm Kategoriler");
  const [sort, setSort] = useState<SortKey>("newest");

  // geçmiş panel state
  const [openPast, setOpenPast] = useState(false);
  const [past] = useState<PastEvent[]>(pastSeed);

  // kategori seçenekleri
  const categories = useMemo(() => {
    const s = new Set(items.map((i) => i.kategori));
    return ["Tüm Kategoriler", ...Array.from(s)];
  }, [items]);

  // combobox seçenekleri
  const sortOpts: { value: SortKey; label: string }[] = [
    { value: "newest", label: "En Yeni" },
    { value: "oldest", label: "En Eski" },
    { value: "mostNet", label: "En Çok Oy (Net)" },
    { value: "mostUp", label: "En Çok Beğeni" },
  ];
  const catOpts = categories.map((c) => ({ value: c, label: c }));
  const scopeOpts = (["Tümü", "Birim", "Departman", "Kurumsal"] as const).map((s) => ({
    value: s,
    label: s,
  }));

  // filtre + sıralama
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((i) => {
      const text = [i.baslik, i.konu, i.konum, i.kategori].join(" ").toLowerCase();
      const okText = !needle || text.includes(needle);
      const okScope = scope === "Tümü" ? true : i.buyukluk === scope;
      const okCat = cat === "Tüm Kategoriler" ? true : i.kategori === cat;
      return okText && okScope && okCat;
    });

    list = list.slice().sort((a, b) => {
      if (sort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "mostUp") return b.up - a.up;
      // mostNet
      return b.up - b.down - (a.up - a.down);
    });

    return list;
  }, [items, q, scope, cat, sort]);

  // oyla — tek setState, çift sayma yok
  function toggleVote(id: number, dir: 1 | -1) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const cur = it.userVote ?? 0;
        const next: 1 | -1 | 0 = cur === dir ? 0 : dir;

        const up = it.up - (cur === 1 ? 1 : 0) + (next === 1 ? 1 : 0);
        const down = it.down - (cur === -1 ? 1 : 0) + (next === -1 ? 1 : 0);

        return { ...it, userVote: next, up, down };
      })
    );
  }

  // dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    baslik: "",
    konu: "",
    tarih: "",
    konum: "",
    kategori: "",
    buyukluk: "Birim" as Scope,
    imageUrl: "",
  });

  const canSubmit =
    form.baslik.trim() &&
    form.konu.trim() &&
    form.tarih &&
    form.konum.trim() &&
    form.kategori.trim() &&
    form.buyukluk;

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const now = new Date().toISOString();
    setItems((list) => [
      {
        id: Math.max(0, ...list.map((i) => i.id)) + 1,
        baslik: form.baslik.trim(),
        konu: form.konu.trim(),
        tarih: form.tarih,
        konum: form.konum.trim(),
        kategori: form.kategori.trim(),
        buyukluk: form.buyukluk as Scope,
        imageUrl: form.imageUrl || undefined,
        up: 0,
        down: 0,
        createdAt: now,
        userVote: 0,
        // yeni taleplerde kontenjan bilgisi formda yok -> belirtilmedi
      },
      ...list,
    ]);
    setOpen(false);
    setForm({
      baslik: "",
      konu: "",
      tarih: "",
      konum: "",
      kategori: "",
      buyukluk: "Birim",
      imageUrl: "",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* içerik: nav ile hizalama */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-24">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Talep Edilen Etkinlikler</h1>
            <p className="text-sm text-slate-600">
              Oy verin, filtreleyin, sıralayın veya yeni talep oluşturun.
            </p>
          </header>

          {/* Geçmiş paneli */}
          <PastEventsDrawer open={openPast} onClose={() => setOpenPast(false)} data={past} />

          {/* Filtre paneli (pastel) */}
          <div className={`${shell.panel} relative z-30 mb-6 p-4`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {/* Arama */}
              <label className="flex items-center gap-2 text-sm">
                <div className="relative flex-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Başlık veya açıklamada ara…"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              {/* Sırayla: Sıralama, Kategori, Kapsam */}
              <SelectBox
                label=""
                value={sort}
                options={[
                  { value: "newest", label: "En Yeni" },
                  { value: "oldest", label: "En Eski" },
                  { value: "mostNet", label: "En Çok Oy (Net)" },
                  { value: "mostUp", label: "En Çok Beğeni" },
                ]}
                onChange={(v) => setSort(v as SortKey)}
              />
              <SelectBox label="" value={cat} options={catOpts} onChange={setCat} />
              <SelectBox
                label=""
                value={scope}
                options={scopeOpts}
                onChange={(v) => setScope(v as any)}
              />

              {/* Geçmiş butonu */}
              <button
                onClick={() => setOpenPast(true)}
                className="h-10 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/90 px-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                title="Geçmiş Etkinlikler"
                aria-label="Geçmiş Etkinlikler"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                <span>Geçmiş Etkinlikler</span>
              </button>
            </div>
          </div>

          {/* Kartlar */}
          {filtered.length === 0 ? (
            <div className="text-sm text-slate-600">Eşleşen talep bulunamadı.</div>
          ) : (
            <motion.section
              layout
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.map((it) => (
                  <RequestCard key={it.id} it={it as ItemWithVote} vote={toggleVote} />
                ))}
              </AnimatePresence>
            </motion.section>
          )}
        </div>
      </div>

      {/* Floating "Talep Oluştur" */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white shadow-lg ring-1 ring-slate-900/10 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/40"
        title="Etkinlik Talebinde Bulun"
        aria-label="Etkinlik Talebinde Bulun"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Dialog (pastel) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-end p-4 sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className={`${shell.panel} relative w-full max-w-lg rounded-2xl p-5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Talep Formu</h2>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submitForm} className="grid grid-cols-1 gap-3">
                <Input label="Başlık" value={form.baslik} onChange={(v) => setForm((f) => ({ ...f, baslik: v }))} />
                <TextArea label="Konu" value={form.konu} onChange={(v) => setForm((f) => ({ ...f, konu: v }))} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Tarih"
                    type="date"
                    value={form.tarih}
                    onChange={(v) => setForm((f) => ({ ...f, tarih: v }))}
                  />
                  <Input label="Konum" value={form.konum} onChange={(v) => setForm((f) => ({ ...f, konum: v }))} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Select
                    label="Kategori"
                    value={form.kategori}
                    onChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
                    options={["Spor", "Sosyal", "Eğitim", "Kültür", "Diğer"]}
                  />
                  <Select
                    label="Talep Büyüklüğü"
                    value={form.buyukluk}
                    onChange={(v) => setForm((f) => ({ ...f, buyukluk: v as Scope }))}
                    options={["Birim", "Departman", "Kurumsal"]}
                  />
                </div>

                <Input
                  label="Görsel URL (opsiyonel)"
                  value={form.imageUrl}
                  onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100 disabled:opacity-60"
                  >
                    Talep Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------- Küçük input bileşenleri ----------------- */
function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <option value="" disabled>
          Seçiniz
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
