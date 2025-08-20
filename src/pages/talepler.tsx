// src/pages/TaleplerPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ThumbsUp, ThumbsDown, Plus } from "lucide-react";

/* ——— UI helpers ——— */
const ui = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
  pill: "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
  stat:
    "inline-flex items-center gap-2 rounded-xl border bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700",
};

/* ——— Tipler ——— */
type RequestItem = {
  id: string;
  unit: string; // Birim
  dept: string; // Departman
  title: string;
  description: string;
  up: number;
  down: number;
};

/* ——— Veriler ——— */
const units = ["Tümü", "A Birimi", "B Birimi", "C Birimi"];
const departments = ["Tümü", "BT", "İK", "Muhasebe", "Satınalma", "Operasyon"];

const seed: RequestItem[] = [
  {
    id: crypto.randomUUID(),
    unit: "A Birimi",
    dept: "BT",
    title: "Bilgimiz Su Otomatı",
    description:
      "Bina giriş katına su ve çeşitli atıştırmalıkların olduğu otomatlar talep ediyorum.",
    up: 250,
    down: 20,
  },
  {
    id: crypto.randomUUID(),
    unit: "B Birimi",
    dept: "İK",
    title: "Yeni Karşılama Kiti",
    description:
      "Yeni başlayanlar için kart, defter, termos ve rozet içeren bir karşılama kiti hazırlayalım.",
    up: 180,
    down: 12,
  },
  {
    id: crypto.randomUUID(),
    unit: "A Birimi",
    dept: "Muhasebe",
    title: "Masraf Talep Otomasyonu",
    description:
      "Masraf talep formlarının mobilden doldurulabileceği basit bir akış istiyorum.",
    up: 132,
    down: 9,
  },
  {
    id: crypto.randomUUID(),
    unit: "C Birimi",
    dept: "Satınalma",
    title: "Stok Görünürlüğü",
    description:
      "Departman bazlı stok kalemlerinin aylık raporunu gösteren bir tablo talep ediyorum.",
    up: 96,
    down: 8,
  },
];

/* ——— Reusable searchable combobox ——— */
function SearchSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Seç…",
  z = 50,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  z?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const norm = (s: string) => s.toLocaleLowerCase("tr-TR");
  const filtered = useMemo(() => {
    const query = norm(q);
    return options.filter((o) => (query ? norm(o).includes(query) : true));
  }, [q, options]);

  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, { capture: true });
    document.addEventListener("touchstart", onDoc, { capture: true });
    return () => {
      document.removeEventListener("mousedown", onDoc, { capture: true } as any);
      document.removeEventListener("touchstart", onDoc, { capture: true } as any);
    };
  }, []);

  const select = (v: string) => {
    onChange(v);
    setQ("");
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exact = filtered.find((o) => norm(o) === norm(q));
      if (exact) select(exact);
      else if (filtered.length === 1) select(filtered[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <div className="relative z-30" ref={boxRef}>
        <input
          value={open ? q : value}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 pr-9 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
        />
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-[${z}] mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5`}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="max-h-52 overflow-auto py-1">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Eşleşen seçenek yok
                  </div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => select(opt)}
                      className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
  );
}

/* ——— Kart ——— */
function RequestCard({
  item,
  choice,
  onVote,
}: {
  item: RequestItem;
  choice: "up" | "down" | null | undefined;
  onVote: (id: string, dir: "up" | "down") => void;
}) {
  const upActive = choice === "up";
  const downActive = choice === "down";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${ui.panel} p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 text-[13px] font-semibold text-slate-500">
            {item.unit} · {item.dept}
          </div>
          <h3 className="text-base font-semibold text-slate-800">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* LIKE */}
        <button
          onClick={() => onVote(item.id, "up")}
          className={[
            ui.stat,
            "border border-emerald-200 transition-colors",
            upActive ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" : "",
          ].join(" ")}
          aria-pressed={upActive}
          title={upActive ? "Beğeniyi geri al" : "Beğen"}
        >
          <ThumbsUp className="h-4 w-4 text-emerald-600" />
          {item.up}
        </button>

        {/* DISLIKE */}
        <button
          onClick={() => onVote(item.id, "down")}
          className={[
            ui.stat,
            "border border-rose-200 transition-colors",
            downActive ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200" : "",
          ].join(" ")}
          aria-pressed={downActive}
          title={downActive ? "Beğenmeyi geri al" : "Beğenme"}
        >
          <ThumbsDown className="h-4 w-4 text-rose-600" />
          {item.down}
        </button>
      </div>
    </motion.div>
  );
}

/* ——— Sayfa ——— */
export default function TaleplerPage() {
  const [list, setList] = useState<RequestItem[]>(seed);
  const [unit, setUnit] = useState<string>("Tümü");
  const [dept, setDept] = useState<string>("Tümü");

  // Kullanıcının bu oturumdaki oyları: her id için 'up' | 'down' | null
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});

  const filtered = useMemo(() => {
    return list.filter((r) => {
      const okUnit = unit === "Tümü" ? true : r.unit === unit;
      const okDept = dept === "Tümü" ? true : r.dept === dept;
      return okUnit && okDept;
    });
  }, [list, unit, dept]);

  // Yeni talep modalı
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<RequestItem, "id" | "up" | "down">>({
    unit: "A Birimi",
    dept: "BT",
    title: "",
    description: "",
  });

  const save = () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setList((p) => [
      { id: crypto.randomUUID(), up: 0, down: 0, ...form },
      ...p,
    ]);
    setOpen(false);
    setForm({ unit: "A Birimi", dept: "BT", title: "", description: "" });
  };

  /** Oy işlemi: tek yön seçilebilir; aynı tuşa basınca kaldırılır */
  const vote = (id: string, dir: "up" | "down") => {
    setVotes((prev) => {
      const prevChoice = prev[id] ?? null;
      const nextChoice: "up" | "down" | null =
        prevChoice === dir ? null : dir;

      // list sayıları ile senkron güncelle
      setList((current) =>
        current.map((it) => {
          if (it.id !== id) return it;
          let up = it.up;
          let down = it.down;

          if (dir === "up") {
            if (prevChoice === "up") up -= 1; // kaldır
            else if (prevChoice === "down") {
              down -= 1;
              up += 1;
            } else up += 1;
          } else {
            if (prevChoice === "down") down -= 1; // kaldır
            else if (prevChoice === "up") {
              up -= 1;
              down += 1;
            } else down += 1;
          }

          // emniyet: negatif olmasın
          up = Math.max(0, up);
          down = Math.max(0, down);
          return { ...it, up, down };
        })
      );

      return { ...prev, [id]: nextChoice };
    });
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-indigo-50/40 via-sky-50/40 to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Başlık */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Talepler
          </h1>
        </div>

        {/* Filtreler */}
        <div className={`${ui.panel} relative z-30 mb-6 p-4`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SearchSelect
              label="Birim"
              value={unit}
              options={units}
              onChange={setUnit}
              placeholder="Birim seç…"
              z={60}
            />
            <SearchSelect
              label="Departman"
              value={dept}
              options={departments}
              onChange={setDept}
              placeholder="Departman seç…"
              z={60}
            />
          </div>
        </div>

        {/* Liste */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((r) => (
              <RequestCard
                key={r.id}
                item={r}
                choice={votes[r.id] ?? null}
                onVote={vote}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-slate-500">
              Sonuç yok.
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Talep oluştur"
        title="Talep oluştur"
        className="group fixed bottom-6 right-6 outline-none"
      >
        <span
          className="
            pointer-events-none absolute inset-0 -m-[3px] rounded-full
            bg-[conic-gradient(at_top_left,_#06b6d4,_#22c55e,_#f59e0b,_#ef4444,_#8b5cf6,_#06b6d4)]
            opacity-0 blur-[1.5px]
            transition-opacity duration-300
            group-hover:opacity-90
            group-hover:animate-[spin_3s_linear_infinite]
          "
        />
        <span
          className="
            relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full
            bg-slate-900 text-white shadow-lg ring-1 ring-slate-900/10
            transition-all duration-300 will-change-transform
            group-hover:scale-110 group-hover:-translate-y-0.5
            group-hover:bg-white group-hover:text-slate-900
            focus-visible:ring-4 focus-visible:ring-sky-300/30
          "
        >
          <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
        </span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className={`${ui.panel} relative w-full max-w-lg rounded-2xl p-5`}
            >
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                Yeni Talep
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="z-40">
                  <SearchSelect
                    label="Birim"
                    value={form.unit}
                    options={units.filter((u) => u !== "Tümü")}
                    onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                  />
                </div>
                <SearchSelect
                  label="Departman"
                  value={form.dept}
                  options={departments.filter((d) => d !== "Tümü")}
                  onChange={(v) => setForm((f) => ({ ...f, dept: v }))}
                />

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-600">Başlık</span>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Kısa bir başlık…"
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-600">Açıklama</span>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Talebi kısaca anlat…"
                    rows={4}
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className={`${ui.pill} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-300`}
                  >
                    İptal
                  </button>
                  <button
                    onClick={save}
                    className={`${ui.pill} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-2 focus:ring-emerald-300`}
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
