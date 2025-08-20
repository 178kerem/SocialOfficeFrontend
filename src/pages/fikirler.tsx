import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ThumbsUp,
  Users,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";

/* ——— UI helpers ——— */
const shell = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
  chip: "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
  btn: "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2",
};

// ✅ net bir durum tipi tanımlayalım
type IdeaStatus = "new" | "in_review" | "accepted" | "rejected";

type Idea = {
  id: string;
  project: string;
  title: string;
  description: string;
  votes: number;
  contributors: number;
  comments: number;
  status?: IdeaStatus; // opsiyonel kalabilir
};


type NewIdea = {
  project: string;
  title: string;
  description: string;
};

/* ——— Mock veri ——— */
const projects = ["Tümü", "Property", "Kuzey Yemekhanesi", "Giriş/Çıkış", "Portal"];
const seed: Idea[] = [
  {
    id: crypto.randomUUID(),
    project: "Property",
    title: "Property uygulaması",
    description: "Giriş ekranına erişimi hızlandıracak bir kısayol butonu ekleyelim.",
    votes: 250,
    contributors: 15,
    comments: 10,
    status: "in_review",
  },
  {
    id: crypto.randomUUID(),
    project: "Property",
    title: "UI/UX düzenlemeleri",
    description: "Form adımlarını sadeleştirip kaydetmeden çıkınca uyarı verelim.",
    votes: 122,
    contributors: 7,
    comments: 4,
    status: "new",
  },
  {
    id: crypto.randomUUID(),
    project: "Portal",
    title: "Etkinlik duyuru modülü",
    description: "Kampüs etkinliklerini bir yerden takip edelim, filtre + bildirim olsun.",
    votes: 98,
    contributors: 23,
    comments: 19,
    status: "accepted",
  },
  {
    id: crypto.randomUUID(),
    project: "Kuzey Yemekhanesi",
    title: "Renk/Temalar",
    description: "Giriş/Çıkış uygulamasında açık koyu tema desteği.",
    votes: 45,
    contributors: 6,
    comments: 2,
    status: "new",
  },
];

/* ——— Küçük atomlar ——— */
function StatusPill({ s }: { s?: IdeaStatus }) {
  if (!s) return null; // undefined ise hiç render etme

  const map: Record<IdeaStatus, string> = {
    new: "bg-sky-100 text-sky-800 ring-sky-200",
    in_review: "bg-amber-100 text-amber-900 ring-amber-200",
    accepted: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  };
  const text: Record<IdeaStatus, string> = {
    new: "Yeni",
    in_review: "İncelemede",
    accepted: "Kabul",
    rejected: "Red",
  };

  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${map[s]}`}>{text[s]}</span>;
}


function Stat({ icon: Icon, value, label }: { icon: any; value: number | string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-2.5 py-1.5 text-xs text-slate-700">
      <Icon className="h-4 w-4 opacity-70" />
      <span className="font-semibold">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

/* ——— Modal ——— */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className={`${shell.panel} relative w-full max-w-lg rounded-2xl p-5`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ——— Kart ——— */
function IdeaCard({
  item,
  onUpvote,
}: {
  item: Idea;
  onUpvote: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${shell.panel} p-4`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-800">
              {item.title}
            </h3>
            <StatusPill s={item.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onUpvote(item.id)}
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            aria-label="Beğen"
          >
            <ThumbsUp className="h-4 w-4" />
            {item.votes}
          </button>
          <Stat icon={Users} value={item.contributors} label="katkı" />
        </div>
      </div>
    </motion.div>
  );
}

/* ——— Sayfa ——— */
export default function FikirlerPage() {
  const [list, setList] = useState<Idea[]>(seed);
  const [filterProject, setFilterProject] = useState("Tümü");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewIdea>({ project: "Property", title: "", description: "" });
    const [projectQuery, setProjectQuery] = useState("");
    const [projOpen, setProjOpen] = useState(false);
    const projRef = useRef<HTMLDivElement>(null);


    const filteredProjects = useMemo(() => {
    const q = projectQuery.trim().toLocaleLowerCase("tr-TR");
    return projects.filter((p) => (q ? p.toLocaleLowerCase("tr-TR").includes(q) : true));
    }, [projectQuery, projects]);

    // dışarı tıklayınca kapat
    useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
        if (!projRef.current) return;
        if (!projRef.current.contains(e.target as Node)) setProjOpen(false);
    };
    document.addEventListener("mousedown", handler, { capture: true });
    document.addEventListener("touchstart", handler, { capture: true });
    return () => {
        document.removeEventListener("mousedown", handler, { capture: true } as any);
        document.removeEventListener("touchstart", handler, { capture: true } as any);
    };
    }, []);

    // seçim yap
    const selectProject = (opt: string) => {
    setFilterProject(opt);
    setProjectQuery("");
    setProjOpen(false);
    };

    // klavye
    const onProjectKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const q = projectQuery.trim().toLocaleLowerCase("tr-TR");
        const exact = filteredProjects.find((p) => p.toLocaleLowerCase("tr-TR") === q);
        if (exact) selectProject(exact);
        else if (filteredProjects.length === 1) selectProject(filteredProjects[0]);
    } else if (e.key === "Escape") {
        setProjOpen(false);
    }
    };


  const filtered = useMemo(() => {
    const byProject = filterProject === "Tümü" ? list : list.filter((i) => i.project === filterProject);
    const byQuery = q.trim()
      ? byProject.filter(
          (i) =>
            i.title.toLowerCase().includes(q.toLowerCase()) ||
            i.description.toLowerCase().includes(q.toLowerCase())
        )
      : byProject;
    return byQuery;
  }, [list, filterProject, q]);

  function addIdea() {
    if (!form.title.trim() || !form.description.trim()) return;
    setList((prev) => [
      {
        id: crypto.randomUUID(),
        project: form.project,
        title: form.title.trim(),
        description: form.description.trim(),
        votes: 0,
        contributors: 1,
        comments: 0,
        status: "new",
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ project: "Property", title: "", description: "" });
  }

  function upvote(id: string) {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)));
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-indigo-50/40 via-sky-50/40 to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Başlık */}
        <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">İş Fikirleri</h1>
        </div>

        {/* Filtre çubuğu */}
        <div className={`${shell.panel} relative z-30 mb-6 p-4`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="shrink-0 text-slate-600">Proje</span>
              <div className="relative flex-1" ref={projRef}>
                <input
                    value={projOpen ? projectQuery : filterProject}   // kapalıyken seçili değer gösterilir
                    onChange={(e) => setProjectQuery(e.target.value)}
                    onFocus={() => {
                    setProjOpen(true);
                    setProjectQuery(""); // odaklanınca aramayı temizle (istersen kaldır)
                    }}
                    onBlur={() => setTimeout(() => setProjOpen(false), 120)}
                    onKeyDown={onProjectKeyDown}
                    placeholder="Proje ara veya seç…"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 pr-9 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={projOpen}
                    aria-controls="project-options"
                />

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <AnimatePresence>
                    {projOpen && (
                    <motion.div
                        id="project-options"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
                        onMouseDown={(e) => e.preventDefault()} // blur olmadan seçim yapılabilsin
                    >
                        <div className="max-h-52 overflow-auto py-1">
                        {filteredProjects.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-500">Eşleşen proje yok</div>
                        ) : (
                            filteredProjects.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => selectProject(opt)}
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
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <span className="shrink-0 text-slate-600">Ara</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Başlık veya açıklamada ara…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
        </div>

        {/* Liste */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((idea) => (
              <IdeaCard key={idea.id} item={idea} onUpvote={upvote} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-slate-500">
              Sonuç bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Sağ altta FAB */}
      <button
        onClick={() => setOpen(true)}
        className="group fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-1 ring-slate-900/10 transition-[transform,box-shadow] duration-300 ease-out bg-slate-900 hover:-translate-y-1 hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 motion-reduce:hover:transform-none"
        aria-label="İş fikri öner"
        title="İş fikri öner"
        >
        {/* Dıştaki gökkuşağı dalgası (ring) */}
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-[2px] transition-opacity duration-300 group-hover:opacity-100 animate-rainbow"
        />
        {/* İç dolguyu sabit tutup ringi görünür kılmak için */}
        <span aria-hidden className="pointer-events-none absolute inset-[2px] rounded-full bg-slate-900" />
        <Plus className="relative z-10 h-6 w-6" />
        </button>


      {/* Yeni fikir modalı */}
      <Modal open={open} onClose={() => setOpen(false)} title="Yeni İş Fikri">
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Proje</span>
            <select
              value={form.project}
              onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
              className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {projects.filter((p) => p !== "Tümü").map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Başlık</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Kısa bir başlık…"
              className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Açıklama</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Fikri kısaca anlat…"
              rows={4}
              className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className={`${shell.btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300`}
            >
              İptal
            </button>
            <button
              onClick={addIdea}
              className={`${shell.btn} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-300`}
            >
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
