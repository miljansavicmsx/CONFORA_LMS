/**
 * Zajednički util za admin pregled i Learner Player: YouTube/Vimeo → embed URL.
 * Za ostale URL-ove (npr. direktan .mp4) vraća null → koristi se Video.js.
 */
export function getVideoEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const yt = parseYoutubeEmbed(trimmed);
  if (yt) {
    return yt;
  }
  return parseVimeoEmbed(trimmed);
}

function parseYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    if (h === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (h === "youtube.com" || h === "m.youtube.com" || h === "music.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      const m = u.pathname.match(/^\/embed\/([^/?#]+)/);
      if (m?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${m[1]}`;
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shorts?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${shorts[1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function parseVimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    if (h !== "vimeo.com" && h !== "player.vimeo.com") {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[0] === "video" ? parts[1] : parts[0];
    if (!id || !/^\d+$/.test(id)) {
      return null;
    }
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
}
