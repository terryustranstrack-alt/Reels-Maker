"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "@/components/ui/app-icons";
import { setPendingUpload } from "@/lib/demo-store/demo-project-store";
import {
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_VIDEO_SECONDS,
  checkVideoFileBasics,
  readVideoDurationSeconds,
} from "@/lib/reel-options/upload-rules";

// Big dashed upload box on the Create screen (PRD F1).
// Checks type, size and length in the browser, then moves on to "Pick a style".
export function VideoUploadCard() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const basicError = checkVideoFileBasics(file);
    if (basicError) return setError(basicError);

    setIsChecking(true);
    const objectUrl = URL.createObjectURL(file);
    try {
      const durationSeconds = await readVideoDurationSeconds(objectUrl);
      if (durationSeconds > MAX_VIDEO_SECONDS + 0.5) {
        URL.revokeObjectURL(objectUrl);
        setError("This video is longer than 3 minutes.");
        return;
      }
      setPendingUpload({ fileName: file.name, durationSeconds, objectUrl });
      router.push("/create/style");
    } catch (readError) {
      URL.revokeObjectURL(objectUrl);
      setError(readError instanceof Error ? readError.message : "We couldn't read this video.");
    } finally {
      setIsChecking(false);
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
        disabled={isChecking}
        onClick={() => galleryInputRef.current?.click()}
        className="mt-6 w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-canvas disabled:opacity-60"
      >
        {isChecking ? "Checking video…" : "Choose from gallery"}
      </button>
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="mt-4 text-sm text-ink-soft underline underline-offset-4"
      >
        Record new video
      </button>
      <p className="mt-3 hidden text-xs text-ink-muted md:block">or drag and drop a file here</p>

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
      {/* `capture` opens the phone camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
        capture="user"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </section>
  );
}
