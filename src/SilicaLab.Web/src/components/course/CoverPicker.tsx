import { ChevronDown, ImageIcon } from "lucide-react";
import { useState } from "react";
import { COVER_GRADIENTS, COVER_ICONS, gradientCss } from "../../lib/cover";
import { cn } from "../../lib/cn";
import type { CourseCoverData, CoverType } from "../../types";
import Field from "../ui/Field";
import SegmentedControl from "../ui/SegmentedControl";
import CourseCover from "./CourseCover";

interface Props {
  cover: CourseCoverData;
  onChange: (cover: CourseCoverData) => void;
}

const COVER_TYPES: { value: CoverType; label: string }[] = [
  { value: "Gradient", label: "Gradient and icon" },
  { value: "Image", label: "Image" },
];

export default function CoverPicker({ cover, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<CourseCoverData>) =>
    onChange({ ...cover, ...patch });

  const imageUrl = cover.thumbnailUrl?.trim();
  const coverOk = cover.coverType === "Gradient" || !!imageUrl;
  // A section with a problem can't stay collapsed.
  const expanded = open || !coverOk;

  const gradientLabel = COVER_GRADIENTS.find(
    (g) => g.key === cover.coverGradient,
  )?.label;
  const iconLabel = COVER_ICONS.find((i) => i.key === cover.coverIcon)?.label;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <h2 className="section-title">Cover</h2>
          {!expanded && (
            <span className="flex min-w-0 items-center gap-2.5 text-sm text-muted">
              {cover.coverType === "Gradient" && (
                <span
                  aria-hidden="true"
                  className="h-5 w-8 shrink-0 rounded"
                  style={{ background: gradientCss(cover.coverGradient) }}
                />
              )}
              <span className="truncate">
                {cover.coverType === "Gradient"
                  ? `${gradientLabel} gradient, ${iconLabel} icon`
                  : `Image: ${imageUrl}`}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="cover-panel"
          disabled={!coverOk}
          onClick={() => setOpen(!expanded)}
          className="btn btn-ghost btn-sm shrink-0"
        >
          {expanded ? "Hide" : "Change"}
          <ChevronDown
            size={16}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {expanded && (
        <div id="cover-panel" className="mt-5 space-y-5">
          <SegmentedControl
            label="Cover type"
            value={cover.coverType}
            options={COVER_TYPES}
            onChange={(coverType) => update({ coverType })}
          />

          <div className="grid gap-6 sm:grid-cols-[16rem_1fr]">
            <div className="card-feature group self-start overflow-hidden">
              {cover.coverType === "Image" && !imageUrl ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 bg-page px-4 text-center text-sm text-muted">
                  <ImageIcon size={24} aria-hidden="true" />
                  Paste an image URL to see a preview
                </div>
              ) : (
                <CourseCover cover={cover} className="h-40" />
              )}
            </div>

            {cover.coverType === "Gradient" ? (
              <div className="space-y-5">
                <div>
                  <span className="label">Color</span>
                  <div className="flex flex-wrap gap-3">
                    {COVER_GRADIENTS.map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        title={g.label}
                        aria-label={g.label}
                        aria-pressed={cover.coverGradient === g.key}
                        onClick={() => update({ coverGradient: g.key })}
                        style={{ background: gradientCss(g.key) }}
                        className={cn(
                          "h-9 w-9 rounded-full transition focus-visible:ring-offset-2",
                          cover.coverGradient === g.key
                            ? "ring-2 ring-accent ring-offset-2"
                            : "hover:scale-105",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="label">Icon</span>
                  <div className="flex flex-wrap gap-2">
                    {COVER_ICONS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={cover.coverIcon === key}
                        onClick={() => update({ coverIcon: key })}
                        className={cn(
                          "rounded-lg border p-2.5 transition-colors",
                          cover.coverIcon === key
                            ? "border-accent bg-accent-soft text-accent-dark"
                            : "border-line-strong bg-white text-muted hover:bg-page hover:text-ink",
                        )}
                      >
                        <Icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Field
                label="Image URL"
                hint="Wide images work best. If the image can't be loaded, the gradient is shown instead."
              >
                {(control) => (
                  <input
                    {...control}
                    type="url"
                    className="input"
                    placeholder="https://..."
                    value={cover.thumbnailUrl ?? ""}
                    onChange={(e) => update({ thumbnailUrl: e.target.value })}
                  />
                )}
              </Field>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
