import type { CaptionStyleId } from "@/lib/reel-options/reel-style-options";
import type { CaptionCue } from "@/lib/reel-project-types";

// Hook headline (top) and animated caption (bottom) drawn over the preview.
// These are previews only; the final burn-in happens in the render worker.

export function HookOverlay({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="absolute inset-x-4 top-[6%] text-center">
      <span className="box-decoration-clone bg-white px-2 py-0.5 text-[clamp(13px,4.2cqw,20px)] font-bold uppercase leading-[1.6] text-canvas">
        {text}
      </span>
    </div>
  );
}

const CAPTION_TEXT_CLASSES: Record<CaptionStyleId, string> = {
  "bold-hype": "font-bold uppercase text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]",
  "clean-corporate": "font-semibold text-white bg-navy/90 rounded-md px-2 py-1",
  "soft-lifestyle": "italic text-white [text-shadow:0_1px_4px_rgba(0,0,0,.7)]",
  "edu-explainer": "font-bold text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]",
};

const HIGHLIGHT_CLASSES: Record<CaptionStyleId, string> = {
  "bold-hype": "bg-brand text-canvas px-1",
  "clean-corporate": "text-info",
  "soft-lifestyle": "text-brand",
  "edu-explainer": "text-warn",
};

export function CaptionOverlay({ cue, captionStyle }: { cue: CaptionCue | undefined; captionStyle: CaptionStyleId }) {
  if (!cue) return null;
  return (
    <div className="absolute inset-x-4 bottom-[18%] text-center">
      <span className={`inline-block text-[clamp(14px,5cqw,22px)] leading-tight ${CAPTION_TEXT_CLASSES[captionStyle]}`}>
        {cue.text.split(" ").map((word, index) => (
          <span key={index}>
            {index > 0 && " "}
            <HighlightedWord word={word} cue={cue} highlightClass={HIGHLIGHT_CLASSES[captionStyle]} />
          </span>
        ))}
      </span>
    </div>
  );
}

/** Colours the cue's keyword (PRD F8: keyword highlight). */
function HighlightedWord({ word, cue, highlightClass }: { word: string; cue: CaptionCue; highlightClass: string }) {
  const isKeyword = cue.highlightWord !== null && word.toLowerCase().startsWith(cue.highlightWord.toLowerCase());
  return isKeyword ? <span className={highlightClass}>{word}</span> : <>{word}</>;
}

/** The caption that should be on screen at `timeSeconds`. */
export function captionAtTime(captions: CaptionCue[], timeSeconds: number): CaptionCue | undefined {
  return captions.find((cue) => timeSeconds >= cue.startSeconds && timeSeconds < cue.endSeconds);
}
