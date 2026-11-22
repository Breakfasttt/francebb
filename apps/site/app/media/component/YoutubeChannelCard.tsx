"use client";

/**
 * Carte d'une chaîne YouTube de la page « Médias » : l'image de la dernière vidéo (servie par le site, voir
 * next.config.ts), le nom de la chaîne et le titre de la vidéo. Le lecteur YouTube (youtube-nocookie.com, liste
 * « Uploads » de la chaîne) ne se charge qu'au clic sur l'image : la page ne charge plus un lecteur par chaîne, ce qui
 * pesait lourd sur téléphone avec une dizaine de chaînes. Sans vidéo connue (flux muet), un cadre uni la remplace.
 */
import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";
import { uploadsPlaylistId, type YoutubeChannel } from "@/lib/mediaChannels";
import type { LatestVideo } from "@/lib/youtubeChannels";

export default function YoutubeChannelCard({ channel, latest }: { channel: YoutubeChannel; latest: LatestVideo | null }) {
  const [playing, setPlaying] = useState(false);
  const playlist = uploadsPlaylistId(channel.id);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video w-full bg-bb-surface-2">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}&autoplay=1`}
            title={`Vidéos de ${channel.name}`}
            className="absolute inset-0 size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <Button
            type="button"
            variant="quiet"
            onClick={() => setPlaying(true)}
            aria-label={`Lire les vidéos de ${channel.name}`}
            className="group absolute inset-0 h-full w-full rounded-none border-0 bg-transparent p-0 hover:bg-transparent focus-visible:outline-offset-[-2px]"
          >
            {latest && (
              <Image
                src={`https://i.ytimg.com/vi/${latest.videoId}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(min-width: 1440px) 33vw, (min-width: 1025px) 50vw, 100vw"
                className="object-cover"
              />
            )}
            <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-bb-overlay text-bb-text transition-transform duration-150 group-hover:scale-105">
              <Play size={26} aria-hidden="true" className="translate-x-0.5" fill="currentColor" />
            </span>
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="m-0 font-bold break-words">{channel.name}</p>
        {latest?.title && <p className="m-0 line-clamp-2 text-sm text-bb-text-muted">Dernière vidéo : {latest.title}</p>}
        <Button asChild variant="secondary" size="tap" className="mt-auto self-start">
          <a href={`https://www.youtube.com/channel/${channel.id}`} target="_blank" rel="noopener noreferrer" className="no-underline">
            Voir sur YouTube <ExternalLink size={15} aria-hidden="true" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
