import { prisma } from "@/lib/prisma";
import { Button, Card } from "@bbfrance/ui";
import { ExternalLink } from "lucide-react";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import TwitchEmbed from "@/common/components/TwitchEmbed/TwitchEmbed";
import YoutubeChannelCard from "@/app/media/component/YoutubeChannelCard";
import { TWITCH_CHANNELS_KEY, YOUTUBE_CHANNELS_KEY, parseTwitchChannels, parseYoutubeChannels } from "@/lib/mediaChannels";
import { getLatestVideos } from "@/lib/youtubeChannels";

/**
 * Page « Médias » (refonte, carte 090, ADR 0006) : les directs des chaînes Twitch, puis les chaînes YouTube. Les
 * chaînes sont réglées dans l'écran Médias de l'administration (réglages `twitch_channels` et `youtube_channels`,
 * format dans lib/mediaChannels.ts). Une colonne sur téléphone, deux sur ordinateur, trois à partir de 1440 pixels.
 * - YouTube : une carte par chaîne avec l'image de sa dernière vidéo ; le lecteur ne se charge qu'au clic
 *   (`YoutubeChannelCard`), pour ne pas charger une dizaine de lecteurs sur téléphone.
 * - Twitch : le lecteur ne se charge qu'après l'accord du visiteur (`TwitchEmbed`, cookies de Twitch).
 */

export const dynamic = "force-dynamic";

const sectionTitle = "font-bb-heading text-[0.95rem] text-bb-text";

export default async function MediaPage() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: [TWITCH_CHANNELS_KEY, YOUTUBE_CHANNELS_KEY] }
    }
  });

  const config: Record<string, string | undefined> = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const twitchList = parseTwitchChannels(config[TWITCH_CHANNELS_KEY]);
  const youtubeChannels = parseYoutubeChannels(config[YOUTUBE_CHANNELS_KEY]);
  const youtubeList = youtubeChannels.map((channel) => channel.id);
  // Dernière vidéo de chaque chaîne (flux public de YouTube, gardé une heure en cache)
  const latestVideos = youtubeList.length > 0 ? await getLatestVideos(youtubeList) : {};

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
      <ForumListHeader
        title="Médias"
        subtitle="Vidéos et directs de la communauté"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="flex flex-col gap-8">
        {/* Rien de configuré : une phrase, sans boîte ni état vide passe-partout (DESIGN.md) */}
        {twitchList.length === 0 && youtubeList.length === 0 && (
          <p className="text-bb-text-muted">Pas encore de chaîne référencée. L&apos;équipe du site peut en ajouter depuis l&apos;administration.</p>
        )}
        {/* Une section sans chaîne n'est pas affichée */}
        {twitchList.length > 0 && (
        <section aria-labelledby="media-twitch" className="flex flex-col gap-3">
          <h2 id="media-twitch" className={sectionTitle}>
            Directs Twitch
          </h2>
            <div className="grid gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-3">
              {twitchList.map((channel: string) => (
                <Card key={channel} className="overflow-hidden">
                  {/* Le lecteur Twitch ne se charge qu'après l'accord du visiteur (cookies de Twitch, RGPD) */}
                  <TwitchEmbed target={{ kind: "channel", id: channel }} title={`Direct de ${channel}`} showPageLink={false} className="rounded-none border-0" />
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                    <span className="min-w-0 font-bold break-words">{channel}</span>
                    <Button asChild variant="secondary" size="tap">
                      <a href={`https://twitch.tv/${channel}`} target="_blank" rel="noopener noreferrer" className="no-underline">
                        Voir sur Twitch <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
        </section>
        )}

        {youtubeList.length > 0 && (
        <section aria-labelledby="media-youtube" className="flex flex-col gap-3">
          <h2 id="media-youtube" className={sectionTitle}>
            Chaînes YouTube
          </h2>
            <div className="grid gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-3">
              {youtubeChannels.map((channel) => (
                <YoutubeChannelCard key={channel.id} channel={channel} latest={latestVideos[channel.id] ?? null} />
              ))}
            </div>
        </section>
        )}
      </div>
    </div>
  );
}
