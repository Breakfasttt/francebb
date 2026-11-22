"use client";

/**
 * Onglet « Twitch » de la page `/media`. Rien de Twitch n'est chargé avant l'accord du visiteur : Twitch dépose ses
 * propres cookies dès que son lecteur ou ses images s'affichent. Un seul cadre explique pourquoi et propose
 * « Accepter et afficher Twitch », avec « Retenir mon choix » (6 mois, même accord que les cadres `[twitch]` des
 * messages, retirable dans les mentions légales). Sans accord, la liste des chaînes reste accessible en liens.
 * Après l'accord : le tourniquet des chaînes en direct (`MediaCarousel`), puis les chaînes hors ligne.
 * - Avec l'API de Twitch (`status`, lu par le serveur, lib/twitchApi.ts) : vrais directs, dernière vidéo ou clip.
 * - Sans clés : le lecteur de Twitch de chaque chaîne est chargé, caché, le temps de dire s'il est en ligne ; les
 *   chaînes hors ligne n'ont que leur nom et leur lien.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play, Twitch } from "lucide-react";
import { Button, Card, Skeleton } from "@bbfrance/ui";
import MediaCarousel, { type CarouselItem } from "@/app/media/component/MediaCarousel";
import { setTwitchConsent } from "@/common/components/TwitchEmbed/TwitchEmbed";
import {
  TWITCH_CONSENT_EVENT, TWITCH_CONSENT_KEY, isTwitchConsentValid, twitchCarouselPlayerUrl, twitchLivePreview, twitchPageUrl,
  twitchPlayerUrl, type TwitchLive, type TwitchOffline, type TwitchStatus,
} from "@/lib/twitchEmbed";

type TwitchPlayerApi = {
  Player: (new (el: HTMLElement, options: Record<string, unknown>) => { addEventListener: (event: string, cb: () => void) => void }) & {
    ONLINE: string;
    OFFLINE: string;
  };
};

let scriptPromise: Promise<TwitchPlayerApi | null> | null = null;

/** Script du lecteur de Twitch, chargé une fois, seulement après l'accord. */
function loadTwitchPlayerScript(): Promise<TwitchPlayerApi | null> {
  scriptPromise ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.async = true;
    script.onload = () => resolve((window as unknown as { Twitch?: TwitchPlayerApi }).Twitch ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Sans API : chaque chaîne est ouverte dans un lecteur caché qui dit s'il est en ligne (12 secondes au plus). */
function useLiveDetection(channels: string[], enabled: boolean) {
  const holder = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<string[] | null>(null);

  useEffect(() => {
    if (!enabled || channels.length === 0) return;
    let cancelled = false;
    const found = new Set<string>();
    loadTwitchPlayerScript().then((api) => {
      const box = holder.current;
      if (cancelled || !api || !box) return setLive([]);
      let pending = channels.length;
      const finish = () => {
        if (cancelled) return;
        box.innerHTML = "";
        setLive(channels.filter((c) => found.has(c)));
      };
      const timer = window.setTimeout(finish, 12000);
      for (const channel of channels) {
        const el = document.createElement("div");
        box.appendChild(el);
        const player = new api.Player(el, { channel, parent: [window.location.hostname], width: 320, height: 180, autoplay: false, muted: true });
        let answered = false;
        const answer = (online: boolean) => {
          if (answered) return;
          answered = true;
          if (online) found.add(channel);
          pending -= 1;
          if (pending === 0) {
            window.clearTimeout(timer);
            finish();
          }
        };
        player.addEventListener(api.Player.ONLINE, () => answer(true));
        player.addEventListener(api.Player.OFFLINE, () => answer(false));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [channels, enabled]);

  return [live, holder] as const;
}

function OfflineCard({ channel }: { channel: TwitchOffline }) {
  const [playing, setPlaying] = useState(false);
  const latest = channel.latest;
  // Sans contenu récent (cas sans clés de l'API) : une ligne compacte, le nom et le lien
  if (!latest) {
    return (
      <a
        href={twitchPageUrl({ kind: "channel", id: channel.login })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-between gap-2 rounded-bb-md border border-bb-border bg-bb-surface px-3 font-semibold text-bb-text no-underline hover:border-bb-accent-text"
      >
        <span className="min-w-0 truncate">{channel.name}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-bb-text-muted">
          Voir sur Twitch <ExternalLink size={14} aria-hidden="true" />
        </span>
      </a>
    );
  }
  const target = latest ? { kind: latest.kind, id: latest.id } : { kind: "channel" as const, id: channel.login };
  return (
    <Card className="flex flex-col overflow-hidden">
      {latest && (
        <div className="relative aspect-video w-full bg-bb-surface-2">
          {playing ? (
            <iframe
              src={twitchPlayerUrl(target, window.location.hostname).replace("autoplay=false", "autoplay=true")}
              title={`${latest.kind === "clip" ? "Clip" : "Vidéo"} de ${channel.name}`}
              className="absolute inset-0 size-full border-0"
              allowFullScreen
            />
          ) : (
            <Button type="button" variant="quiet" onClick={() => setPlaying(true)} aria-label={`Lire : ${latest.title}`} className="group absolute inset-0 h-full w-full rounded-none border-0 bg-transparent p-0 hover:bg-transparent">
              <Image src={latest.thumbnail} alt="" fill unoptimized sizes="(min-width: 1025px) 33vw, 100vw" className="object-cover" />
              <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-bb-overlay text-bb-text transition-transform duration-150 group-hover:scale-105">
                <Play size={26} aria-hidden="true" className="translate-x-0.5" fill="currentColor" />
              </span>
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="m-0 font-bold break-words">{channel.name}</p>
        {latest && <p className="m-0 line-clamp-2 text-sm text-bb-text-muted">{latest.kind === "clip" ? "Clip" : "Dernière vidéo"} : {latest.title}</p>}
        <Button asChild variant="secondary" size="tap" className="mt-auto self-start">
          <a href={twitchPageUrl({ kind: "channel", id: channel.login })} target="_blank" rel="noopener noreferrer" className="no-underline">
            Voir sur Twitch <ExternalLink size={15} aria-hidden="true" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

export default function TwitchTab({ channels, status }: { channels: string[]; status: TwitchStatus | null }) {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setConsent((current) => current || isTwitchConsentValid(window.localStorage.getItem(TWITCH_CONSENT_KEY)));
      } catch {
        setConsent((current) => current ?? false);
      }
    };
    read();
    window.addEventListener(TWITCH_CONSENT_EVENT, read);
    return () => window.removeEventListener(TWITCH_CONSENT_EVENT, read);
  }, []);

  const [detectedLive, detectionHolder] = useLiveDetection(channels, consent === true && status === null);

  if (channels.length === 0) return <p className="m-0 text-bb-text-muted">Pas encore de chaîne Twitch référencée.</p>;
  if (consent === null) return <Skeleton className="h-72 w-full" />;

  if (!consent) {
    return (
      <Card className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-5 lg:p-6">
        <div className="flex items-center gap-3">
          <Twitch size={28} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
          <h2 className="m-0 font-bb-heading text-lg text-bb-text">Afficher les directs Twitch</h2>
        </div>
        <p className="m-0 leading-relaxed text-bb-text">
          Les directs et les vidéos de cet onglet viennent de Twitch. Pour les afficher, ton navigateur doit se connecter à
          Twitch, qui y dépose ses propres cookies (pour mesurer son audience et choisir ses publicités).
        </p>
        <p className="m-0 leading-relaxed text-bb-text-muted">
          BBFrance n&apos;en dépose aucun et ne voit rien de ce que Twitch enregistre. Tant que tu n&apos;acceptes pas,
          rien n&apos;est envoyé à Twitch.
        </p>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <Button
            type="button"
            variant="primary"
            size="tap"
            onClick={() => {
              if (remember) setTwitchConsent(true);
              setConsent(true);
            }}
          >
            Accepter et afficher Twitch
          </Button>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-bb-text-muted">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-[var(--bb-accent)]" />
            Retenir mon choix (6 mois)
          </label>
        </div>
        <details className="text-sm text-bb-text-muted">
          <summary className="min-h-11 cursor-pointer content-center font-semibold text-bb-text">Regarder directement sur twitch.tv</summary>
          <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
            {channels.map((channel) => (
              <li key={channel}>
                <a href={twitchPageUrl({ kind: "channel", id: channel })} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-bb-accent-text">
                  {channel} <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </details>
      </Card>
    );
  }

  // Directs et chaînes hors ligne : réponse de l'API, ou détection dans le navigateur
  const lives: TwitchLive[] = status
    ? status.live
    : (detectedLive ?? []).map((login) => ({ login, name: login, thumbnail: twitchLivePreview(login) }));
  const offline: TwitchOffline[] = status
    ? status.offline
    : channels.filter((c) => !(detectedLive ?? []).includes(c)).map((login) => ({ login, name: login, latest: null }));
  const detecting = !status && detectedLive === null;

  const items: CarouselItem[] = lives.map((live) => ({
    key: live.login,
    title: live.name,
    subtitle: live.title,
    meta: [live.game, live.viewers !== undefined ? `${live.viewers.toLocaleString("fr-FR")} spectateurs` : null].filter(Boolean).join(" · ") || undefined,
    thumbnail: live.thumbnail,
    playerSrc: twitchCarouselPlayerUrl(live.login, window.location.hostname),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Lecteurs cachés de la détection des directs (sans API) */}
      <div ref={detectionHolder} aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0 h-[180px] w-[320px] overflow-hidden opacity-0" />

      {detecting ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="aspect-video w-full lg:mx-auto lg:w-[64%]" />
          <p className="m-0 text-center text-sm text-bb-text-muted">Recherche des chaînes en direct…</p>
        </div>
      ) : items.length > 0 ? (
        <MediaCarousel items={items} label="Chaînes Twitch en direct" />
      ) : (
        <p className="m-0 rounded-bb-md border border-bb-border bg-bb-surface px-4 py-3 text-bb-text-muted">Aucune chaîne en direct pour l&apos;instant.</p>
      )}

      {!detecting && offline.length > 0 && (
        <section aria-labelledby="twitch-offline" className="flex flex-col gap-3">
          <h2 id="twitch-offline" className="m-0 font-bb-heading text-[0.95rem] text-bb-text">
            {status ? "Dernières vidéos et clips" : "Chaînes hors ligne"}
          </h2>
          <div className={status ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"}>
            {offline.map((channel) => (
              <OfflineCard key={channel.login} channel={channel} />
            ))}
          </div>
        </section>
      )}

      <p className="m-0 text-sm text-bb-text-muted">
        Twitch est affiché avec ton accord.{" "}
        <Button
          type="button"
          variant="quiet"
          className="h-auto min-h-11 p-0 align-baseline text-sm font-semibold text-bb-accent-text underline"
          onClick={() => {
            setTwitchConsent(false);
            setConsent(false);
          }}
        >
          Retirer mon accord
        </Button>
      </p>
    </div>
  );
}
