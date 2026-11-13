"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "@/components/ui/app-icons";
import { setPendingUpload } from "@/lib/demo-store/demo-project-store";
import { saveVideoToDisk } from "@/lib/local-files/save-video-to-disk";
import {
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_VIDEO_SECONDS,
  checkVideoFileBasics,
  readVideoDurationSeconds,
} from "@/lib/reel-options/upload-rules";

// Big dashed upload box on the Create screen (PRD F1).
// Checks type, size and length, saves the video on this PC, then moves on to "Pick a style".
export function VideoUploadCard() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyLabel, setBusyLabel] = useState<string | null>(null); // e.g. "Saving video… 40%"
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const basicError = checkVideoFileBasics(file);
    if (basicError) return setError(basicError);

    setBusyLabel("Checking video…");
    const objectUrl = URL.createObjectURL(file);
    try {
      const durationSeconds = await readVideoDurationSeconds(objectUrl);
      if (durationSeconds > MAX_VIDEO_SECONDS + 0.5) {
        setError("This video is longer than 3 minutes.");
        return;
      }
      const sourceVideoId = await saveVideoToDisk(file, (percent) => setBusyLabel(`Saving video… ${percent}%`));
      setPendingUpload({ fileName: file.name, durationSeconds, sourceVideoId });
      router.push("/create/style");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "We couldn't read this video.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setBusyLabel(null);
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  }

  const acceptList = ["video/mp4", "video/quicktime", "video/webm", ...ALLOWED_VIDEO_EXTENSIONS].join(",");

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center rounded-2xl border border-dashed px-5 py-7 text-center transition-colors ${
        isDragging ? "border-brand bg-brand-deep" : "border-line-strong"
      }`}
    >
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised text-brand">
        <UploadIcon size={26} />
      </span>
      <h2 className="text-lg font-semibold">Upload your video</h2>
      <p className="mt-1 text-xs text-ink-muted">MP4, MOV or WEBM · up to 3 min · 500 MB</p>

      <button
        type="button"
        disabled={busyLabel !== null}
        onClick={() => galleryInputRef.current?.click()}
        className="mt-6 w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-canvas disabled:opacity-60"
      >
        {busyLabel ?? "Choose video file"}
      </button>
      <p className="mt-3 text-xs text-ink-muted">or drag and drop a video here</p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-warn">
          {error}
        </p>
      )}

      <input
        ref={galleryInputRef}
        type="file"
        accept={acceptList}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </section>
  );
}
