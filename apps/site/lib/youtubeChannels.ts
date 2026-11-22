/**
 * Côté serveur seulement : retrouver une chaîne YouTube et lire sa dernière vidéo, sans clé d'API.
 * - `resolveYoutubeChannel` : depuis un identifiant ou une adresse `@nom`, lit la page publique de la chaîne
 *   (adresse canonique `/channel/UC…` et titre `og:title`). Sert à l'écran Médias de l'administration.
 * - `getLatestVideos` : lit le flux public des vidéos de chaque chaîne (`feeds/videos.xml`), gardé une heure en
 *   cache. Sert aux cartes de la page `/media`, qui montrent l'image de la dernière vidéo au lieu de charger un
 *   lecteur YouTube par chaîne.
 * Aucune donnée de membre n'est envoyée à YouTube : seulement l'identifiant ou l'adresse publique de la chaîne.
 */
import { unstable_cache } from "next/cache";
import { parseYoutubeChannelInput, type YoutubeChannel } from "@/lib/mediaChannels";

const FETCH_HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; BBFrance)", "Accept-Language": "fr" };

function decodeEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** Identifiant et nom d'une chaîne YouTube, ou null si YouTube ne la trouve pas. */
export async function resolveYoutubeChannel(raw: string): Promise<YoutubeChannel | null> {
  const parsed = parseYoutubeChannelInput(raw);
  if (!parsed) return null;
  const path = "id" in parsed ? `channel/${parsed.id}` : encodeURIComponent(parsed.handle).replace("%40", "@");
  try {
    const res = await fetch(`https://www.youtube.com/${path}`, { headers: FETCH_HEADERS, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const html = await res.text();
    const id = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/)?.[1];
    const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
    if (!id) return null;
    return { id, name: title ? decodeEntities(title).trim() : id };
  } catch {
    return null;
  }
}

export interface LatestVideo {
  videoId: string;
  title: string;
}

async function fetchLatestVideo(channelId: string): Promise<LatestVideo | null> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const entry = xml.split("<entry>")[1];
    if (!entry) return null;
    const videoId = entry.match(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    return videoId ? { videoId, title: title ? decodeEntities(title) : "" } : null;
  } catch {
    return null;
  }
}

/** Dernière vidéo de chaque chaîne (null quand le flux ne répond pas), gardée une heure en cache. */
export const getLatestVideos = unstable_cache(
  async (channelIds: string[]): Promise<Record<string, LatestVideo | null>> => {
    const results = await Promise.all(channelIds.map(async (id) => [id, await fetchLatestVideo(id)] as const));
    return Object.fromEntries(results);
  },
  ["youtube-latest-videos-v1"],
  { revalidate: 3600 }
);
