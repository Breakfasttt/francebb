/**
 * Lecteurs Twitch du site : page `/media` et balise BBCode `[twitch]` des messages.
 * Twitch dépose ses propres cookies dès que son lecteur se charge ; il ne se charge donc qu'après l'accord du membre,
 * donné à l'endroit du lecteur (cadre `TwitchEmbed`, recommandation de la CNIL pour les contenus tiers). L'accord
 * « Toujours afficher » est gardé dans le navigateur (localStorage, pas de cookie) pendant 6 mois, puis redemandé.
 * Fichier sans dépendance : lu côté serveur (rendu du BBCode) comme dans le navigateur.
 */

export type TwitchKind = "channel" | "video" | "clip";

export interface TwitchTarget {
  kind: TwitchKind;
  id: string;
}

/** Clé du stockage du navigateur qui garde la date de l'accord « Toujours afficher les contenus Twitch ». */
export const TWITCH_CONSENT_KEY = "bbfrance_twitch_consent";
/** Événement envoyé dans la page quand l'accord change, pour que tous les cadres Twitch se mettent à jour. */
export const TWITCH_CONSENT_EVENT = "bbfrance-twitch-consent";
/** Durée de l'accord, en jours (la CNIL conseille de redemander au bout de 6 mois environ). */
export const TWITCH_CONSENT_DAYS = 182;

const CHANNEL = /^[a-zA-Z0-9_]{3,25}$/;
const VIDEO = /^\d{5,12}$/;
const CLIP = /^[a-zA-Z0-9_-]{5,100}$/;

/**
 * Reconnaît ce que le membre a collé : un nom de chaîne (`nomdelachaine`), l'adresse d'une chaîne
 * (`https://www.twitch.tv/nomdelachaine`), d'une vidéo (`https://www.twitch.tv/videos/123456789`) ou d'un clip
 * (`https://clips.twitch.tv/NomDuClip` ou `https://www.twitch.tv/nomdelachaine/clip/NomDuClip`). Renvoie null sinon.
 */
export function parseTwitchInput(raw: string): TwitchTarget | null {
  const input = raw.trim();
  if (CHANNEL.test(input)) return { kind: "channel", id: input.toLowerCase() };

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "clips.twitch.tv") {
    const slug = parts[0] === "embed" ? url.searchParams.get("clip") ?? "" : parts[0] ?? "";
    return CLIP.test(slug) ? { kind: "clip", id: slug } : null;
  }
  if (host !== "twitch.tv") return null;
  if (parts[0] === "videos" && VIDEO.test(parts[1] ?? "")) return { kind: "video", id: parts[1] };
  if (parts[1] === "clip" && CLIP.test(parts[2] ?? "")) return { kind: "clip", id: parts[2] };
  if (parts.length === 1 && CHANNEL.test(parts[0])) return { kind: "channel", id: parts[0].toLowerCase() };
  return null;
}

/** Adresse du lecteur Twitch. `parent` : le domaine du site, exigé par Twitch (sinon le lecteur refuse de s'afficher). */
export function twitchPlayerUrl(target: TwitchTarget, parent: string): string {
  const p = encodeURIComponent(parent);
  if (target.kind === "clip") return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(target.id)}&parent=${p}&autoplay=false`;
  const key = target.kind === "video" ? "video" : "channel";
  return `https://player.twitch.tv/?${key}=${encodeURIComponent(target.id)}&parent=${p}&autoplay=false`;
}

/** Adresse de la page Twitch du contenu, pour le lien « Voir sur Twitch ». */
export function twitchPageUrl(target: TwitchTarget): string {
  if (target.kind === "clip") return `https://clips.twitch.tv/${encodeURIComponent(target.id)}`;
  if (target.kind === "video") return `https://www.twitch.tv/videos/${encodeURIComponent(target.id)}`;
  return `https://www.twitch.tv/${encodeURIComponent(target.id)}`;
}

/** Vrai si l'accord enregistré (date ISO) existe et a moins de 6 mois. */
export function isTwitchConsentValid(stored: string | null, now: Date = new Date()): boolean {
  if (!stored) return false;
  const given = new Date(stored);
  if (Number.isNaN(given.getTime())) return false;
  return now.getTime() - given.getTime() < TWITCH_CONSENT_DAYS * 24 * 60 * 60 * 1000;
}

/** Un direct Twitch en cours (API de Twitch, ou détecté par le lecteur dans le navigateur). */
export interface TwitchLive {
  login: string;
  name: string;
  title?: string;
  viewers?: number;
  game?: string;
  thumbnail: string;
}

/** Une chaîne hors ligne et son contenu le plus récent (dernière vidéo, ou clip le plus vu du mois). */
export interface TwitchOffline {
  login: string;
  name: string;
  latest: { kind: "video" | "clip"; id: string; title: string; thumbnail: string } | null;
}

export interface TwitchStatus {
  live: TwitchLive[];
  offline: TwitchOffline[];
}

/** Image d'un direct ou d'une vidéo Twitch en 640 × 360 : Twitch donne une adresse à compléter (`{width}x{height}`). */
export function twitchThumbnail(url: string): string {
  return url.replace(/%?\{width\}/g, "640").replace(/%?\{height\}/g, "360");
}

/** Aperçu public d'un direct, sans API (image mise à jour par Twitch pendant le direct). */
export function twitchLivePreview(login: string): string {
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${encodeURIComponent(login)}-640x360.jpg`;
}

/** Lecteur d'un direct dans le tourniquet : lancé seul, sans le son. */
export function twitchCarouselPlayerUrl(login: string, parent: string): string {
  return `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&parent=${encodeURIComponent(parent)}&autoplay=true&muted=true`;
}
