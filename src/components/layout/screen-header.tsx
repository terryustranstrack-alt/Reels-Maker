import Link from "next/link";
import { BackIcon, CloseIcon } from "@/components/ui/app-icons";

type ScreenHeaderProps = {
  title: string;
  backHref: string;
  icon?: "back" | "close";
  right?: React.ReactNode;
};

// Top bar of the step-by-step screens (style, generating, review, export).
export function ScreenHeader({ title, backHref, icon = "back", right }: ScreenHeaderProps) {
  const Icon = icon === "back" ? BackIcon : CloseIcon;
  return (
    <header className="flex items-center justify-between gap-3 py-5">
      <div className="flex items-center gap-4">
        <Link href={backHref} aria-label={icon === "back" ? "Back" : "Close"} className="-ml-1 p-1 text-ink">
          <Icon />
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {right}
    </header>
  );
}
