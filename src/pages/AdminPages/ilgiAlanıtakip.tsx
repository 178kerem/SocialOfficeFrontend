// src/pages/IlgiAlanlariPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Users } from "lucide-react";

const ui = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
};

type UserItem = {
  id: string;
  name: string;
  interests: string[];
  about: string;
};

const mainCategories = ["Tüm Kullanıcılar", "Tüm İlgi Alanları", "Spor", "Eğitim"];
const subCategories: Record<string, string[]> = {
  "Tüm Kullanıcılar": ["Futbol", "Basketbol", "Satranç", "Bisiklet", "Yüzme"],
  "Tüm İlgi Alanları": ["Futbol", "Basketbol", "Satranç", "Bisiklet", "Yüzme"],
  Spor: ["Futbol", "Basketbol", "Bisiklet", "Yüzme"],
  Eğitim: ["Yazılım", "Yabancı Dil", "Matematik"],
};

const interestStats: Record<string, number> = {
  Futbol: 100,
  Basketbol: 60,
  Satranç: 40,
  Bisiklet: 25,
  Yüzme: 15,
  Yazılım: 80,
  "Yabancı Dil": 55,
  Matematik: 30,
};

const seedUsers: UserItem[] = [
  { id: crypto.randomUUID(), name: "Ahmet Yılmaz", interests: ["Futbol", "Basketbol"], about: "BT departmanında yazılımcı, aktif spor tutkunu." },
  { id: crypto.randomUUID(), name: "Ayşe Demir", interests: ["Satranç", "Matematik"], about: "Analitik düşünen, bulmaca çözmeyi seven." },
  { id: crypto.randomUUID(), name: "Mehmet Kaya", interests: ["Bisiklet", "Yüzme"], about: "Doğa sporu meraklısı, hafta sonları bisiklet turlarında." },
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
      document.removeEventListener("mousedown", onDoc as any, { capture: true } as any);
      document.removeEventListener("touchstart", onDoc as any, { capture: true } as any);
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
    <div className="flex flex-col gap-1 relative z-50" ref={boxRef}>
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <div className="relative">
        <input
          value={open ? q : value}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { setOpen(true); setQ(""); }}
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
              className="absolute mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5 overflow-auto max-h-52"
              style={{ zIndex: z }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">Eşleşen seçenek yok</div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ——— Kart ——— */
function UserCard({ user }: { user: UserItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${ui.panel} p-4`}
    >
      <div className="flex items-start gap-3">
        <Users className="h-6 w-6 text-sky-500 shrink-0" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800">{user.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{user.about}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.interests.map((i) => (
              <span key={i} className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">{i}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ——— Sayfa ——— */
export default function IlgiAlanlariPage() {
  const [main, setMain] = useState<string>("Tüm Kullanıcılar");
  const [sub, setSub] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");

  const filteredUsers = useMemo(() => {
    return seedUsers.filter(u => {
      const matchName = searchName ? u.name.toLocaleLowerCase("tr-TR").includes(searchName.toLocaleLowerCase("tr-TR")) : true;
      const matchCategory = main === "Tüm Kullanıcılar" ? true : u.interests.some(i => subCategories[main].includes(i));
      const matchSub = sub ? u.interests.includes(sub) : true;
      return matchName && matchCategory && matchSub;
    });
  }, [main, sub, searchName]);

  const filteredStats = useMemo(() => {
    if (main !== "Tüm İlgi Alanları") return {};
    return Object.fromEntries(
      Object.entries(interestStats).filter(([k]) => !sub || k === sub)
    );
  }, [main, sub]);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-sky-50/40 via-indigo-50/40 to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">İlgi Alanları</h1>

        {/* Filtreler */}
        <div className={`${ui.panel} mb-6 p-4 relative z-50`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SearchSelect label="Kategori" value={main} options={mainCategories} onChange={(v) => { setMain(v); setSub(""); }} />
            <SearchSelect label="Alt Kategori" value={sub} options={["", ...subCategories[main]]} onChange={setSub} />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Kullanıcı Ara</span>
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="İsim ara…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="relative z-0 grid grid-cols-1 gap-4">
          {main === "Tüm İlgi Alanları" ? (
            Object.entries(filteredStats).map(([k, v]) => (
              <div key={k} className={`${ui.panel} p-4 flex justify-between`}>
                <span className="font-medium text-slate-700">{k}</span>
                <span className="text-slate-500 text-sm">{v} kişi</span>
              </div>
            ))
          ) : (
            <>
              <AnimatePresence initial={false}>
                {filteredUsers.map(u => <UserCard key={u.id} user={u} />)}
              </AnimatePresence>
              {filteredUsers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-slate-500">
                  Sonuç yok.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
