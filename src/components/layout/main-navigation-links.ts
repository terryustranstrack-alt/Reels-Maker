import { GridIcon, PaletteIcon, PlusIcon, UserIcon } from "@/components/ui/app-icons";

// The four main sections, shared by the mobile bottom bar and the desktop header.
export const MAIN_NAVIGATION_LINKS = [
  { href: "/", label: "Create", Icon: PlusIcon },
  { href: "/projects", label: "Projects", Icon: GridIcon },
  { href: "/brand-kit", label: "Brand kit", Icon: PaletteIcon },
  { href: "/account", label: "Account", Icon: UserIcon },
];

/** True when `pathname` belongs to the section at `href`. */
export function isActiveSection(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
