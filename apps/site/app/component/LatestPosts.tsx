"use client";

/**
 * Bloc « Derniers messages du forum » de l'accueil (carte 205).
 *
 * La page arrive avec la liste déjà calculée par le serveur. Ensuite, tant que l'onglet est visible, la liste redemande
 * les derniers messages toutes les `POLL_INTERVAL_MS` millisecondes (action `fetchLatestPosts`), comme la messagerie :
 * le site n'a pas d'envoi en direct depuis le serveur. Quand l'onglet redevient visible, elle se met à jour aussitôt.
 *
 * Un nouveau message entre en haut de la liste avec la courte apparition `bb-fade-in` (`app/globals.css`) ; avec le
 * réglage « réduire les animations » du téléphone, il n'y a plus de mouvement, seulement un fondu. Une seule zone
 * d'annonce (`role="status"`) prévient les lecteurs d'écran, avec une phrase complète, sans déplacer le focus.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRight, MessageSquare } from "lucide-react";
import { Avatar, cn } from "@bbfrance/ui";
import { fetchLatestPosts } from "@/app/homeActions";
import type { LatestPost } from "@/lib/homeLatestPosts";

/** Intervalle entre deux mises à jour de la liste, en millisecondes. */
const POLL_INTERVAL_MS = 30_000;

/** « à l'instant », « il y a 5 min », « il y a 3 h », puis la date (« 12 nov. »). */
function timeAgo(iso: string, now: number): string {
  const date = new Date(iso);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return format(date, "d MMM", { locale: fr });
}

export default function LatestPosts({ initialPosts, focusRing }: { initialPosts: LatestPost[]; focusRing: string }) {
  const [posts, setPosts] = useState(initialPosts);
  // Messages arrivés depuis le chargement de la page : eux seuls reçoivent l'animation d'entrée
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const knownIds = useRef(new Set(initialPosts.map((post) => post.id)));

  const refresh = useCallback(async () => {
    let next: LatestPost[];
    try {
      next = await fetchLatestPosts();
    } catch {
      // Réseau coupé ou serveur indisponible : on garde la liste affichée et on réessaiera au prochain tour
      return;
    }
    const arrived = next.filter((post) => !knownIds.current.has(post.id));
    for (const post of next) knownIds.current.add(post.id);
    setNow(Date.now());
    setPosts(next);
    if (arrived.length > 0) {
      setFreshIds(new Set(arrived.map((post) => post.id)));
      const first = arrived[0];
      setAnnouncement(
        arrived.length === 1
          ? `Nouveau message de ${first.authorName} dans « ${first.topicTitle} ».`
          : `${arrived.length} nouveaux messages sur le forum.`
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return (
    <section aria-labelledby="home-latest-posts" className="flex flex-col overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 lg:px-[22px] lg:pt-4">
        <h2 id="home-latest-posts" className="m-0 min-w-0 border-0 p-0 text-xl leading-tight font-extrabold text-bb-text normal-case not-italic">
          Derniers messages
        </h2>
        <Link href="/forum" className={cn("inline-flex min-h-11 shrink-0 items-center text-sm font-semibold whitespace-nowrap text-bb-accent-text no-underline", focusRing)}>
          Voir le forum
        </Link>
      </div>
      <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>

      {posts.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {posts.map((post) => (
            <li key={post.id} className={cn("border-t border-bb-border", freshIds.has(post.id) && "bb-fade-in")}>
              <Link
                href={`/forum/post/${post.id}`}
                className="flex items-start gap-3 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-[22px]"
              >
                <Avatar name={post.authorName} src={post.authorImage} size={36} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="line-clamp-1 text-base leading-snug font-bold break-words text-bb-text">{post.topicTitle}</span>
                  <span className="text-sm text-bb-text-muted">
                    {post.authorName} · <time dateTime={post.createdAt} suppressHydrationWarning>{timeAgo(post.createdAt, now)}</time>
                  </span>
                  {post.excerpt && <span className="line-clamp-2 text-sm leading-normal break-words text-bb-text">{post.excerpt}</span>}
                </span>
                <ChevronRight size={18} aria-hidden="true" className="mt-1 shrink-0 self-center text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 border-t border-bb-border px-4 py-6 text-center">
          <MessageSquare size={28} aria-hidden="true" className="text-bb-text-muted" />
          <p className="m-0 text-base font-bold text-bb-text">Aucun message pour l&apos;instant</p>
          <p className="m-0 max-w-[300px] text-sm leading-normal text-bb-text-muted">Lancez la discussion sur le forum.</p>
        </div>
      )}
    </section>
  );
}
