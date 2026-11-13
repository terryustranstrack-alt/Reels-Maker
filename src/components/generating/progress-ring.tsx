// Circular percentage ring at the top of "Making your reel".

export function ProgressRing({ percent, caption }: { percent: number; caption: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="10" className="stroke-surface-raised" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="stroke-brand transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{percent}%</span>
        <span className="mt-1 text-xs text-ink-muted">{caption}</span>
      </div>
    </div>
  );
}
