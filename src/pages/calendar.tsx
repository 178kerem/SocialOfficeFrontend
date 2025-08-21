import MonthCalendar from "@/components/Calendar/MonthCalendar"
import type { CalendarEvent } from "@/components/Calendar/MonthCalendar"

const events: CalendarEvent[] = [
  { id: "1",  title: "Satranç Turnuvası", date: "2025-08-14", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: "2",  title: "Satranç Turnuvası", date: "2025-08-15", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: "3",  title: "Satranç Turnuvası", date: "2025-08-16", imageUrl: "https://images.unsplash.com/photo-1519669417670-68775a50919a?q=80&w=600&auto=format&fit=crop" },
  { id: "4",  title: "Teknik Eğitim",     date: "2025-08-18", imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=600&auto=format&fit=crop" },
  { id: "5",  title: "Futbol Maçı",       date: "2025-08-18", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop" },
  { id: "6",  title: "Yeni Yıl Partisi",  date: "2025-08-20", imageUrl: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=600&auto=format&fit=crop" },
  { id: "7",  title: "Kamp Etkinliği",    date: "2025-08-20", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop" },
  { id: "8",  title: "Koşu Kulübü",       date: "2025-08-22", imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop" },
  { id: "9",  title: "Yoga Seansı",       date: "2025-08-22", imageUrl: "https://images.unsplash.com/photo-1518609571773-39b7d303a86f?q=80&w=600&auto=format&fit=crop" },
  { id: "10", title: "Toplantı",          date: "2025-08-25", imageUrl: "https://images.unsplash.com/photo-1529336953121-4d9df0a1aa49?q=80&w=600&auto=format&fit=crop" },
  { id: "11", title: "Fotoğraf Gezisi",   date: "2025-08-25", imageUrl: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=600&auto=format&fit=crop" },
  { id: "12", title: "Satranç Workshop",  date: "2025-08-25", imageUrl: "https://images.unsplash.com/photo-1529694157871-62f3d4f7e3c1?q=80&w=600&auto=format&fit=crop" },
]

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* İçerik: nav dar (w-16) iken ml-16, hover’da ml-64 */}
      <div className="ml-16 peer-hover/nav:ml-64 transition-[margin-left] duration-300">
        {/* Tam ekran yükseklik */}
        <div className="h-screen max-w-7xl mx-auto px-4 pt-6 pb-6 flex flex-col">
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">Takvim</h1>

          {/* Kart ekranın kalanını kaplasın */}
          <MonthCalendar
            events={events}
            initialDate={new Date(2025, 7, 1)}   // Ağustos 2025
            maxVisiblePerDay={3}                 // hücre başına görsel sayısı
            onEventClick={(ev) => console.log("Etkinlik:", ev)}
            onDayClick={(iso) => console.log("Gün:", iso)}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
