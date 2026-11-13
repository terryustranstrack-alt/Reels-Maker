// Small line icons used across the app (same stroke style as the mockup).

type IconProps = { size?: number; className?: string };

function IconFrame({ size = 22, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (p: IconProps) => <IconFrame {...p}><path d="M12 5v14M5 12h14" /></IconFrame>;
export const GridIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </IconFrame>
);
export const PaletteIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="9" cy="10" r="1.2" />
    <circle cx="14.5" cy="9" r="1.2" />
    <circle cx="15" cy="14" r="1.2" />
  </IconFrame>
);
export const UserIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </IconFrame>
);
export const UploadIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
  </IconFrame>
);
export const DownloadIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
  </IconFrame>
);
export const BackIcon = (p: IconProps) => <IconFrame {...p}><path d="M15 5l-7 7 7 7" /></IconFrame>;
export const CloseIcon = (p: IconProps) => <IconFrame {...p}><path d="M6 6l12 12M18 6L6 18" /></IconFrame>;
export const CheckIcon = (p: IconProps) => <IconFrame {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></IconFrame>;
export const SparkleIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </IconFrame>
);
export const CreditIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 15.5v-7M9 11l3-3 3 3" />
  </IconFrame>
);
export const PlayIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
);
export const PauseIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <rect x="6.5" y="5" width="4" height="14" rx="1" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" />
  </svg>
);
export const TrashIcon = (p: IconProps) => (
  <IconFrame {...p}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
  </IconFrame>
);
