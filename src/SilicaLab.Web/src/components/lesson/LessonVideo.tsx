import { toEmbedUrl } from "../../lib/video";

interface Props {
  url: string;
  title: string;
}

/** YouTube or Vimeo player. Renders nothing when the link can't be turned into an embed. */
export default function LessonVideo({ url, title }: Props) {
  const src = toEmbedUrl(url);
  if (!src) return null;

  return (
    <iframe
      src={src}
      title={`Video: ${title}`}
      loading="lazy"
      allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="mt-6 aspect-video w-full rounded-xl bg-ink shadow-sm"
    />
  );
}
