const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{6,20}$/;

/** Extract a YouTube video ID from watch, youtu.be, embed, live, or shorts URLs. */
export function extractYouTubeId(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const cleaned = rawUrl.trim().replace(/^["']+|["']+$/g, "");
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      candidate = url.searchParams.get("v");
    } else {
      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === "embed" || parts[0] === "live" || parts[0] === "shorts")
      ) {
        candidate = parts[1];
      }
    }
  }

  return candidate && YOUTUBE_ID_RE.test(candidate) ? candidate : null;
}

/** Return a YouTube embed URL when `rawUrl` is a valid YouTube link. */
export function youTubeEmbedUrl(rawUrl: string | null | undefined): string | null {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}
