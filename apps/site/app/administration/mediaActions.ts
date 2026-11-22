"use server";

/**
 * Actions de l'onglet « Médias » de l'administration : les chaînes YouTube et Twitch de la page `/media` et du bloc
 * Médias de l'accueil (réglages `youtube_channels` et `twitch_channels`, format dans lib/mediaChannels.ts).
 * Réservé aux administrateurs, vérifié dans chaque action. Chaque enregistrement est inscrit au journal.
 */
import { refreshMediaChannels } from "@/lib/pageRefresh";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { logModerationAction } from "@/lib/moderationLog";
import {
  MEDIA_CHANNELS_MAX, TWITCH_CHANNELS_KEY, YOUTUBE_CHANNELS_KEY, parseTwitchChannelInput, parseTwitchChannels, parseYoutubeChannels,
  serializeYoutubeChannels, type YoutubeChannel,
} from "@/lib/mediaChannels";
import { resolveYoutubeChannel } from "@/lib/youtubeChannels";
import type { ActionResult } from "@/lib/actionResult";

async function adminSession() {
  const session = await getActiveSession();
  return session?.user?.id && isAdmin(session.user.role) ? session : null;
}

/** Chaînes enregistrées, pour l'écran Médias. */
export async function getMediaChannels(): Promise<{ youtube: YoutubeChannel[]; twitch: string[] } | null> {
  if (!(await adminSession())) return null;
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: [YOUTUBE_CHANNELS_KEY, TWITCH_CHANNELS_KEY] } } });
  const value = (key: string) => settings.find((s) => s.key === key)?.value;
  return { youtube: parseYoutubeChannels(value(YOUTUBE_CHANNELS_KEY)), twitch: parseTwitchChannels(value(TWITCH_CHANNELS_KEY)) };
}

/** Retrouve une chaîne YouTube (identifiant et nom) à partir de ce qui a été collé : `@nom`, adresse ou identifiant. */
export async function findYoutubeChannel(input: string): Promise<ActionResult & { channel?: YoutubeChannel }> {
  if (!(await adminSession())) return { success: false, error: "Non autorisé." };
  if (typeof input !== "string" || input.length > 300) return { success: false, error: "Adresse invalide." };
  const channel = await resolveYoutubeChannel(input);
  if (!channel) return { success: false, error: "Chaîne introuvable : colle l'adresse de la chaîne (youtube.com/@nom ou youtube.com/channel/…)." };
  return { success: true, channel };
}

/** Nom d'une chaîne Twitch tiré d'un nom ou d'une adresse, ou une erreur. */
export async function checkTwitchChannel(input: string): Promise<ActionResult & { name?: string }> {
  if (!(await adminSession())) return { success: false, error: "Non autorisé." };
  const name = typeof input === "string" ? parseTwitchChannelInput(input) : null;
  if (!name) return { success: false, error: "Colle le nom de la chaîne ou son adresse (twitch.tv/nom)." };
  return { success: true, name };
}

/** Enregistre les deux listes, dans l'ordre choisi. Les entrées invalides sont refusées, les doublons retirés. */
export async function saveMediaChannels(input: { youtube: YoutubeChannel[]; twitch: string[] }): Promise<ActionResult> {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  if (!Array.isArray(input?.youtube) || !Array.isArray(input?.twitch)) return { success: false, error: "Listes invalides." };
  if (input.youtube.length > MEDIA_CHANNELS_MAX || input.twitch.length > MEDIA_CHANNELS_MAX) {
    return { success: false, error: `${MEDIA_CHANNELS_MAX} chaînes au plus par liste.` };
  }

  // Passage par le format du réglage : ce qui n'est pas valable disparaît, comme à la lecture
  const youtubeText = serializeYoutubeChannels(
    input.youtube.filter((c) => typeof c?.id === "string" && typeof c?.name === "string").map((c) => ({ id: c.id, name: c.name }))
  );
  const youtube = parseYoutubeChannels(youtubeText);
  const twitch = parseTwitchChannels(input.twitch.filter((n) => typeof n === "string").join("\n"));
  if (youtube.length !== input.youtube.length || twitch.length !== input.twitch.length) {
    return { success: false, error: "Une chaîne de la liste n'est pas valable ou est en double." };
  }

  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: YOUTUBE_CHANNELS_KEY }, update: { value: serializeYoutubeChannels(youtube) }, create: { key: YOUTUBE_CHANNELS_KEY, value: serializeYoutubeChannels(youtube) } }),
    prisma.siteSetting.upsert({ where: { key: TWITCH_CHANNELS_KEY }, update: { value: twitch.join("\n") }, create: { key: TWITCH_CHANNELS_KEY, value: twitch.join("\n") } }),
  ]);
  await logModerationAction(session.user.id, "MEDIA_CHANNELS_UPDATED", "media", "SETTING", `${youtube.length} chaîne(s) YouTube, ${twitch.length} chaîne(s) Twitch`);

  refreshMediaChannels();
  return { success: true };
}
