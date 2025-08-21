// src/components/navbar.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Lightbulb,
  ClipboardList,
  ListChecks,
  Bell,
  User2,
  Settings,
  ClipboardCheck,
  Shield,
  type LucideIcon,
} from "lucide-react";
import logo from "../assets/logo.png"

export type NavItem = { id: string; label: string; icon: LucideIcon; href: string };
export type HoverExpandNavProps = {
  activeId?: string;
  onSelect?: (id: string) => void;
  fixed?: boolean;
  brandClass?: string; // örn: "from-indigo-600 to-indigo-500"
};

const primaryItems: NavItem[] = [
  { id: "events",       label: "Etkinlikler",        icon: CalendarDays,  href: "/events" },
  { id: "calendar",     label: "Takvim",             icon: CalendarIcon,  href: "/calendar" },
  { id: "requestsEvt",  label: "Etkinlik Talepleri", icon: ListChecks,    href: "/requests" },
  { id: "talepler",     label: "Talepler",           icon: ClipboardList, href: "/talepler" },
  { id: "fikirler",     label: "Fikirler",           icon: Lightbulb,     href: "/fikirler" },
  { id: "notifications",label: "Bildirimler",        icon: Bell,          href: "/notifications" },
];

const adminItems: NavItem[] = [
  { id: "admin-ideas",     label: "Admin: Fikir Seçimi",   icon: Shield,         href: "/admin/fikir-secim" },
  { id: "admin-approvals", label: "Admin: Onaylar",        icon: ClipboardCheck, href: "/admin/talep-etkinlik-onay" },
];

const bottomItems: NavItem[] = [
  { id: "profile",  label: "Profil",  icon: User2,     href: "/profile" },
  { id: "settings", label: "Ayarlar", icon: Settings,  href: "/ayarlar" },
];

export default function Navbar({
  activeId,
  onSelect,
  fixed = true,
  brandClass = "from-indigo-600 to-indigo-500",
}: HoverExpandNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // path-prefix aktiflik (örn. /events/... da Etkinlikler’i aktif yapar)
  const isPathActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const startActive = useMemo(() => {
    const hit = [...primaryItems, ...adminItems, ...bottomItems].find((it) => isPathActive(it.href));
    return activeId ?? hit?.id ?? primaryItems[0].id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, location.pathname]);

  const [internalActive, setInternalActive] = useState<string>(startActive);
  useEffect(() => setInternalActive(startActive), [startActive]);

  const handleSelect = (item: NavItem) => {
    setInternalActive(item.id);
    onSelect?.(item.id);
    navigate(item.href);
  };

  const isActive = (item: NavItem) =>
    activeId ? activeId === item.id : internalActive === item.id || isPathActive(item.href);

  return (
    <nav
      aria-label="Birincil"
      className={["group/nav peer/nav z-40 h-screen", fixed ? "fixed left-0 top-0" : ""].join(" ")}
    >
      {/* Kasa */}
      <div className="flex h-full w-16 group-hover/nav:w-64 transition-[width] duration-500 ease-in-out bg-slate-950/95 text-slate-100 shadow-xl ring-1 ring-white/10">
        <div className="flex w-full flex-col px-2 py-4">
          {/* Logo / Marka */}
          <div className="mb-5 px-2">
            <div className="flex w-full items-center gap-3 justify-start transition-all duration-500 ease-out group-hover/nav:justify-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl overflow-hidden">
                <img
                  src={logo}
                  alt="SosyalOfis Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <span className="hidden text-sm font-semibold tracking-wide transition-all duration-500 group-hover/nav:inline group-hover/nav:translate-x-0 group-hover/nav:opacity-100 translate-x-2 opacity-0">
              </span>
            </div>
          </div>
          {/* Üst gruplar */}
          <ul className="flex-1 space-y-1">
            {primaryItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={isActive(item)}
                onClick={() => handleSelect(item)}
                brandClass={brandClass}
                variant="default"
              />
            ))}

            {/* Admin başlığı (expand olunca görünür) */}
            <li className="mt-3 px-3">
              <span className="pointer-events-none hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 group-hover/nav:inline">
                Yönetim
              </span>
            </li>

            {/* Admin öğeleri — farklı arka plan */}
            {adminItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={isActive(item)}
                onClick={() => handleSelect(item)}
                brandClass={brandClass}
                variant="admin"
              />
            ))}
          </ul>

          <div className="my-3 h-px bg-white/10" />

          {/* Alt gruplar */}
          <ul className="space-y-1">
            {bottomItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={isActive(item)}
                onClick={() => handleSelect(item)}
                brandClass={brandClass}
                variant="default"
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function NavButton({
  item,
  active,
  onClick,
  brandClass,
  variant = "default",
}: {
  item: NavItem;
  active?: boolean;
  onClick?: () => void;
  brandClass: string;
  variant?: "default" | "admin";
}) {
  const Icon = item.icon;

  // Stil haritası: admin için farklı arka plan ve şerit gradyanı
  const styles =
    variant === "admin"
      ? {
          base: "hover:bg-amber-400/10 focus:bg-amber-400/10 active:bg-amber-400/15",
          active: "bg-amber-400/15 ring-1 ring-amber-300/20",
          stripe: "from-amber-400 to-orange-500",
          tooltipBg: "bg-amber-900/95",
        }
      : {
          base: "hover:bg-white/10 focus:bg-white/10 active:bg-white/15",
          active: "bg-white/10 ring-1 ring-white/15",
          stripe: brandClass,
          tooltipBg: "bg-slate-900/95",
        };

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        title={item.label}
        aria-current={active ? "page" : undefined}
        className={[
          "peer flex w-full items-center gap-3 rounded-xl px-3 py-2 outline-none transition-colors duration-200",
          active ? styles.active : styles.base,
        ].join(" ")}
      >
        {/* Sol vurgu şeridi */}
        <span
          aria-hidden
          className={[
            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b",
            active ? styles.stripe : "opacity-0",
          ].join(" ")}
        />
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="pointer-events-none whitespace-nowrap text-sm translate-x-2 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 transition-all duration-300">
          {item.label}
        </span>
      </button>

      {/* Tooltip: dar iken görünür, genişleyince gizlenir */}
      <span
        className={[
          "pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-100 shadow-lg ring-1 ring-white/10 opacity-0 transition-opacity duration-200 peer-hover:opacity-100 group-hover/nav:hidden",
          styles.tooltipBg,
        ].join(" ")}
      >
        {item.label}
      </span>
    </li>
  );
}
