import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState } from "@bbfrance/ui";
import { ExternalLink, Radio, Youtube } from "lucide-react";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

/**
 * Page « Médias » (refonte, carte 090, ADR 0006) : les lecteurs des chaînes Twitch, chacun avec un lien vers la
 * chaîne sur Twitch, puis les listes de lecture YouTube. Les chaînes sont réglées dans l'administration (réglages
 * `twitch_channels` et `youtube_channels`, séparés par des virgules). Une colonne sur téléphone, deux sur ordinateur.
 * Les lecteurs ne se chargent qu'à l'approche de l'écran (`loading="lazy"`), pour ménager les téléphones.
 */

export const dynamic = "force-dynamic";

const sectionTitle = "m-0 flex items-center gap-2 border-0 p-0 text-lg leading-tight font-bold text-bb-text normal-case not-italic";

export default async function MediaPage() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ["twitch_channels", "youtube_channels"] }
    }
  });

  const config: Record<string, string | undefined> = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const twitchList = config.twitch_channels?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
  const youtubeList = config.youtube_channels?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Vidéos et directs"
        subtitle="Suivez l'actualité du Blood Bowl en direct et en rediffusion"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="flex flex-col gap-8">
        <section aria-labelledby="media-twitch" className="flex flex-col gap-3">
          <h2 id="media-twitch" className={sectionTitle}>
            <Radio size={22} aria-hidden="true" className="text-bb-accent-text" /> Directs Twitch
          </h2>
          {twitchList.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {twitchList.map((channel: string) => (
                <Card key={channel} className="overflow-hidden">
                  <div className="aspect-video w-full bg-bb-surface-2">
                    <iframe
                      src={`https://player.twitch.tv/?channel=${channel}&parent=${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}&autoplay=false`}
                      title={`Direct Twitch de ${channel}`}
                      loading="lazy"
                      className="block size-full border-0"
                      allowFullScreen
                    />
                  </div>
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
          ) : (
            <Card>
              <EmptyState title="Aucune chaîne Twitch configurée." />
            </Card>
          )}
        </section>

        <section aria-labelledby="media-youtube" className="flex flex-col gap-3">
          <h2 id="media-youtube" className={sectionTitle}>
            <Youtube size={22} aria-hidden="true" className="text-bb-accent-text" /> Dernières vidéos
          </h2>
          {youtubeList.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {youtubeList.map((channelId: string) => {
                // Liste de lecture « Uploads » de la chaîne : son identifiant est celui de la chaîne, avec UU au lieu de UC
                const playlistId = channelId.replace(/^UC/, "UU");
                return (
                  <Card key={channelId} className="overflow-hidden">
                    <div className="aspect-video w-full bg-bb-surface-2">
                      <iframe
                        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                        title={`Vidéos YouTube de la chaîne ${channelId}`}
                        loading="lazy"
                        className="block size-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <EmptyState title="Aucune chaîne YouTube configurée." />
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
