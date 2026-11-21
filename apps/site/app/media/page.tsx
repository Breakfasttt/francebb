import { prisma } from "@/lib/prisma";
import { Button, Card } from "@bbfrance/ui";
import { ExternalLink } from "lucide-react";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

/**
 * Page « Médias » (refonte, carte 090, ADR 0006) : les lecteurs des chaînes Twitch, chacun avec un lien vers la
 * chaîne sur Twitch, puis les listes de lecture YouTube. Les chaînes sont réglées dans l'administration (réglages
 * `twitch_channels` et `youtube_channels`, séparés par des virgules). Une colonne sur téléphone, deux sur ordinateur.
 * Les lecteurs ne se chargent qu'à l'approche de l'écran (`loading="lazy"`), pour ménager les téléphones.
 */

export const dynamic = "force-dynamic";

const sectionTitle = "font-bb-heading text-[0.95rem] text-bb-text";

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
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
      <ForumListHeader
        title="Vidéos et directs"
        subtitle="Les directs et les vidéos de la communauté"
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
        </section>
        )}

        {youtubeList.length > 0 && (
        <section aria-labelledby="media-youtube" className="flex flex-col gap-3">
          <h2 id="media-youtube" className={sectionTitle}>
            Dernières vidéos
          </h2>
            <div className="grid gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-3">
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
        </section>
        )}
      </div>
    </div>
  );
}
