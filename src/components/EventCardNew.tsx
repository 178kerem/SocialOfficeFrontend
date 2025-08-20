import { Calendar, Clock, MapPin, Users } from "lucide-react";

export type EventItem = {
  etkinlik_id: number;
  ad: string;
  konu: string;
  tarih: string; // "YYYY-MM-DD"
  saat: string; // "HH:mm"
  konum: string;
  kategori: string; // "Sosyal" | "Spor" | ...
  buyukluk: "Birim" | "Departman" | "Kurumsal";
  kota: number;
  imageUrl?: string;
};

type Props = {
  event: EventItem;
  className?: string;
  onJoin?: (event: EventItem) => void;
};

const scopeTone: Record<EventItem["buyukluk"], string> = {
  Birim: "bg-sky-100 text-sky-800 ring-sky-200",
  Departman: "bg-violet-100 text-violet-800 ring-violet-200",
  Kurumsal: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function EventCard({ event, className, onJoin }: Props) {
  const date = new Date(event.tarih + "T00:00:00");
  const dateStr = date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition-all duration-200 hover:shadow-md",
        className ?? "",
      ].join(" ")}
    >
      {/* Görsel / üst bant */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.ad}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}

        {/* scope rozet */}
        <span
          className={[
            "absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
            scopeTone[event.buyukluk],
          ].join(" ")}
        >
          {event.buyukluk}
        </span>
      </div>

      {/* İçerik */}
      <div className="p-4">
        {/* Kategori rozeti + Başlık */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                {event.kategori}
              </span>
            </div>
            <h3 className="truncate text-base font-semibold text-slate-900">
              {event.ad}
            </h3>
          </div>
        </div>

        {/* Bilgiler */}
        <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm text-slate-700">
          <li className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{dateStr}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{event.saat}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{event.konum}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{event.kota} kişi</span>
          </li>
        </ul>

        {/* Açıklama */}
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{event.konu}</p>

        {/* CTA */}
        <button
          onClick={() => onJoin?.(event)}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label={`${event.ad} etkinliğine katıl`}
        >
          Katıl
        </button>
      </div>
    </div>
  );
}
