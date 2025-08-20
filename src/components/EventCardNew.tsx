import * as React from "react"

export type EventItem = {
  etkinlik_id: number
  ad: string
  konu: string
  tarih: string   // "YYYY-MM-DD"
  saat: string    // "HH:mm"
  konum: string
  kategori: string            // Örn: "Sosyal", "Spor", "Eğitim", "Kurumsal" vs. (etkinlik türü)
  buyukluk: "Birim" | "Departman" | "Kurumsal" // Etkinliğin çapı
  kota: number
  imageUrl?: string
}

type Props = {
  event: EventItem
  className?: string
  onJoin?: (event: EventItem) => void
}

export default function EventCard({ event, className, onJoin }: Props) {
  const date = new Date(event.tarih + "T00:00:00")
  const dateStr = date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  // Etiket: etkinlik çapı (Birim / Departman / Kurumsal)
  const scopeLabel = event.buyukluk

  return (
    <div
      className={[
        "rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col",
        className ?? "",
      ].join(" ")}
    >
      <div className="relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.ad}
            className="h-36 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-36 w-full bg-slate-200 grid place-items-center text-slate-500 text-sm">
            Görsel yok
          </div>
        )}

        <span className="absolute top-2 right-2 rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">
          {scopeLabel}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-semibold text-slate-900">{event.ad}</h3>
        <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{event.kategori}</p>

        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.konu}</p>

        <ul className="text-xs text-slate-600 space-y-1 flex-1">
          <li>📅 {dateStr}</li>
          <li>⏰ {event.saat}</li>
          <li>📍 {event.konum}</li>
          <li>👥 {event.kota} kişi</li>
        </ul>

        <button
          onClick={() => onJoin?.(event)}
          className="mt-4 rounded-lg bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700"
        >
          Katıl
        </button>
      </div>
    </div>
  )
}
