import {
  IconBell,
  IconBox,
  IconClipboardCheck,
  IconHome,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";

import { useMyProfile } from "@/lib/campus-data";
import { cn } from "@/lib/utils";

import { Logo, initials } from "./ui";

type NavKey = "home" | "claims" | "report" | "posts" | "profile";

function activeKey(pathname: string): NavKey {
  if (pathname.startsWith("/claims")) return "claims";
  if (pathname.startsWith("/posts")) return "posts";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/report")) return "report";
  return "home";
}

const NAV = [
  { key: "home", to: "/", label: "Home", desktopLabel: "Home", Icon: IconHome },
  { key: "claims", to: "/claims", label: "Claims", desktopLabel: "My claims", Icon: IconClipboardCheck },
  { key: "posts", to: "/posts", label: "Posts", desktopLabel: "My posts", Icon: IconBox },
  { key: "profile", to: "/profile", label: "Profile", desktopLabel: "Profile", Icon: IconUser },
] as const;

export function Sidebar() {
  const active = activeKey(useLocation().pathname);
  return (
    <aside className="hidden h-full w-[255px] overflow-y-auto shrink-0 flex-col gap-4 bg-brand px-4 py-6 lg:flex">
      <Link to="/" className="px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg">
        <Logo light />
      </Link>
      <Link
        to="/report"
        className="mt-2 flex h-[52px] items-center gap-3 rounded-xl bg-amber px-4 text-[17px] font-bold text-brand hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/60"
      >
        <IconPlus size={20} stroke={2.25} /> Report found item
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-2">
        {NAV.map(({ key, to, desktopLabel, Icon }) => (
          <Link
            key={key}
            to={to}
            aria-current={active === key ? "page" : undefined}
            className={cn(
              "flex h-12 items-center gap-4 rounded-xl px-4 text-[17px] font-bold text-white transition-colors hover:bg-brand-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber",
              active === key && "bg-brand-soft",
            )}
          >
            <Icon size={22} stroke={1.8} /> {desktopLabel}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const active = activeKey(useLocation().pathname);
  const item = (n: (typeof NAV)[number]) => (
    <Link
      key={n.key}
      to={n.to}
      aria-current={active === n.key ? "page" : undefined}
      className="flex min-w-[64px] flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded-xl"
    >
      <span className={cn("grid h-[42px] w-[72px] place-items-center rounded-full text-ink", active === n.key && "bg-amber")}>
        <n.Icon size={24} stroke={1.8} />
      </span>
      <span className={cn("text-[15px] text-muted-ink", active === n.key && "font-bold text-ink")}>{n.label}</span>
    </Link>
  );
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-around border-t border-divider bg-white px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 lg:hidden"
    >
      {item(NAV[0])}
      {item(NAV[1])}
      <Link to="/report" className="-mt-8 flex flex-col items-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link">
        <span className="grid size-[68px] place-items-center rounded-full border-4 border-white bg-amber text-ink shadow-sm">
          <IconPlus size={30} stroke={2} />
        </span>
        <span className="text-[15px] font-bold text-ink">Report</span>
      </Link>
      {item(NAV[2])}
      {item(NAV[3])}
    </nav>
  );
}

function TopActions() {
  const { data } = useMyProfile();
  const name = data?.profile?.fullName || data?.email || "";
  const hasNew = (data?.newClaims ?? 0) > 0;
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/posts"
        aria-label={hasNew ? "Notifications: new claims on your posts" : "Notifications"}
        className="relative grid size-11 place-items-center rounded-full bg-surface text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40 lg:size-11"
      >
        <IconBell size={22} stroke={1.8} />
        {hasNew ? <span className="absolute right-2.5 top-2 size-2.5 rounded-full bg-amber" /> : null}
      </Link>
      <Link
        to="/profile"
        aria-label="Profile"
        className="grid size-11 place-items-center rounded-full bg-brand text-[15px] font-bold text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40"
      >
        {initials(name)}
      </Link>
    </div>
  );
}

export function AppPage({
  title,
  brandHeader = false,
  children,
}: {
  title: string;
  brandHeader?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="hidden h-[88px] items-center justify-between border-b border-divider px-10 lg:flex">
        <h1 className="text-[28px] font-bold text-ink">{title}</h1>
        <TopActions />
      </header>
      {brandHeader ? (
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Link to="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link">
            <Logo />
          </Link>
          <TopActions />
        </div>
      ) : null}
      <div className="px-5 py-5 lg:max-w-[1030px] lg:px-10 lg:py-8">{children}</div>
    </>
  );
}
