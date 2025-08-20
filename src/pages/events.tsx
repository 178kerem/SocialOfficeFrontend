import { useMemo, useState } from "react"
import Navbar from "@/components/navbar"
import EventCard from "@/components/EventCardNew"
import type { EventItem } from "@/components/EventCardNew"

type SortKey = "dateAsc" | "dateDesc" | "nameAsc" | "nameDesc"
const sizeOptions = ["Tümü", "Birim", "Departman", "Kurumsal"] as const

// Örnek veri — API'den çekeceksen burayı kaldırıp fetch ile doldur
const allEvents: EventItem[] = [
  {
    etkinlik_id: 1,
    ad: "Satranç Turnuvası",
    konu: "Şirket içi satranç turnuvası. Başlangıç ve ileri seviyeye açık.",
    tarih: "2025-01-12",
    saat: "14:00",
    konum: "Ana Ofis - 3. Kat",
    kategori: "Sosyal",
    buyukluk: "Departman",
    kota: 32,
  },
  {
    etkinlik_id: 2,
    ad: "Kurumsal Sunum",
    konu: "2024 değerlendirmesi ve 2025 hedefleri sunumu.",
    tarih: "2025-01-20",
    saat: "09:30",
    konum: "Konferans Salonu",
    kategori: "Kurumsal",
    buyukluk: "Kurumsal",
    kota: 150,
  },
  {
    etkinlik_id: 3,
    ad: "Futbol Maçı",
    konu: "Birimler arası dostluk maçı.",
    tarih: "2025-01-18",
    saat: "16:00",
    konum: "Spor Kompleksi",
    kategori: "Spor",
    buyukluk: "Birim",
    kota: 44,
  },
  {
    etkinlik_id: 4,
    ad: "Teknik Eğitim: React",
    konu: "Modern React ve iyi pratikler.",
    tarih: "2025-01-25",
    saat: "10:00",
    konum: "Eğitim Salonu A",
    kategori: "Eğitim",
    buyukluk: "Departman",
    kota: 25,
  },
  {
    etkinlik_id: 5,
    ad: "Yeni Yıl Partisi",
    konu: "Müzik, ikramlar ve çekiliş.",
    tarih: "2025-01-05",
    saat: "19:00",
    konum: "Ana Salon",
    kategori: "Sosyal",
    buyukluk: "Kurumsal",
    kota: 200,
  },
  {
    etkinlik_id: 6,
    ad: "Basketbol Turnuvası",
    konu: "Şirket içi 3x3 basketbol turnuvası.",
    tarih: "2025-01-28",
    saat: "18:00",
    konum: "Spor Salonu",
    kategori: "Spor",
    buyukluk: "Departman",
    kota: 24,
  },
]

export default function EventsPage() {
  // filtre state'leri
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("Tüm Kategoriler")
  const [size, setSize] = useState<typeof sizeOptions[number]>("Tümü")
  const [sort, setSort] = useState<SortKey>("dateAsc")

  // dinamik kategori listesi
  const categories = useMemo(() => {
    const set = new Set(allEvents.map((e) => e.kategori))
    return ["Tüm Kategoriler", ...Array.from(set)]
  }, [])

  // filtre + sıralama
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()

    let list = allEvents.filter((e) => {
      const matchesText =
        !needle ||
        [e.ad, e.konu, e.konum, e.kategori].join(" ").toLowerCase().includes(needle)

      const matchesCat = cat === "Tüm Kategoriler" ? true : e.kategori === cat
      const matchesSize = size === "Tümü" ? true : e.buyukluk === size

      return matchesText && matchesCat && matchesSize
    })

    list = list.slice().sort((a, b) => {
      if (sort === "nameAsc") return a.ad.localeCompare(b.ad, "tr")
      if (sort === "nameDesc") return b.ad.localeCompare(a.ad, "tr")
      const da = new Date(`${a.tarih}T${a.saat}:00`).getTime()
      const db = new Date(`${b.tarih}T${b.saat}:00`).getTime()
      return sort === "dateAsc" ? da - db : db - da
    })

    return list
  }, [q, cat, size, sort])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sol sabit nav (root'unda group/nav peer/nav olmalı) */}
      <Navbar activeId="calendar" fixed />

      {/* İçerik: nav dar (w-16) iken ml-16, hover'da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Planlanmış Etkinlikler</h1>
            <p className="text-slate-600">
              Yaklaşan etkinlikleri görüntüleyin ve katılmak istediklerinize kayıt olun.
            </p>
          </header>

          {/* Arama & filtreler */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-56">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="etkinlik ara..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            >
              <option value="dateAsc">Sırala: Tarih (Artan)</option>
              <option value="dateDesc">Sırala: Tarih (Azalan)</option>
              <option value="nameAsc">Sırala: Ada göre (A→Z)</option>
              <option value="nameDesc">Sırala: Ada göre (Z→A)</option>
            </select>

            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={size}
              onChange={(e) => setSize(e.target.value as typeof sizeOptions[number])}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "Tümü" ? "Tüm Çaplar" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sonuçlar */}
          {filtered.length === 0 ? (
            <div className="text-slate-600 text-sm">Eşleşen etkinlik bulunamadı.</div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((ev) => (
                <EventCard key={ev.etkinlik_id} event={ev} />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
