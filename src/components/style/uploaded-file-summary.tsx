import { CheckIcon } from "@/components/ui/app-icons";
import { formatDuration } from "@/lib/reel-options/upload-rules";

// Small card showing the uploaded file at the top of "Pick a style".
export function UploadedFileSummary({ fileName, durationSeconds }: { fileName: string; durationSeconds: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3">
      <div className="h-14 w-11 shrink-0 rounded-lg bg-surface-raised" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{fileName}</p>
        <p className="text-sm text-ink-muted">{formatDuration(durationSeconds)} · uploaded</p>
      </div>
      <CheckIcon className="text-brand" />
    </div>
  );
}
