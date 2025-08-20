import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Brush, Users, Lightbulb, GitBranch, Bell,
  Calendar as CalendarIcon, Settings, User2, type LucideIcon,
} from "lucide-react"

type NavItem = { id: string; label: string; icon: LucideIcon; href?: string }
type HoverExpandNavProps = { activeId?: string; onSelect?: (id: string) => void; fixed?: boolean }

const primaryItems: NavItem[] = [
  { id: "design",  label: "Design",        icon: Brush,        href: "/design" },
  { id: "teams",   label: "Teams",         icon: Users,        href: "/events" },    // 👉 events
  { id: "ideas",   label: "Ideas",         icon: Lightbulb,    href: "/ideas" },
  { id: "graph",   label: "Graph",         icon: GitBranch,    href: "/graph" },
  { id: "alerts",  label: "Notifications", icon: Bell,         href: "/notifications" },
  { id: "calendar",label: "Calendar",      icon: CalendarIcon, href: "/calendar" },  // 👉 calendar
]
const bottomItems: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  { id: "profile",  label: "Profile",  icon: User2,    href: "/profile"  },
]

export default function Navbar({ activeId, onSelect, fixed = true }: HoverExpandNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const startActive = useMemo(() => {
    const hit = [...primaryItems, ...bottomItems].find(it => it.href === location.pathname)
    return activeId ?? hit?.id ?? "design"
  }, [activeId, location.pathname])

  const [internalActive, setInternalActive] = useState<string>(startActive)
  useEffect(() => { setInternalActive(startActive) }, [startActive])

  const handleSelect = (item: NavItem) => {
    setInternalActive(item.id)
    onSelect?.(item.id)
    if (item.href) navigate(item.href)
  }
  const isActive = (id: string) => (activeId ? activeId === id : internalActive === id)

  return (
    <nav aria-label="Primary" className={["group/nav peer/nav z-40 h-screen", fixed ? "fixed left-0 top-0" : ""].join(" ")}>
      <div className="flex h-full w-16 transition-[width] duration-300 ease-in-out group-hover/nav:w-64 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-slate-200 shadow-2xl ring-1 ring-white/10">
        <div className="flex w-full flex-col px-2 py-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <Brush className="h-5 w-5" aria-hidden />
            </div>
            <span className="translate-x-2 text-sm font-semibold tracking-wide opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 transition-all duration-300">
              Studio
            </span>
          </div>

          <ul className="flex-1 space-y-1">
            {primaryItems.map((item) => (
              <NavButton key={item.id} item={item} active={isActive(item.id)} onClick={() => handleSelect(item)} />
            ))}
          </ul>

          <div className="my-3 h-px bg-white/10" />

          <ul className="space-y-1">
            {bottomItems.map((item) => (
              <NavButton key={item.id} item={item} active={isActive(item.id)} onClick={() => handleSelect(item)} />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active?: boolean; onClick?: () => void }) {
  const Icon = item.icon
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        className={[
          "peer flex w-full items-center gap-3 rounded-xl px-3 py-2 outline-none",
          "transition-colors duration-200",
          active ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/10 focus:bg-white/10 active:bg-white/15",
        ].join(" ")}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="pointer-events-none whitespace-nowrap text-sm translate-x-2 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 transition-all duration-300">
          {item.label}
        </span>
      </button>

      <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-100 shadow-lg ring-1 ring-white/10 opacity-0 transition-opacity duration-200 peer-hover:opacity-100 group-hover/nav:hidden">
        {item.label}
      </span>
    </li>
  )
}
