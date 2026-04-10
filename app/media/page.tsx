import { prisma } from "@/lib/prisma";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Video, Youtube, Radio } from "lucide-react";
import "./page.css";
import "./page-mobile.css";


export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ["twitch_channels", "youtube_channels", "youtube_api_key"] }
    }
  });

  const config = settings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const twitchList = config.twitch_channels?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
  const youtubeList = config.youtube_channels?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];

  return (
    <main className="container media-page">
      <PageHeader 
        title="Vidéo & Stream" 
        subtitle="Suivez l'actualité Blood Bowl en Live et en Replay"
        backHref="/" 
      />

      <div className="media-grid">
        {/* SECTION TWITCH */}
        <section className="media-section twitch-section">
          <div className="section-header">
            <Radio size={24} className="icon-pulse" />
            <h2>Directs Twitch</h2>
          </div>
          
          <div className="streams-list">
            {twitchList.length > 0 ? (
              twitchList.map((channel: string) => (
                <PremiumCard key={channel} className="stream-card">
                  <div className="iframe-container">
                    <iframe
                      src={`https://player.twitch.tv/?channel=${channel}&parent=${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}&autoplay=false`}
                      height="100%"
                      width="100%"
                      allowFullScreen
                    />
                  </div>
                  <div className="stream-footer">
                    <span className="channel-name">{channel}</span>
                    <a href={`https://twitch.tv/${channel}`} target="_blank" rel="noopener noreferrer" className="live-btn">
                      Voir sur Twitch
                    </a>
                  </div>
                </PremiumCard>
              ))
            ) : (
              <p className="empty-msg">Aucune chaîne Twitch configurée.</p>
            )}
          </div>
        </section>

        {/* SECTION YOUTUBE */}
        <section className="media-section youtube-section">
          <div className="section-header">
            <Youtube size={24} />
            <h2>Dernières Vidéos</h2>
          </div>

          <div className="videos-list">
            {youtubeList.length > 0 ? (
              youtubeList.map((channelId: string) => {
                // Si on a une clé API, on pourrait faire un fetch ici. 
                // Pour le moment on utilise l'embed de la playlist "Uploads" qui est stable.
                const playlistId = channelId.replace(/^UC/, "UU");
                return (
                  <PremiumCard key={channelId} className="video-card">
                    <div className="iframe-container">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </PremiumCard>
                );
              })
            ) : (
              <p className="empty-msg">Aucune chaîne YouTube configurée.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
