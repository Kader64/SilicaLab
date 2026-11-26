import {
  BookOpen,
  Briefcase,
  Camera,
  Code,
  Database,
  FlaskConical,
  Languages,
  Megaphone,
  Music,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { CourseCoverData } from "../types/courses";

// Keys are what the API stores in the database. Renaming one needs a data migration.
export const COVER_GRADIENTS = [
  { key: "teal", label: "Teal", from: "#10b9a6", to: "#0891b2" },
  { key: "ocean", label: "Ocean", from: "#38bdf8", to: "#2563eb" },
  { key: "indigo", label: "Indigo", from: "#818cf8", to: "#6d28d9" },
  { key: "grape", label: "Grape", from: "#e879f9", to: "#7c3aed" },
  { key: "sunset", label: "Sunset", from: "#fb923c", to: "#e11d48" },
  { key: "amber", label: "Amber", from: "#fbbf24", to: "#ea580c" },
  { key: "forest", label: "Forest", from: "#4ade80", to: "#047857" },
  { key: "slate", label: "Slate", from: "#64748b", to: "#0f172a" },
] as const;

export const COVER_ICONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "code", label: "Programming", icon: Code },
  { key: "database", label: "Data", icon: Database },
  { key: "palette", label: "Design", icon: Palette },
  { key: "megaphone", label: "Marketing", icon: Megaphone },
  { key: "book", label: "Reading", icon: BookOpen },
  { key: "camera", label: "Photo and video", icon: Camera },
  { key: "music", label: "Music", icon: Music },
  { key: "languages", label: "Languages", icon: Languages },
  { key: "briefcase", label: "Business", icon: Briefcase },
  { key: "science", label: "Science", icon: FlaskConical },
];

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function randomCover(): CourseCoverData {
  return {
    coverType: "Gradient",
    coverGradient: pick(COVER_GRADIENTS).key,
    coverIcon: pick(COVER_ICONS).key,
    thumbnailUrl: "",
  };
}

export function gradientCss(key?: string | null) {
  const g = COVER_GRADIENTS.find((x) => x.key === key) ?? COVER_GRADIENTS[0];
  return `linear-gradient(135deg, ${g.from}, ${g.to})`;
}