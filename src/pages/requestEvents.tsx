import { useMemo, useState } from "react"
import Navbar from "@/components/navbar"

type Scope = "Birim" | "Departman" | "Kurumsal"

type RequestItem = {
  id: number
  baslik: string
  konu: string
  tarih: string       // "YYYY-MM-DD"
  konum: string
  kategori: string    // Spor, Sosyal, Eğitim...
  buyukluk: Scope
  imageUrl?: string
  up: number
  down: number
  createdAt: string   // ISO
}

type SortKey = "newest" | "oldest" | "mostNet" | "mostUp"

const seed: RequestItem[] = [
  {
    id: 1,
    baslik: "Satranç Turnuvası",
    konu: "Satranç turnuvası düzenlenmesini talep ediyorum",
    tarih: "2025-11-11",
    konum: "Kampüs",
    kategori: "Sosyal",
    buyukluk: "Kurumsal",
    imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop",
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
]

export default function RequestsPage() {
  // veri + oy state
  const [items, setItems] = useState<RequestItem[]>(seed)
  // kullanıcı oyu: id -> 1 (up) | -1 (down) | 0 (yok)
  const [myVotes, setMyVotes] = useState<Record<number, 1 | -1 | 0>>({})

  // filtre/sıralama
  const [q, setQ] = useState("")
  const [scope, setScope] = useState<"Tümü" | Scope>("Tümü")
  const [cat, setCat] = useState<string>("Tüm Kategoriler")
  const [sort, setSort] = useState<SortKey>("newest")

  // kategori seçenekleri
  const categories = useMemo(() => {
    const s = new Set(items.map((i) => i.kategori))
    return ["Tüm Kategoriler", ...Array.from(s)]
  }, [items])

  // filtre + sıralama
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = items.filter((i) => {
      const text = [i.baslik, i.konu, i.konum, i.kategori].join(" ").toLowerCase()
      const okText = !needle || text.includes(needle)
      const okScope = scope === "Tümü" ? true : i.buyukluk === scope
      const okCat = cat === "Tüm Kategoriler" ? true : i.kategori === cat
      return okText && okScope && okCat
    })

    list = list.slice().sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === "mostUp") return b.up - a.up
      // mostNet
      return (b.up - b.down) - (a.up - a.down)
    })

    return list
  }, [items, q, scope, cat, sort])

  function toggleVote(id: number, dir: 1 | -1) {
    setItems((prev) => {
      const cur = prev.map((it) => ({ ...it }))
      const idx = cur.findIndex((x) => x.id === id)
      if (idx === -1) return prev

      const mv = myVotes[id] ?? 0
      // mevcut oy geri al
      if (mv === 1) cur[idx].up -= 1
      if (mv === -1) cur[idx].down -= 1

      let nextVote: 1 | -1 | 0 = dir
      // aynı yöne tekrar tıklanırsa sıfırla
      if (mv === dir) nextVote = 0
      // yeni oyu uygula
      if (nextVote === 1) cur[idx].up += 1
      if (nextVote === -1) cur[idx].down += 1

      // vote map'i güncelle
      setMyVotes((m) => ({ ...m, [id]: nextVote }))
      return cur
    })
  }

  // dialog state
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    baslik: "",
    konu: "",
    tarih: "",
    konum: "",
    kategori: "",
    buyukluk: "Birim" as Scope,
    imageUrl: "",
  })

  const canSubmit =
    form.baslik.trim() &&
    form.konu.trim() &&
    form.tarih &&
    form.konum.trim() &&
    form.kategori.trim() &&
    form.buyukluk

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const now = new Date().toISOString()
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
      },
      ...list,
    ])
    setOpen(false)
    setForm({ baslik: "", konu: "", tarih: "", konum: "", kategori: "", buyukluk: "Birim", imageUrl: "" })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar fixed />

      {/* içerik */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-24">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Talep Edilen Etkinlikler</h1>
            <p className="text-slate-600 text-sm">Oy ver, filtrele, sırala; yeni etkinlik talebi oluştur.</p>
          </header>

          {/* arama & filtreler */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="relative flex-1 min-w-56">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="talep ara..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 bg-white"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path>
                </svg>
              </span>
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-slate-300 px-2 py-2 text-sm bg-white">
              <option value="newest">Sırala: En yeni</option>
              <option value="oldest">Sırala: En eski</option>
              <option value="mostNet">Sırala: En çok oy (net)</option>
              <option value="mostUp">Sırala: En çok beğeni</option>
            </select>

            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-sm bg-white">
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>

            <select value={scope} onChange={(e) => setScope(e.target.value as any)} className="rounded-lg border border-slate-300 px-2 py-2 text-sm bg-white">
              {["Tümü", "Birim", "Departman", "Kurumsal"].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          {/* kartlar */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((it) => (
              <article key={it.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                {/* başlık + badge */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 leading-tight">{it.baslik}</h3>
                    <span className="rounded-full bg-blue-600 text-white text-[11px] px-2 py-0.5">{it.buyukluk}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{it.konu}</p>
                </div>

                {/* görsel */}
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.baslik} className="h-36 w-full object-cover" loading="lazy" />
                ) : null}

                {/* alt bilgi */}
                <div className="p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>📅 {formatDate(it.tarih)}</span>
                    <span>📍 {it.konum}</span>
                    <span>🏷️ {it.kategori}</span>
                  </div>

                  {/* oy butonları */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVote(it.id, 1)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm ${
                        (myVotes[it.id] ?? 0) === 1
                          ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                      aria-pressed={(myVotes[it.id] ?? 0) === 1}
                    >
                      👍 <span>{it.up}</span>
                    </button>
                    <button
                      onClick={() => toggleVote(it.id, -1)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm ${
                        (myVotes[it.id] ?? 0) === -1
                          ? "border-rose-600 text-rose-700 bg-rose-50"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                      aria-pressed={(myVotes[it.id] ?? 0) === -1}
                    >
                      👎 <span>{it.down}</span>
                    </button>

                    <span className="ml-auto text-[11px] text-slate-500">
                      Net oy: <b>{it.up - it.down}</b>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>

      {/* Floating "Talep Oluştur" */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 w-14 h-14 grid place-items-center"
        title="Etkinlik Talebinde Bulun"
        aria-label="Etkinlik Talebinde Bulun"
      >
        <span className="text-2xl leading-none">＋</span>
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-6 bottom-24 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Talep Formu</h2>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={submitForm} className="p-4 space-y-3">
              <Input label="Başlık" value={form.baslik} onChange={(v) => setForm((f) => ({ ...f, baslik: v }))} />
              <TextArea label="Konu" value={form.konu} onChange={(v) => setForm((f) => ({ ...f, konu: v }))} />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Tarih" type="date" value={form.tarih} onChange={(v) => setForm((f) => ({ ...f, tarih: v }))} />
                <Input label="Konum" value={form.konum} onChange={(v) => setForm((f) => ({ ...f, konum: v }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <Input label="Görsel URL (opsiyonel)" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} />

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Vazgeç</button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  Talep Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------- küçük yardımcı inputlar ----------------- */
function Input({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
      />
    </label>
  )
}

function TextArea({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
      />
    </label>
  )
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
      >
        <option value="" disabled>Seçiniz</option>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </label>
  )
}

/* ----------------- yardımcı fn'ler ----------------- */
function formatDate(isoYmd: string) {
  const d = new Date(isoYmd + "T00:00:00")
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
