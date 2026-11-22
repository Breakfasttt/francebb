/**
 * Chaînes de la page « Médias » (`/media`) et du bloc Médias de l'accueil, enregistrées dans deux réglages du site :
 * - `youtube_channels` : une chaîne par ligne, `identifiant|nom` (`UCJBrT8VzthslAZKNKooHHtg|Dré dans l'pentu`).
 *   L'identifiant (UC…) sert à la liste « Uploads » de la chaîne et à son flux des dernières vidéos ; le nom est
 *   celui affiché. Les anciennes valeurs, des identifiants séparés par des virgules, sont toujours lues.
 * - `twitch_channels` : un nom de chaîne Twitch par ligne (ou séparés par des virgules, ancienne forme).
 * Fichier sans dépendance (lu par le serveur, l'administration et les tests unitaires). La recherche d'une chaîne
 * sur YouTube et la lecture de ses dernières vidéos sont dans `lib/youtubeChannels.ts`.
 */

export interface YoutubeChannel {
  id: string;
  name: string;
}

export const YOUTUBE_CHANNELS_KEY = "youtube_channels";
export const TWITCH_CHANNELS_KEY = "twitch_channels";
export const MEDIA_CHANNELS_MAX = 40;

const YOUTUBE_ID = /^UC[a-zA-Z0-9_-]{22}$/;
const TWITCH_NAME = /^[a-zA-Z0-9_]{3,25}$/;

/** Lignes d'un réglage : une par ligne, ou séparées par des virgules quand le réglage tient sur une ligne. */
function settingLines(value: string | null | undefined): string[] {
  if (!value) return [];
  const lines = value.includes("\n") ? value.split(/\r?\n/) : value.split(",");
  return lines.map((line) => line.trim()).filter(Boolean);
}

/** Chaînes YouTube d'un réglage ; une ligne dont l'identifiant n'est pas valable est ignorée. */
export function parseYoutubeChannels(value: string | null | undefined): YoutubeChannel[] {
  const seen = new Set<string>();
  const channels: YoutubeChannel[] = [];
  for (const line of settingLines(value)) {
    const [rawId, ...rest] = line.split("|");
    const id = rawId.trim();
    if (!YOUTUBE_ID.test(id) || seen.has(id)) continue;
    seen.add(id);
    channels.push({ id, name: rest.join("|").trim() || id });
  }
  return channels;
}

/** Texte du réglage `youtube_channels` : une chaîne par ligne. Le nom ne garde ni « | » ni retour à la ligne. */
export function serializeYoutubeChannels(channels: YoutubeChannel[]): string {
  return channels.map((c) => `${c.id}|${c.name.replace(/[|\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 100)}`).join("\n");
}

/** Chaînes Twitch d'un réglage (noms en minuscules, sans doublon). */
export function parseTwitchChannels(value: string | null | undefined): string[] {
  return [...new Set(settingLines(value).map((name) => name.toLowerCase()).filter((name) => TWITCH_NAME.test(name)))];
}

/** Nom d'une chaîne Twitch tiré d'un nom ou d'une adresse (`https://www.twitch.tv/nom`), ou null. */
export function parseTwitchChannelInput(raw: string): string | null {
  const input = raw.trim().replace(/^https?:\/\/(www\.|m\.)?twitch\.tv\//i, "").replace(/[/?#].*$/, "");
  return TWITCH_NAME.test(input) ? input.toLowerCase() : null;
}

/**
 * Ce que l'administrateur a collé pour une chaîne YouTube : un identifiant (`UC…`), une adresse `/channel/UC…`
 * (identifiant direct) ou une adresse `@nom` (à retrouver sur YouTube). Renvoie null si ce n'est ni l'un ni l'autre.
 */
export function parseYoutubeChannelInput(raw: string): { id: string } | { handle: string } | null {
  const input = raw.trim();
  if (YOUTUBE_ID.test(input)) return { id: input };
  if (/^@[a-zA-Z0-9._-]{3,100}$/.test(input)) return { handle: input };
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  if (url.protocol !== "https:" || host !== "youtube.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "channel" && YOUTUBE_ID.test(parts[1] ?? "")) return { id: parts[1] };
  if (parts[0]?.startsWith("@") && /^@[a-zA-Z0-9._-]{3,100}$/.test(parts[0])) return { handle: parts[0] };
  return null;
}

/** Liste de lecture « Uploads » d'une chaîne : son identifiant est celui de la chaîne avec UU à la place de UC. */
export function uploadsPlaylistId(channelId: string): string {
  return channelId.replace(/^UC/, "UU");
}

export interface YoutubeLive {
  videoId: string;
  title: string;
}

/**
 * Lit la page `/live` d'une chaîne YouTube : en direct, YouTube renvoie la page de la vidéo (adresse canonique
 * `watch?v=…`) marquée `"isLive":true` ; sinon, la page de la chaîne. Un direct seulement programmé
 * (`"isUpcoming":true`) ne compte pas. Renvoie la vidéo et son titre (entités HTML encore codées), ou null.
 */
export function parseYoutubeLivePage(html: string): YoutubeLive | null {
  const videoId = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/)?.[1];
  if (!videoId || !html.includes('"isLive":true') || html.includes('"isUpcoming":true')) return null;
  const title = html.match(/<meta name="title" content="([^"]*)"/)?.[1] ?? "";
  return { videoId, title };
}

