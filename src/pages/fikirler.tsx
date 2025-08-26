// src/pages/fikirler.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Plus, ChevronDown, X } from "lucide-react";

/* ——— UI helpers ——— */
const shell = {
  panel:
    "rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 ring-1 ring-slate-200/70 shadow-sm",
  chip: "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
  btn: "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2",
};

type IdeaStatus = "new" | "in_review" | "accepted" | "rejected";

type Idea = {
  id: string;
  project: string;
  title: string;
  description: string;
  votes: number;
  dislikes: number; // 👈 eklendi
  comments: number;
  status?: IdeaStatus;
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
    dislikes: 12,
    comments: 10,
    status: "in_review",
  },
  {
    id: crypto.randomUUID(),
    project: "Property",
    title: "UI/UX düzenlemeleri",
    description: "Form adımlarını sadeleştirip kaydetmeden çıkınca uyarı verelim.",
    votes: 122,
    dislikes: 4,
    comments: 4,
    status: "new",
  },
  {
    id: crypto.randomUUID(),
    project: "Portal",
    title: "Etkinlik duyuru modülü",
    description: "Kampüs etkinliklerini bir yerden takip edelim, filtre + bildirim olsun.",
    votes: 98,
    dislikes: 8,
    comments: 19,
    status: "accepted",
  },
  {
    id: crypto.randomUUID(),
    project: "Kuzey Yemekhanesi",
    title: "Renk/Temalar",
    description: "Giriş/Çıkış uygulamasında açık koyu tema desteği.",
    votes: 45,
    dislikes: 1,
    comments: 2,
    status: "new",
  },
];

/* ——— Küçük atomlar ——— */
function StatusPill({ s }: { s?: IdeaStatus }) {
  if (!s) return null;
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
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${map[s]}`}>
      {text[s]}
    </span>
  );
}

/* ——— AnimatedNumber: sayı değişiminde yumuşak geçiş ——— */
function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
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
              <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Kapat">
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
  onDownvote,
}: {
  item: Idea;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
}) {
  const [likeCooldown, setLikeCooldown] = useState(false);
  const [dislikeCooldown, setDislikeCooldown] = useState(false);

  const clickLike = () => {
    if (likeCooldown) return;
    onUpvote(item.id);
    setLikeCooldown(true);
    setTimeout(() => setLikeCooldown(false), 300);
  };

  const clickDislike = () => {
    if (dislikeCooldown) return;
    onDownvote(item.id);
    setDislikeCooldown(true);
    setTimeout(() => setDislikeCooldown(false), 300);
  };

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
            <h3 className="truncate text-base font-semibold text-slate-800">{item.title}</h3>
            <StatusPill s={item.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Like */}
          <motion.button
            onClick={clickLike}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: likeCooldown ? "0 10px 24px rgba(16,185,129,0.28)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Beğen"
            disabled={likeCooldown}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-600"
              style={{ transitionDuration: "600ms" }}
            />
            <ThumbsUp className="h-4 w-4" />
            <AnimatedNumber value={item.votes} className="tabular-nums" />
          </motion.button>

          {/* Dislike */}
          <motion.button
            onClick={clickDislike}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: dislikeCooldown ? "0 10px 24px rgba(244,63,94,0.28)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-800 ring-1 ring-rose-100 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
            aria-label="Beğenme"
            disabled={dislikeCooldown}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-600"
              style={{ transitionDuration: "600ms" }}
            />
            <ThumbsDown className="h-4 w-4" />
            <AnimatedNumber value={item.dislikes} className="tabular-nums" />
          </motion.button>
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

  // searchable combobox state
  const [projectQuery, setProjectQuery] = useState("");
  const [projOpen, setProjOpen] = useState(false);
  const projRef = useRef<HTMLDivElement>(null);

  const filteredProjects = useMemo(() => {
    const s = projectQuery.trim().toLocaleLowerCase("tr-TR");
    return projects.filter((p) => (s ? p.toLocaleLowerCase("tr-TR").includes(s) : true));
  }, [projectQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!projRef.current) return;
      if (!projRef.current.contains(e.target as Node)) setProjOpen(false);
    };
    document.addEventListener("mousedown", handler, { capture: true });
    document.addEventListener("touchstart", handler, { capture: true });
    return () => {
      document.removeEventListener("mousedown", handler as any, { capture: true } as any);
      document.removeEventListener("touchstart", handler as any, { capture: true } as any);
    };
  }, []);

  const selectProject = (opt: string) => {
    setFilterProject(opt);
    setProjectQuery("");
    setProjOpen(false);
  };

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

  /* ——— Oy artır/azalt — güvenli tek setState ——— */
  function upvote(id: string) {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)));
  }
  function downvote(id: string) {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, dislikes: i.dislikes + 1 } : i)));
  }

  function addIdea() {
    if (!form.title.trim() || !form.description.trim()) return;
    setList((prev) => [
      {
        id: crypto.randomUUID(),
        project: form.project,
        title: form.title.trim(),
        description: form.description.trim(),
        votes: 0,
        dislikes: 0,
        comments: 0,
        status: "new",
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ project: "Property", title: "", description: "" });
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
                  value={projOpen ? projectQuery : filterProject}
                  onChange={(e) => setProjectQuery(e.target.value)}
                  onFocus={() => {
                    setProjOpen(true);
                    setProjectQuery("");
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
                      className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
                      onMouseDown={(e) => e.preventDefault()}
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
              <IdeaCard key={idea.id} item={idea} onUpvote={upvote} onDownvote={downvote} />
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
        aria-label="İş fikri öner"
        title="İş fikri öner"
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
