import React, { useMemo, useState } from "react";
import SoftProgress from "../components/progressBar";
import {
  Calendar,
  MapPin,
  Users,
  Trash2,
  Bike,
  Dumbbell,
  Handshake,
  Camera,
  Fish,
  MessageCircle,
  Cookie,
  Waves,
  ChevronRight,
  User,
} from "lucide-react";

/* ——— Tipler ——— */
type EventItem = {
  id: string;
  title: string;
  startsAt: string; // ISO
  location: string;
  category: string[];
  capacity: number;
  attending: number;
};

type BadgeCardStatus = "won" | "progress";
type BadgeCardItem = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: BadgeCardStatus;
  wonDate?: string; // DD.MM.YYYY
  progress?: number; // 0..100
  tone?: "green" | "amber";
};

/* ——— Sahte veriler ——— */
const user = { name: "ADI SOYADI", eventCount: 12, badgeCount: 8 };

const events: EventItem[] = [
  {
    id: "swim",
    title: "Yüzme Antrenmanı",
    startsAt: "2025-08-21T07:30:00",
    location: "Havuzlu Bina",
    category: ["Spor", "Yüzme"],
    capacity: 16,
    attending: 12,
  },
  {
    id: "bbq",
    title: "Mangal Etkinliği",
    startsAt: "2025-08-25T17:30:00",
    location: "Mar-Tek",
    category: ["Yemek", "Açık Hava"],
    capacity: 20,
    attending: 11,
  },
  {
    id: "bike",
    title: "Bisiklet Sürme",
    startsAt: "2025-08-28T07:30:00",
    location: "TÜBİTAK",
    category: ["Spor", "Bisiklet"],
    capacity: 50,
    attending: 27,
  },
];

const badgeItems: BadgeCardItem[] = [
  {
    id: "bike-10x",
    title: "10X Bisiklet Sürüşü",
    icon: Bike,
    status: "won",
    wonDate: "02.06.2025",
    tone: "green",
  },
  {
    id: "swim-10x",
    title: "10X Yüzme",
    icon: Waves,
    status: "progress",
    progress: 75,
    tone: "green",
  },
];

/* ——— Yardımcılar ——— */
const formatDateTR = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const percent = (a: number, c: number) =>
  Math.max(0, Math.min(100, Math.round((a / c) * 100)));

/* ——— Küçük UI atomları ——— */
function PastelChip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs ring-1 cursor-default ${className}`}
    >
      {children}
    </span>
  );
}

/* ——— Etkinlik kartı ——— */
function EventCard({ ev }: { ev: EventItem }) {
  const p = percent(ev.attending, ev.capacity);
  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-3 flex items-start justify-between gap-6">
        <h3 className="text-lg font-semibold text-slate-800">{ev.title}</h3>
        <button
          className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Sil"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          {formatDateTR(ev.startsAt)}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          {ev.location}
        </span>
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          {ev.attending}/{ev.capacity}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {ev.category.map((c) => (
          <PastelChip
            key={c}
            className="bg-sky-100 text-sky-800 ring-sky-200"
          >
            {c}
          </PastelChip>
        ))}
      </div>

      <SoftProgress value={p} />
    </div>
  );
}

/* ——— Rozet kartı ——— */
function BadgeCard({ item }: { item: BadgeCardItem }) {
  const Icon = item.icon;
  const isWon = item.status === "won";

  const statusPill =
    item.status === "won" ? (
      <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white cursor-default">
        Kazanıldı
      </span>
    ) : (
      <span className="rounded-md bg-amber-300/70 px-2 py-0.5 text-[11px] font-semibold text-amber-900 cursor-default">
        Devam
      </span>
    );

  return (
    <div className="relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/10">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">
          {item.title}
        </div>
        {statusPill}
      </div>

      {isWon ? (
        <div className="text-xs text-slate-600">
          {item.wonDate} tarihinde kazanıldı
        </div>
      ) : (
        <div className="mt-1">
          <SoftProgress value={item.progress ?? 0} />
        </div>
      )}

      {/* Sağ altta ikon */}
      <div className="absolute -right-3 -bottom-3 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-900/10">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

/* ——— Rozetler paneli ——— */
function BadgesPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {badgeItems.map((b) => (
          <BadgeCard key={b.id} item={b} />
        ))}
      </div>
    </div>
  );
}

/* ——— İlgi alanları paneli ——— */
function InterestsPanel() {
  const [selected, setSelected] = useState<string[]>(["Bisiklet Sürme", "Yüzme"]);
  const [pool] = useState<string[]>(["Basketbol", "Koşu", "Yemek", "Doğa", "Fotoğraf"]);
  const [choice, setChoice] = useState<string>("Basketbol");

  const addInterest = () => {
    if (choice && !selected.includes(choice)) {
      setSelected((s) => [...s, choice]);
    }
  };
  const removeInterest = (v: string) =>
    setSelected((s) => s.filter((x) => x !== v));

  const recommended = useMemo(() => {
    const k = selected.map((s) => s.toLowerCase());
    return events
      .filter(
        (e) =>
          k.some((kw) => e.title.toLowerCase().includes(kw)) ||
          e.category.some((c) => k.includes(c.toLowerCase()))
      )
      .map((e) => e.title);
  }, [selected]);

  return (
    <div className="space-y-4">
      {/* Seçili ilgi alanları */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/10">
        <div className="mb-3 text-sm font-semibold text-slate-800">İLGİ ALANLARI</div>
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              key={tag}
              onClick={() => removeInterest(tag)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-900 ring-1 ring-indigo-200 hover:bg-indigo-200"
              title="Kaldır"
            >
              {tag} <span className="text-indigo-900/80">×</span>
            </button>
          ))}
          {selected.length === 0 && (
            <span className="text-xs text-slate-500">
              Henüz ilgi alanı eklemediniz.
            </span>
          )}
        </div>
      </div>

      {/* Ekleme satırı */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row">
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="h-10 flex-1 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {pool.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={addInterest}
          className="h-10 cursor-pointer rounded-md bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          EKLE
        </button>
      </div>

      {/* Öneriler */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/10">
        <div className="mb-3 text-sm font-semibold text-slate-800">
          İlgi Alanlarına Göre Etkinlikler
        </div>
        <div className="space-y-2">
          {recommended.length ? (
            recommended.map((t) => (
              <div
                key={t}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <span>{t}</span>
                <button className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800">
                  İncele <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">Öneri bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ——— Sekmeler ——— */
type TabKey = "etkinlikler" | "rozetler" | "ilgi";

function Tabs() {
  const [tab, setTab] = useState<TabKey>("etkinlikler");
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex gap-2 border-b border-slate-100 p-2">
        {[
          { k: "etkinlikler", t: "Etkinlikler" },
          { k: "rozetler", t: "Rozetler" },
          { k: "ilgi", t: "İlgi Alanları" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as TabKey)}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium ${
              tab === t.k
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.t}
          </button>
        ))}
      </div>

      <div className="p-5 md:p-6">
        {tab === "etkinlikler" && (
          <div className="space-y-5 md:space-y-6">
            {events.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
        {tab === "rozetler" && <BadgesPanel />}
        {tab === "ilgi" && <InterestsPanel />}
      </div>
    </div>
  );
}

/* ——— Sayfa ——— */
export default function ProfileDashboard() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Profil */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50">
              <User className="h-10 w-10" />
            </div>
            <div>
              <div className="mb-1 text-lg font-semibold text-slate-800">
                {user.name}
              </div>
              <div className="text-sm text-slate-600">
                <span className="mr-4">{user.eventCount} etkinlik</span>
                <span>{user.badgeCount} rozet</span>
              </div>
            </div>
          </div>

          {/* Küçük rozet vitrin */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[Bike, Dumbbell, Handshake, Camera, Fish, MessageCircle, Cookie].map(
              (Icon, i) => (
                <div
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-900/5"
                >
                  <Icon className="h-5 w-5" />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Ana grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Tabs />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <UpcomingCard />
          <BadgeProgressCard />
        </div>
      </div>
    </div>
  );
}

/* ——— Sağ panel kartları ——— */
function UpcomingCard() {
  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => new Date(e.startsAt).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      )[0];
  }, []);
  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm ring-1 ring-slate-900/5">
      <h4 className="mb-2 text-sm font-semibold text-slate-800">
        Yaklaşan Etkinliklerim
      </h4>
      {upcoming ? (
        <>
          <div className="text-sm text-slate-700">{upcoming.title}</div>
          <div className="mb-3 text-xs text-slate-500">
            {formatDateTR(upcoming.startsAt)}
          </div>
          <button className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            Detaylar
          </button>
        </>
      ) : (
        <div className="text-sm text-slate-600">Yaklaşan etkinlik yok.</div>
      )}
    </div>
  );
}

function BadgeProgressCard() {
  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm ring-1 ring-slate-900/5">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">
        Rozet İlerlemesi
      </h4>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>3X Yüzme</span>
        <span>Rozete Kalan: 1</span>
      </div>
      <SoftProgress value={75} />
    </div>
  );
}
