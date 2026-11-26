import { useState, type ReactNode } from "react";
import { COVER_ICONS, gradientCss } from "../../lib/cover";
import { cn } from "../../lib/cn";
import type { CourseCoverData } from "../../types/courses";

interface Props {
  cover: CourseCoverData;
  className?: string;
  children?: ReactNode;
}

export default function CourseCover({ cover, className = "h-40", children }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = cover.coverType === "Image" ? cover.thumbnailUrl?.trim() : undefined;
  const Icon = (COVER_ICONS.find((i) => i.key === cover.coverIcon) ?? COVER_ICONS[0]).icon;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ background: gradientCss(cover.coverGradient) }}
    >
      {imageUrl && imageUrl !== failedUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <Icon
          aria-hidden="true"
          className="absolute -bottom-6 -right-4 h-32 w-32 text-white/15 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
        />
      )}
      {children}
    </div>
  );
}