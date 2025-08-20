import { useMemo, useState } from "react"
import Navbar from "@/components/navbar"
import EventCard from "@/components/EventCardNew"
import type { EventItem } from  "@/components/EventCardNew"


const allEvents: EventItem[] = [
  {
    etkinlik_id: 1,
    ad: "Satranç Turnuvası",
    konu: "Şirket içi satranç turnuvası. Başlangıç ve ileri seviyeye açık.",
    tarih: "2024-12-25",
    saat: "14:00",
    konum: "Ana Ofis - 3. Kat",
    kategori: "Sosyal",
    buyukluk: "Departman",
    kota: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    etkinlik_id: 2,
    ad: "Kurumsal Sunum",
    konu: "2024 değerlendirmesi ve 2025 hedefleri sunumu.",
    tarih: "2024-12-28",
    saat: "09:30",
    konum: "Konferans Salonu",
    kategori: "Kurumsal",
    buyukluk: "Kurumsal",
    kota: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    etkinlik_id: 3,
    ad: "Futbol Maçı",
    konu: "Departmanlar arası futbol maçı. Takım ruhu & eğlence.",
    tarih: "2024-12-30",
    saat: "16:00",
    konum: "Spor Kompleksi",
    kategori: "Spor",
    buyukluk: "Kurumsal",
    kota: 44,
    imageUrl:
      "https://images.unsplash.com/photo-1519751138087-5a3a5e0c61b9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    etkinlik_id: 4,
    ad: "Teknik Eğitim",
    konu: "React ve modern web geliştirme teknikleri.",
    tarih: "2025-01-05",
    saat: "10:00",
    konum: "Eğitim Salonu A",
    kategori: "Eğitim",
    buyukluk: "Departman",
    kota: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
  {
    etkinlik_id: 5,
    ad: "Yeni Yıl Partisi",
    konu: "Müzik, ikramlar ve çekiliş.",
    tarih: "2024-12-31",
    saat: "19:00",
    konum: "Ana Salon",
    kategori: "Sosyal",
    buyukluk: "Kurumsal",
    kota: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
  },
  {
    etkinlik_id: 6,
    ad: "Basketbol Turnuvası",
    konu: "Şirket içi 3x3 basketbol turnuvası.",
    tarih: "2025-01-10",
    saat: "18:00",
    konum: "Spor Salonu",
    kategori: "Spor",
    buyukluk: "Kurumsal",
    kota: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop",
  },
]

type SortKey = "dateAsc" | "dateDesc" | "nameAsc" | "nameDesc"
const sizeOptions = ["Tümü", "Birim", "Departman", "Kurumsal"] as const

export default function EventsPage() {
  // filtre state'leri
  const [q, setQ] = useState("") // arama
  const [cat, setCat] = useState("Tüm Kategoriler")
  const [size, setSize] = useState<typeof sizeOptions[number]>("Tümü")
  const [sort, setSort] = useState<SortKey>("dateAsc")

  // kategorileri dinamik üret (dummy listeden)
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
        [e.ad, e.konu, e.konum, e.kategori]
          .join(" ")
          .toLowerCase()
          .includes(needle)

      const matchesCat =
        cat === "Tüm Kategoriler" ? true : e.kategori === cat

      const matchesSize = size === "Tümü" ? true : e.buyukluk === size

      return matchesText && matchesCat && matchesSize
    })

    // sort
    list = list.slice().sort((a, b) => {
      if (sort === "nameAsc") return a.ad.localeCompare(b.ad, "tr")
      if (sort === "nameDesc") return b.ad.localeCompare(a.ad, "tr")
      const da = new Date(`${a.tarih}T${a.saat}:00`).getTime()
      const db = new Date(`${b.tarih}T${b.saat}:00`).getTime()
      return sort === "dateAsc" ? da - db : db - da
    })

    return list
  }, [q, cat, size, sort])

  function handleJoin(e: EventItem) {
    // TODO: API çağrısı
    alert(`"${e.ad}" için katılım talebi gönderildi (örnek).`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar />

      <main className="flex-1 p-6">
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
                {s === "Tümü" ? "Tüm Boyutlar" : s}
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
              <EventCard key={ev.etkinlik_id} event={ev} onJoin={handleJoin} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
