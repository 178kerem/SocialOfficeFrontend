import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
  Send,
  Filter,
  User2,
} from "lucide-react";

/* ------------------------------ Veri & Tipler ------------------------------ */
type Status = "pending" | "voting" | "accepted" | "rejected";
type Idea = {
  id: number;
  title: string;
  desc: string;
  user: string;
  status: Status;
  createdAt?: string;
  up?: number;
  down?: number;
};

// Eldeki fikirlerden başlangıç listesi (status: pending)
const seed = [
  { title: "Property uygulaması", desc: "Property Uygulamasına buton koyun", user: "Kullanıcı Adı" },
  { title: "Mobil uygulama", desc: "Kullanıcı deneyimini iyileştirin", user: "Ali Yılmaz" },
  { title: "Dashboard", desc: "Admin için istatistik ekranı ekleyin", user: "Ayşe Kaya" },
];
const initialIdeas: Idea[] = seed.map((it, i) => ({
  id: i + 1,
  ...it,
  status: "pending",
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

/* ------------------------------- Yardımcı UI ------------------------------- */
const badgeClass: Record<Status, string> = {
  pending:  "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  voting:   "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  accepted: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

function StatusBadge({ status }: { status: Status }) {
  const label =
    status === "pending" ? "Beklemede" :
    status === "voting" ? "Oylamada" :
    status === "accepted" ? "Kabul" : "Reddedildi";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass[status]}`}>
      {label}
    </span>
  );
}

/* --------------------------------- Sayfa ---------------------------------- */
export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedId, setSelectedId] = useState<number>(ideas[0]?.id ?? 1);

  // Filtre + arama
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas.filter((it) => {
      const matchesQ =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.user.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" ? true : it.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [ideas, query, statusFilter]);

  // Seçili index & seçili item
  const selectedIndex = useMemo(
    () => Math.max(0, filtered.findIndex((x) => x.id === selectedId)),
    [filtered, selectedId]
  );
  const selected = filtered[selectedIndex] ?? filtered[0];

  // Liste değişirse seçiliyi koru / yoksa ilkine geç
  useEffect(() => {
    if (!selected && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selected]);

  // Klavye kısayolları: ↑/↓ liste, ←/→ detayda gezinme, A kabul, R reddet, V oylama
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (!filtered.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (selectedIndex + 1) % filtered.length;
        setSelectedId(filtered[next].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (selectedIndex - 1 + filtered.length) % filtered.length;
        setSelectedId(filtered[prev].id);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (selectedIndex + 1) % filtered.length;
        setSelectedId(filtered[next].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (selectedIndex - 1 + filtered.length) % filtered.length;
        setSelectedId(filtered[prev].id);
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (selected) updateStatus(selected.id, "accepted");
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (selected) updateStatus(selected.id, "rejected");
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (selected) updateStatus(selected.id, "voting");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selected, selectedIndex]);

  // Durum güncelle
  const updateStatus = useCallback((id: number, status: Status) => {
    setIdeas((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
  }, []);

  const next = () => {
    if (!filtered.length) return;
    const i = selectedIndex;
    const n = (i + 1) % filtered.length;
    setSelectedId(filtered[n].id);
  };
  const prev = () => {
    if (!filtered.length) return;
    const i = selectedIndex;
    const p = (i - 1 + filtered.length) % filtered.length;
    setSelectedId(filtered[p].id);
  };

  // Sayım rozetleri
  const counts = useMemo(() => {
    const c = { all: ideas.length, pending: 0, voting: 0, accepted: 0, rejected: 0 } as
      { all: number } & Record<Status, number>;
    ideas.forEach((it) => (c[it.status] += 1));
    return c;
  }, [ideas]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Başlık */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Fikir Havuzu</h1>
            <p className="text-sm text-slate-500">Soldan tüm fikirleri gör, sağda detayları işle.</p>
          </div>

          {/* Arama & Filtre */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ara: başlık, kişi, açıklama…"
                className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div className="hidden text-slate-400 md:flex items-center gap-1 text-sm">
              <Filter className="h-4 w-4" /> {filtered.length} sonuç
            </div>
          </div>
        </div>

        {/* Tabs (Durum filtreleri) */}
        <div className="mb-4 flex flex-wrap gap-2">
          {([
            { k: "all", label: "Tümü", count: counts.all },
            { k: "pending", label: "Beklemede", count: counts.pending },
            { k: "voting", label: "Oylamada", count: counts.voting },
            { k: "accepted", label: "Kabul", count: counts.accepted },
            { k: "rejected", label: "Reddedildi", count: counts.rejected },
          ] as const).map((t) => (
            <button
              key={t.k}
              onClick={() => setStatusFilter(t.k as any)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition
                ${statusFilter === t.k
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
            >
              <span>{t.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Master–Detail Grid */}
        <div className="grid gap-4 md:grid-cols-[320px,1fr]">
          {/* Sol: Liste */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <AnimatePresence initial={false}>
                {filtered.map((it) => {
                  const active = it.id === selected?.id;
                  return (
                    <motion.button
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => setSelectedId(it.id)}
                      className={`w-full text-left rounded-xl p-3 mb-2 transition
                        ${active
                          ? "bg-indigo-50 ring-1 ring-indigo-200"
                          : "hover:bg-slate-50"}`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-800">{it.title}</h3>
                        <StatusBadge status={it.status} />
                      </div>
                      <p
                        className="text-sm text-slate-600"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {it.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <User2 className="h-3.5 w-3.5" />
                        <span>{it.user}</span>
                        {it.createdAt && (
                          <>
                            <span>•</span>
                            <time title={new Date(it.createdAt).toLocaleString()}>
                              {new Date(it.createdAt).toLocaleDateString()}
                            </time>
                          </>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {!filtered.length && (
                <div className="p-6 text-center text-slate-500">
                  Bu filtrelerle uygun fikir bulunamadı.
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Detay */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selected ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-slate-800">{selected.title}</h2>
                        <StatusBadge status={selected.status} />
                      </div>
                      <div className="text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User2 className="h-4 w-4" />
                          {selected.user}
                        </span>
                        {selected.createdAt && (
                          <>
                            <span className="mx-2">•</span>
                            <time title={new Date(selected.createdAt).toLocaleString()}>
                              {new Date(selected.createdAt).toLocaleDateString()}
                            </time>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Önceki / Sonraki */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                        title="Önceki (←)"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={next}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                        title="Sonraki (→)"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 leading-relaxed">{selected.desc}</p>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(selected.id, "accepted")}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      title="Kabul (A)"
                    >
                      <Check className="h-4 w-4" /> Kabul Et
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, "voting")}
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      title="Oylamaya Sun (V)"
                    >
                      <Send className="h-4 w-4" /> Oylamaya Sun
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      title="Reddet (R)"
                    >
                      <X className="h-4 w-4" /> Reddet
                    </button>
                  </div>

                  {/* İpucu */}
                  <p className="mt-3 text-xs text-slate-500">
                    İpuçları: ↑/↓ listedeki fikirler, ←/→ detayda gezinme, A kabul, V oylama, R reddet.
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex h-64 items-center justify-center text-slate-500">
                Detay için soldan bir fikir seçin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
