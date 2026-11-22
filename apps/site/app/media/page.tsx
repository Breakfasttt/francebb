import { prisma } from "@/lib/prisma";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import MediaTabs from "@/app/media/component/MediaTabs";
import MediaCarousel, { type CarouselItem } from "@/app/media/component/MediaCarousel";
import TwitchTab from "@/app/media/component/TwitchTab";
import YoutubeChannelCard from "@/app/media/component/YoutubeChannelCard";
import { TWITCH_CHANNELS_KEY, YOUTUBE_CHANNELS_KEY, parseTwitchChannels, parseYoutubeChannels } from "@/lib/mediaChannels";
import { getLatestVideos, getYoutubeLives, type LatestVideo } from "@/lib/youtubeChannels";
import { getTwitchStatus } from "@/lib/twitchApi";

/**
 * Page « Médias » (cartes 090 et 226) : deux onglets liés à l'adresse, « YouTube » (par défaut) et « Twitch »
 * (`?onglet=twitch`). Les chaînes sont réglées dans l'onglet Médias de l'administration (lib/mediaChannels.ts).
 * - YouTube : tourniquet des chaînes en direct (page publique `/live`, cache 5 minutes ; lecteur youtube-nocookie lancé
 *   seul, sans le son), puis une carte par chaîne avec l'image de sa dernière vidéo, lecteur au clic.
 * - Twitch (`TwitchTab`) : rien de Twitch avant l'accord du visiteur ; ensuite tourniquet des directs et chaînes hors
 *   ligne. Avec les clés de l'API de Twitch, le serveur fournit les directs et les dernières vidéos (lib/twitchApi.ts).
 */

export const dynamic = "force-dynamic";

const sectionTitle = "m-0 font-bb-heading text-[0.95rem] text-bb-text";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const { onglet } = await searchParams;
  const tab = onglet === "twitch" ? "twitch" : "youtube";

  const settings = await prisma.siteSetting.findMany({ where: { key: { in: [TWITCH_CHANNELS_KEY, YOUTUBE_CHANNELS_KEY] } } });
  const config: Record<string, string | undefined> = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const twitchChannels = parseTwitchChannels(config[TWITCH_CHANNELS_KEY]);
  const youtubeChannels = parseYoutubeChannels(config[YOUTUBE_CHANNELS_KEY]);
  const youtubeIds = youtubeChannels.map((channel) => channel.id);

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
      <ForumListHeader title="Médias" subtitle="Vidéos et directs de la communauté" backHref="/" backTitle="Retour à l'accueil" />
      <div className="flex flex-col gap-6">
        <MediaTabs active={tab} />
        {tab === "youtube" ? (
          <YoutubeTab channels={youtubeChannels} ids={youtubeIds} />
        ) : (
          <TwitchTab channels={twitchChannels} status={await getTwitchStatus(twitchChannels)} />
        )}
      </div>
    </div>
  );
}

/** Date de publication d'une dernière vidéo, en millisecondes (0 si inconnue : la chaîne passe à la fin du tri). */
function publishedTime(video: LatestVideo | null | undefined): number {
  return video?.publishedAt ? Date.parse(video.publishedAt) : 0;
}

async function YoutubeTab({ channels, ids }: { channels: ReturnType<typeof parseYoutubeChannels>; ids: string[] }) {
  if (channels.length === 0) {
    return <p className="m-0 text-bb-text-muted">Pas encore de chaîne YouTube référencée. L&apos;équipe du site peut en ajouter depuis l&apos;administration.</p>;
  }
  const [latestVideos, lives] = await Promise.all([getLatestVideos(ids), getYoutubeLives(ids)]);
  const items: CarouselItem[] = channels.flatMap((channel) => {
    const live = lives[channel.id];
    if (!live) return [];
    return [{
      key: channel.id,
      title: channel.name,
      subtitle: live.title,
      thumbnail: `https://i.ytimg.com/vi/${live.videoId}/hqdefault_live.jpg`,
      optimizeThumbnail: true,
      playerSrc: `https://www.youtube-nocookie.com/embed/${live.videoId}?autoplay=1&mute=1`,
    }];
  });

  return (
    <div className="flex flex-col gap-8">
      {items.length > 0 && <MediaCarousel items={items} label="Chaînes YouTube en direct" />}
      <section aria-labelledby="media-youtube" className="flex flex-col gap-3">
        <h2 id="media-youtube" className={sectionTitle}>Dernières vidéos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1600px]:grid-cols-4">
          {/* De la vidéo la plus récente à la plus ancienne ; une chaîne sans vidéo connue passe à la fin */}
          {[...channels]
            .sort((a, b) => publishedTime(latestVideos[b.id]) - publishedTime(latestVideos[a.id]))
            .map((channel) => (
              <YoutubeChannelCard key={channel.id} channel={channel} latest={latestVideos[channel.id] ?? null} />
            ))}
        </div>
      </section>
    </div>
  );
}
