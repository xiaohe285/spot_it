"use client";

import {
  AlertCircle,
  Braces,
  CheckCircle2,
  ImageIcon,
  MousePointer2,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { MouseEvent, useMemo, useState } from "react";

type Difference = {
  x: number;
  y: number;
  radius: number;
};

type ImageState = {
  status: "idle" | "ready" | "warning" | "error";
  message: string;
};

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

const difficultyStars: Record<Difficulty, number> = {
  Easy: 2,
  Medium: 3,
  Hard: 4,
  Expert: 5,
};

const sampleDifferences: Difference[] = [
  { x: 75, y: 48, radius: 10 },
  { x: 50, y: 84, radius: 10 },
  { x: 9, y: 74, radius: 5 },
  { x: 19, y: 11, radius: 5 },
];

const initialJson = JSON.stringify(sampleDifferences, null, 2);

function parseDifferences(value: string):
  | { differences: Difference[]; error: null }
  | { differences: null; error: string } {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return { differences: null, error: "The root value must be an array." };
    }

    for (let index = 0; index < parsed.length; index += 1) {
      const item = parsed[index];
      if (!item || typeof item !== "object") {
        return { differences: null, error: `Point ${index + 1} must be an object.` };
      }

      const point = item as Record<string, unknown>;
      const values = [point.x, point.y, point.radius];
      if (values.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))) {
        return {
          differences: null,
          error: `Point ${index + 1} needs numeric x, y, and radius values.`,
        };
      }

      if ((point.x as number) < 0 || (point.x as number) > 100) {
        return { differences: null, error: `Point ${index + 1}: x must be between 0 and 100.` };
      }

      if ((point.y as number) < 0 || (point.y as number) > 100) {
        return { differences: null, error: `Point ${index + 1}: y must be between 0 and 100.` };
      }

      if ((point.radius as number) <= 0 || (point.radius as number) > 50) {
        return { differences: null, error: `Point ${index + 1}: radius must be greater than 0 and at most 50.` };
      }
    }

    return { differences: parsed as Difference[], error: null };
  } catch {
    return { differences: null, error: "Enter valid JSON before generating the answer key." };
  }
}

function roundCoordinate(value: number) {
  return Math.round(value * 10) / 10;
}

function ImageStatusMessage({ state }: { state: ImageState }) {
  if (state.status === "idle") return null;

  const isReady = state.status === "ready";
  return (
    <p
      className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
        isReady
          ? "text-emerald-700"
          : state.status === "warning"
            ? "text-amber-700"
            : "text-red-600"
      }`}
    >
      {isReady ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {state.message}
    </p>
  );
}

function Marker({ difference, printable = false }: { difference: Difference; printable?: boolean }) {
  return (
    <span
      className={printable ? "level-editor-marker level-editor-marker--print" : "level-editor-marker"}
      style={{
        left: `${difference.x}%`,
        top: `${difference.y}%`,
        width: `${difference.radius * 2}%`,
      }}
      aria-hidden="true"
    />
  );
}

type PreviewImageProps = {
  src: string;
  alt: string;
  differences?: Difference[];
  interactive?: boolean;
  onAddDifference?: (x: number, y: number) => void;
  onImageLoad?: (width: number, height: number) => void;
  onImageError?: () => void;
};

function PreviewImage({
  src,
  alt,
  differences = [],
  interactive = false,
  onAddDifference,
  onImageLoad,
  onImageError,
}: PreviewImageProps) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive || !src || !onAddDifference) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    onAddDifference(
      roundCoordinate(((event.clientX - bounds.left) / bounds.width) * 100),
      roundCoordinate(((event.clientY - bounds.top) / bounds.height) * 100),
    );
  };

  return (
    <div
      className={`level-editor-image-frame ${interactive && src ? "cursor-crosshair" : ""}`}
      onClick={handleClick}
    >
      {src ? (
        // A plain img is intentional here: editor URLs are user-provided at runtime.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onLoad={(event) => onImageLoad?.(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
          onError={onImageError}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center text-slate-400">
          <ImageIcon size={34} strokeWidth={1.5} />
          <span className="text-sm font-medium">Enter an image URL to preview</span>
        </div>
      )}
      {differences.map((difference, index) => (
        <Marker key={`${difference.x}-${difference.y}-${difference.radius}-${index}`} difference={difference} />
      ))}
    </div>
  );
}

function PrintableImage({ src, alt, differences = [] }: Omit<PreviewImageProps, "interactive">) {
  return (
    <div className="level-editor-sheet-image">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} />
      ) : (
        <div className="level-editor-sheet-placeholder">Image URL not set</div>
      )}
      {differences.map((difference, index) => (
        <Marker
          key={`${difference.x}-${difference.y}-${difference.radius}-${index}`}
          difference={difference}
          printable
        />
      ))}
    </div>
  );
}

function PrintableHeader({
  count,
  difficulty,
  answerKey,
}: {
  count: number;
  difficulty: Difficulty;
  answerKey: boolean;
}) {
  const filledStars = difficultyStars[difficulty];
  const differenceLabel = count === 1 ? "Difference" : "Differences";

  return (
    <div className="level-editor-sheet-header">
      <div className="level-editor-sheet-header-row">
        <div className="level-editor-print-logo" aria-label="SpotDiffs">
          SpotDiffs
        </div>
        <div className="level-editor-print-ribbon">
          <span aria-hidden="true">★</span>
          <span>Fun &amp; relaxing puzzles</span>
          <span aria-hidden="true">☆</span>
        </div>
        <div className="level-editor-difficulty-card">
          <span className="level-editor-difficulty-label">Difficulty</span>
          <span className="level-editor-difficulty-stars" aria-label={`${filledStars} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < filledStars ? "is-filled" : ""} aria-hidden="true">
                {index < filledStars ? "★" : "☆"}
              </span>
            ))}
          </span>
          <span className="level-editor-difficulty-value">{difficulty}</span>
        </div>
      </div>

      <h2 className="level-editor-sheet-title">
        {answerKey ? (
          <span className="level-editor-title-accent">Answer Key</span>
        ) : (
          <>
            Spot the <span className="level-editor-title-accent">{count}</span> {differenceLabel}
          </>
        )}
      </h2>
      <div className="level-editor-sheet-prompt">
        <span aria-hidden="true" />
        <p>{answerKey ? `All ${count} ${differenceLabel.toLowerCase()} revealed` : "Can you find them all?"}</p>
        <span aria-hidden="true" />
      </div>
    </div>
  );
}

function PrintableFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="level-editor-sheet-footer">
      <div>
        <strong>Enjoyed the puzzle?</strong>
        <span>
          Find more at <b>spotdiffs.com</b>
        </span>
      </div>
      <div className="level-editor-sheet-copyright">
        <strong>© {currentYear} SpotDiffs.com</strong>
        <span>All rights reserved.</span>
      </div>
      <div className="level-editor-sheet-share">
        <strong>Share your fun!</strong>
        <span className="level-editor-social-icons" aria-label="Facebook, Instagram, and Pinterest">
          <i aria-hidden="true">f</i>
          <i aria-hidden="true">◎</i>
          <i aria-hidden="true">p</i>
        </span>
      </div>
    </div>
  );
}

function PrintableSheet({
  imageUrl1,
  imageUrl2,
  differences,
  difficulty,
  answerKey = false,
}: {
  imageUrl1: string;
  imageUrl2: string;
  differences: Difference[];
  difficulty: Difficulty;
  answerKey?: boolean;
}) {
  const count = differences.length;

  return (
    <section className="level-editor-sheet" aria-label={answerKey ? "Printable answer page" : "Printable puzzle page"}>
      <PrintableHeader count={count} difficulty={difficulty} answerKey={answerKey} />
      <div className="level-editor-sheet-grid">
        <PrintableImage
          src={imageUrl1}
          alt={answerKey ? "First puzzle image with answers marked" : "First puzzle image"}
          differences={answerKey ? differences : []}
        />
        <PrintableImage
          src={imageUrl2}
          alt={answerKey ? "Second puzzle image with answers marked" : "Second puzzle image"}
          differences={answerKey ? differences : []}
        />
      </div>
      <PrintableFooter />
    </section>
  );
}

export default function LevelEditor() {
  const [imageUrl1, setImageUrl1] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");
  const [jsonValue, setJsonValue] = useState(initialJson);
  const [defaultRadius, setDefaultRadius] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [imageStates, setImageStates] = useState<[ImageState, ImageState]>([
    { status: "idle", message: "" },
    { status: "idle", message: "" },
  ]);

  const parsed = useMemo(() => parseDifferences(jsonValue), [jsonValue]);
  const differences = parsed.differences ?? [];

  const updateImageUrl = (index: 0 | 1, value: string) => {
    if (index === 0) setImageUrl1(value);
    else setImageUrl2(value);

    setImageStates((current) => {
      const next: [ImageState, ImageState] = [...current];
      next[index] = { status: "idle", message: "" };
      return next;
    });
  };

  const updateImageState = (index: 0 | 1, width?: number, height?: number) => {
    const nextState: ImageState =
      width === undefined || height === undefined
        ? { status: "error", message: "The image could not be loaded. Check the URL and access permissions." }
        : width === 2048 && height === 2048
          ? { status: "ready", message: "2048 × 2048 px — ready" }
          : { status: "warning", message: `${width} × ${height} px — expected 2048 × 2048 px` };

    setImageStates((current) => {
      if (current[index].status === nextState.status && current[index].message === nextState.message) {
        return current;
      }
      const next: [ImageState, ImageState] = [...current];
      next[index] = nextState;
      return next;
    });
  };

  const writeDifferences = (next: Difference[]) => {
    setJsonValue(JSON.stringify(next, null, 2));
  };

  const addDifference = (x: number, y: number) => {
    if (!parsed.differences) return;
    writeDifferences([...parsed.differences, { x, y, radius: defaultRadius }]);
  };

  const removeDifference = (index: number) => {
    if (!parsed.differences) return;
    writeDifferences(parsed.differences.filter((_, pointIndex) => pointIndex !== index));
  };

  const canPrint = Boolean(imageUrl1.trim() && imageUrl2.trim() && parsed.differences);

  return (
    <div className="level-editor-page min-h-screen bg-[#f3f5f8] text-slate-900">
      <section className="level-editor-screen">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Spotdiffs creator tools</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Puzzle level editor</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Add two square source images, mark the differences, then print the live two-page layout as a PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setJsonValue(initialJson)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Reset sample
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!canPrint}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Printer size={17} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon size={19} className="text-emerald-700" />
                <h2 className="font-bold text-slate-900">1. Source images</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Image A URL", value: imageUrl1, index: 0 as const },
                  { label: "Image B URL", value: imageUrl2, index: 1 as const },
                ].map((field) => (
                  <label key={field.label} className="block text-sm font-semibold text-slate-700">
                    {field.label}
                    <input
                      type="url"
                      value={field.value}
                      onChange={(event) => updateImageUrl(field.index, event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      spellCheck={false}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <ImageStatusMessage state={imageStates[field.index]} />
                  </label>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
                Expected source size: 2048 × 2048 px. Other square images can be previewed, but a warning will appear.
              </p>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Print difficulty
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Braces size={19} className="text-emerald-700" />
                  <h2 className="font-bold text-slate-900">2. Difference points</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {differences.length} points
                </span>
              </div>
              <textarea
                value={jsonValue}
                onChange={(event) => setJsonValue(event.target.value)}
                spellCheck={false}
                aria-label="Difference points JSON"
                className={`min-h-72 w-full resize-y rounded-xl border bg-slate-950 p-4 font-mono text-[13px] leading-5 text-slate-100 outline-none transition ${
                  parsed.error
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />
              {parsed.error ? (
                <p className="mt-3 flex items-start gap-2 text-xs font-medium leading-5 text-red-600">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {parsed.error}
                </p>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={15} />
                  Valid coordinates. The print preview is up to date.
                </p>
              )}

              <div className="mt-4 flex items-end gap-3 rounded-xl bg-slate-50 p-3.5">
                <label className="min-w-0 flex-1 text-xs font-bold text-slate-600">
                  Click-to-add radius
                  <input
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.5}
                    value={defaultRadius}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value) && value > 0 && value <= 50) setDefaultRadius(value);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                </label>
                <span className="pb-2 text-sm font-semibold text-slate-500">%</span>
              </div>
            </div>

            {differences.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-700" />
                  <h2 className="font-bold text-slate-900">Points</h2>
                </div>
                <div className="max-h-56 space-y-2 overflow-auto pr-1">
                  {differences.map((difference, index) => (
                    <div key={`${difference.x}-${difference.y}-${difference.radius}-${index}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 font-mono text-slate-600">
                        x {difference.x} · y {difference.y} · r {difference.radius}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDifference(index)}
                        aria-label={`Remove difference ${index + 1}`}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Interactive answer preview</h2>
                  <p className="mt-1 text-sm text-slate-500">Click Image B to append a point using the radius set on the left.</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <MousePointer2 size={14} />
                  Click to mark
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Image A</div>
                  <PreviewImage
                    src={imageUrl1.trim()}
                    alt="First source preview"
                    differences={differences}
                    onImageLoad={(width, height) => updateImageState(0, width, height)}
                    onImageError={() => updateImageState(0)}
                  />
                </div>
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Image B · click to add</div>
                  <PreviewImage
                    src={imageUrl2.trim()}
                    alt="Second source preview"
                    differences={differences}
                    interactive
                    onAddDifference={addDifference}
                    onImageLoad={(width, height) => updateImageState(1, width, height)}
                    onImageError={() => updateImageState(1)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Two-page print preview</h2>
                  <p className="mt-1 text-sm text-slate-500">A4 / US Letter landscape · page 1 puzzle · page 2 answer key</p>
                </div>
                {!canPrint && <span className="text-xs font-semibold text-amber-700">Add both image URLs to enable printing</span>}
              </div>
            </div>
          </main>
        </div>
      </section>

      <div className="level-editor-print-root mx-auto max-w-[1500px] space-y-8 px-5 pb-12 sm:px-8">
        <PrintableSheet imageUrl1={imageUrl1.trim()} imageUrl2={imageUrl2.trim()} differences={differences} difficulty={difficulty} />
        <PrintableSheet imageUrl1={imageUrl1.trim()} imageUrl2={imageUrl2.trim()} differences={differences} difficulty={difficulty} answerKey />
      </div>
    </div>
  );
}
