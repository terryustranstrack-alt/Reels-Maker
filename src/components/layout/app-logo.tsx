import Link from "next/link";

// "racik" in white + "reels" in mint, as in the mockup. The product name is still a placeholder (PRD).
export function AppLogo() {
  return (
    <Link href="/" className="text-xl font-bold tracking-tight">
      racik<span className="text-brand">reels</span>
    </Link>
  );
}
