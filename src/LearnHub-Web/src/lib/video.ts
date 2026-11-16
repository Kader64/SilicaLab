const ALLOWED_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];

const hostMatches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** Embeddable player URL for a YouTube or Vimeo link, or null when the link is not recognised. */
export function toEmbedUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (host === "youtu.be" || hostMatches(host, "youtube.com")) {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]);
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (hostMatches(host, "vimeo.com")) {
    const id = url.pathname.match(/\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

/** Returns an error message, or null when the link is empty (optional) or valid. The API validates the host too. */
export function validateVideoUrl(value: string): string | null {
  const text = value.trim();
  if (!text) return null;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return "Enter a full link, for example https://www.youtube.com/watch?v=...";
  }

  if (url.protocol !== "https:") return "The link must start with https://.";

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.some((h) => hostMatches(host, h))) {
    return "This video host is not allowed. Use a YouTube or Vimeo link.";
  }

  return toEmbedUrl(text) ? null : "No video found in this link. Paste the full video address.";
}
