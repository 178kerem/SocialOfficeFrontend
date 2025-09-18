// src/pages/events.tsx
import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCardNew";
import type { EventItem } from "@/components/EventCardNew";

type SortKey = "dateAsc" | "dateDesc" | "nameAsc" | "nameDesc";
const sizeOptions = ["Tümü", "Birim", "Departman", "Kurumsal"] as const;
type SizeValue = typeof sizeOptions[number];

const shell = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
};

export default function EventsPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tüm Kategoriler");
  const [size, setSize] = useState<SizeValue>("Tümü");
  const [sort, setSort] = useState<SortKey>("dateAsc");

  // Kullanıcı giriş yaptıysa token ile API’den eventleri çek
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = (await res.json()) as EventItem[];
        setEvents(data ?? []);
      } catch (err) {
        console.error(err);
        setEvents([]);
      }
    };

    fetchEvents();
  }, [auth]);
  

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.kategori));
    return ["Tüm Kategoriler", ...Array.from(set)];
  }, [events]);

  const sortOpts: { value: SortKey; label: string }[] = [
    { value: "dateAsc", label: "Tarih (Artan)" },
    { value: "dateDesc", label: "Tarih (Azalan)" },
    { value: "nameAsc", label: "Ada göre (A→Z)" },
    { value: "nameDesc", label: "Ada göre (Z→A)" },
  ];
  const catOpts = categories.map((c) => ({ value: c, label: c }));
  const sizeOpts = sizeOptions.map((s) => ({ value: s, label: s }));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = events.filter((e) => {
      const matchesText =
        !needle ||
        [e.ad, e.konu, e.konum, e.kategori].join(" ").toLowerCase().includes(needle);

      const matchesCat = cat === "Tüm Kategoriler" ? true : e.kategori === cat;
      const matchesSize = size === "Tümü" ? true : e.buyukluk === size;

      return matchesText && matchesCat && matchesSize;
    });

    list = list.slice().sort((a, b) => {
      if (sort === "nameAsc") return a.ad.localeCompare(b.ad, "tr");
      if (sort === "nameDesc") return b.ad.localeCompare(a.ad, "tr");
      const da = new Date(`${a.tarih}T${a.saat}:00`).getTime();
      const db = new Date(`${b.tarih}T${b.saat}:00`).getTime();
      return sort === "dateAsc" ? da - db : db - da;
    });

    return list;
  }, [events, q, cat, size, sort]);

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">
              Planlanmış Etkinlikler
            </h1>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </header>

          {/* Filtre çubuğu */}
          <div className={`${shell.panel} relative z-30 mb-6 p-4`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="flex items-center gap-2 text-sm sm:col-span-1">
                <div className="relative flex-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Başlık veya açıklamada ara…"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </label>

              <SelectBox label="" value={sort} options={sortOpts} onChange={(v) => setSort(v as SortKey)} />
              <SelectBox label="" value={cat} options={catOpts} onChange={setCat} />
              <SelectBox label="" value={size} options={sizeOpts} onChange={(v) => setSize(v as SizeValue)} />
            </div>
          </div>

          {/* Sonuçlar */}
          {filtered.length === 0 ? (
            <div className="text-slate-600 text-sm">Eşleşen etkinlik bulunamadı.</div>
          ) : (
            <motion.section
              layout
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.map((ev) => (
                  <motion.div
                    key={ev.etkinlik_id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    <EventCard event={ev} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}

// ——— SelectBox komponenti (aynı önceki kodun)
function SelectBox({ label, value, options, onChange, z = 40 }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  z?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
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

  const current = options.find((o) => o.value === value)?.label ?? "";

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
              className={`absolute z-[${z}] mt-1 w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5`}
              role="listbox"
            >
              <div className="max-h-56 overflow-auto py-1">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={[ "block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus:outline-none",
                      opt.value === value ? "bg-slate-50" : ""].join(" ")}
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
