/**
 * Côté serveur seulement : état des chaînes Twitch de la page `/media` par l'API officielle de Twitch (Helix).
 * Ne sert que si `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sont réglés (application créée sur dev.twitch.tv) ;
 * sinon `getTwitchStatus` renvoie null et l'onglet Twitch détecte les directs dans le navigateur, après l'accord du
 * visiteur (`app/media/component/TwitchTab.tsx`).
 * Le serveur demande un jeton d'application (« client credentials », sans compte de membre), puis : les directs en
 * cours, et pour chaque chaîne hors ligne sa dernière vidéo, ou à défaut son clip le plus vu des 30 derniers jours.
 * Résultat gardé 2 minutes en cache. Aucune donnée de membre n'est envoyée à Twitch.
 */
import { unstable_cache } from "next/cache";
import { twitchThumbnail, type TwitchStatus } from "@/lib/twitchEmbed";

const HELIX = "https://api.twitch.tv/helix";

export function isTwitchApiConfigured(): boolean {
  return !!process.env.TWITCH_CLIENT_ID && !!process.env.TWITCH_CLIENT_SECRET;
}

let token: { value: string; expires: number } | null = null;

async function appToken(): Promise<string | null> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID ?? "",
    client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
    grant_type: "client_credentials",
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  token = { value: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return token.value;
}

async function helix<T>(path: string, accessToken: string): Promise<T[]> {
  const res = await fetch(`${HELIX}${path}`, {
    headers: { "Client-Id": process.env.TWITCH_CLIENT_ID ?? "", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  return ((await res.json()) as { data?: T[] }).data ?? [];
}

type HelixUser = { id: string; login: string; display_name: string };
type HelixStream = { user_login: string; user_name: string; title: string; viewer_count: number; game_name: string; thumbnail_url: string };
type HelixVideo = { id: string; title: string; thumbnail_url: string; created_at: string };
type HelixClip = { id: string; title: string; thumbnail_url: string };

async function fetchStatus(logins: string[]): Promise<TwitchStatus | null> {
  if (!isTwitchApiConfigured() || logins.length === 0) return null;
  try {
    const accessToken = await appToken();
    if (!accessToken) return null;
    const query = logins.map((login) => `login=${encodeURIComponent(login)}`).join("&");
    const [users, streams] = await Promise.all([
      helix<HelixUser>(`/users?${query}`, accessToken),
      helix<HelixStream>(`/streams?${logins.map((l) => `user_login=${encodeURIComponent(l)}`).join("&")}&first=100`, accessToken),
    ]);
    const liveLogins = new Set(streams.map((s) => s.user_login.toLowerCase()));
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const offline = await Promise.all(
      logins
        .filter((login) => !liveLogins.has(login))
        .map(async (login) => {
          const user = users.find((u) => u.login.toLowerCase() === login);
          if (!user) return { login, name: login, latest: null };
          const [video] = await helix<HelixVideo>(`/videos?user_id=${user.id}&first=1&sort=time`, accessToken);
          if (video) return { login, name: user.display_name, latest: { kind: "video" as const, id: video.id, title: video.title, thumbnail: twitchThumbnail(video.thumbnail_url) } };
          const [clip] = await helix<HelixClip>(`/clips?broadcaster_id=${user.id}&first=1&started_at=${since}`, accessToken);
          if (clip) return { login, name: user.display_name, latest: { kind: "clip" as const, id: clip.id, title: clip.title, thumbnail: clip.thumbnail_url } };
          return { login, name: user.display_name, latest: null };
        })
    );

    // Directs dans l'ordre de la liste réglée dans l'administration
    const live = logins
      .map((login) => streams.find((s) => s.user_login.toLowerCase() === login))
      .filter((s): s is HelixStream => !!s)
      .map((s) => ({ login: s.user_login.toLowerCase(), name: s.user_name, title: s.title, viewers: s.viewer_count, game: s.game_name, thumbnail: twitchThumbnail(s.thumbnail_url) }));
    return { live, offline };
  } catch {
    return null;
  }
}

/** Directs et contenus récents des chaînes Twitch, ou null sans clés (ou si Twitch ne répond pas). Cache 2 minutes. */
export const getTwitchStatus = unstable_cache(fetchStatus, ["twitch-status-v1"], { revalidate: 120 });
