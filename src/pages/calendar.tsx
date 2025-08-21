import Navbar from "@/components/navbar"
import MonthCalendar, { type CalendarEvent } from "@/components/Calendar/MonthCalendar"

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Satranç Turnuvası",
    date: "2025-08-14",
    imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop",
    time: "18:00",
    location: "Kampüs A",
    category: "Spor",
    scope: "Kurumsal",
    description: "Ödüllü hızlı satranç turnuvası. Başlangıç seviyesine açık."
  },
  {
    id: "2",
    title: "Satranç Workshop",
    date: "2025-08-14",
    imageUrl: "https://images.unsplash.com/photo-1529694157871-62f3d4f7e3c1?q=80&w=600&auto=format&fit=crop",
    time: "16:00",
    location: "Salon 3",
    category: "Eğitim",
    scope: "Departman",
    description: "Açılış prensipleri ve orta oyun stratejileri."
  },
  {
    id: "3",
    title: "Yoga Seansı",
    date: "2025-08-15",
    imageUrl: "https://images.unsplash.com/photo-1518609571773-39b7d303a86f?q=80&w=600&auto=format&fit=crop",
    time: "07:30",
    location: "Açık Alan",
    category: "Sağlık",
    scope: "Birim",
  },
  {
    id: "4",
    title: "Teknik Eğitim: React",
    date: "2025-08-18",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=600&auto=format&fit=crop",
    time: "13:30",
    location: "Lab-1",
    category: "Eğitim",
    scope: "Departman",
    description: "Modern React (Hooks + Router) uygulamalı atölye."
  },
  {
    id: "5",
    title: "Futbol Maçı",
    date: "2025-08-18",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
    time: "19:00",
    location: "Saha-2",
    category: "Spor",
    scope: "Birim",
  },
  {
    id: "6",
    title: "Yeni Yıl Partisi",
    date: "2025-08-20",
    imageUrl: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=600&auto=format&fit=crop",
    time: "21:00",
    location: "Kantin",
    category: "Sosyal",
    scope: "Kurumsal",
  },
  {
    id: "7",
    title: "Kamp Etkinliği",
    date: "2025-08-20",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
    time: "10:00",
    location: "Orman Kamp Alanı",
    category: "Outdoor",
    scope: "Departman",
    description: "Gece konaklamalı doğa yürüyüşü ve kamp ateşi."
  },
  {
    id: "8",
    title: "Koşu Kulübü",
    date: "2025-08-22",
    imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
    time: "06:45",
    location: "Stad",
    category: "Spor",
    scope: "Birim",
  },
  {
    id: "9",
    title: "Fotoğraf Gezisi",
    date: "2025-08-25",
    imageUrl: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=600&auto=format&fit=crop",
    time: "09:00",
    location: "Eski Şehir",
    category: "Kültür",
    scope: "Kurumsal",
    description: "Mimari ve sokak fotoğrafçılığı rotası."
  },
  {
    id: "10",
    title: "Toplantı: Q3 Planlama",
    date: "2025-08-25",
    imageUrl: "https://images.unsplash.com/photo-1529336953121-4d9df0a1aa49?q=80&w=600&auto=format&fit=crop",
    time: "11:00",
    location: "Toplantı Odası B",
    category: "İş",
    scope: "Departman",
  },
  {
    id: "11",
    title: "Satranç Final Maçı",
    date: "2025-08-25",
    imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop",
    time: "20:00",
    location: "Salon 1",
    category: "Spor",
    scope: "Kurumsal",
  },
]

export default function CalendarPage() {
  const handleEventClick = (ev: CalendarEvent) => {
    // İstersen burada route'a gidebilirsin (örn. /events/:id)
    alert(
      `Etkinlik: ${ev.title}\n` +
      `Tarih: ${ev.date}${ev.time ? " " + ev.time : ""}\n` +
      `${ev.location ? "Konum: " + ev.location + "\n" : ""}` +
      `${ev.category ? "Kategori: " + ev.category + "\n" : ""}` +
      `${ev.scope ? "Kapsam: " + ev.scope + "\n" : ""}`
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sol sabit navbar */}
      <Navbar fixed />

      {/* İçerik: nav dar (w-16) iken ml-16, hover’da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        {/* h-screen + flex: takvimi ekrana tam oturtur */}
        <div className="h-screen max-w-7xl mx-auto px-4 pt-6 pb-6 flex flex-col">
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">Takvim</h1>

          <MonthCalendar
            events={events}
            initialDate={new Date(2025, 7, 1)}  // Ağustos 2025
            onEventClick={handleEventClick}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
