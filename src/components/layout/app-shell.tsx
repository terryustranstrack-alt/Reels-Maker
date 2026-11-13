"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/layout/app-logo";
import { CreditsBadge } from "@/components/layout/credits-badge";
import { MAIN_NAVIGATION_LINKS, isActiveSection } from "@/components/layout/main-navigation-links";

// Frame for the main sections: header on top, bottom tab bar on phones, inline links on desktop.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
      <header className="flex items-center justify-between gap-3 px-5 pt-6 pb-4">
        <div className="flex items-center gap-8">
          <AppLogo />
          <nav className="hidden gap-6 md:flex">
            {MAIN_NAVIGATION_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm ${isActiveSection(pathname, href) ? "text-brand" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DemoModeBadge />
          <CreditsBadge />
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold">
            TW
          </span>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 md:pb-10">{children}</main>

      <MobileBottomNav pathname={pathname} />
    </div>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden">
      {MAIN_NAVIGATION_LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-1 py-3 text-[11px] ${
            isActiveSection(pathname, href) ? "text-brand" : "text-ink-muted"
          }`}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Reminds testers that AI generation is still simulated. */
function DemoModeBadge() {
  return (
    <span
      title="Demo mode: AI generation is simulated with sample content. Rendering is real."
      className="hidden rounded-full border border-warn/40 px-2.5 py-1 text-xs text-warn sm:inline"
    >
      Demo
    </span>
  );
}
