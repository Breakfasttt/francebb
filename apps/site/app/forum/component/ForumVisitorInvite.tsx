"use client";

/**
 * Invitations à participer, affichées seulement aux visiteurs non connectés (carte 185) :
 * - `ForumVisitorBanner` : court bandeau en haut de l'accueil du forum, qui explique ce qu'est BBFrance. Le visiteur
 *   peut le fermer ; ce choix est gardé dans le navigateur (localStorage), et le bandeau ne revient plus.
 * - `TopicVisitorInvite` : encart « Envie de participer ? » en bas d'un sujet, à la place de la zone de réponse. Il ne
 *   se ferme pas : c'est le seul moyen visible de répondre.
 * Le bouton mène à la page de connexion avec l'adresse de retour dans `?callbackUrl=` (le seul nom que lit
 * `/auth/login`) : après la connexion ou la création du compte, le visiteur revient là où il était.
 */
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { MessageSquare, X } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";

const DISMISS_KEY = "bbfrance_forum_visitor_banner_closed";

const loginHref = (callbackUrl: string) => `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

const title = "m-0 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic";

/** Bouton commun aux deux invitations. */
function JoinButton({ callbackUrl, className }: { callbackUrl: string; className?: string }) {
  return (
    <Button asChild variant="primary" size="tap" className={className}>
      <Link href={loginHref(callbackUrl)}>Se connecter ou créer un compte</Link>
    </Button>
  );
}

/** Lecture du choix « bandeau fermé » ; un stockage indisponible (navigation privée, cookies bloqués) vaut « non ». */
function readClosed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Composants à prévenir quand le visiteur ferme le bandeau (useSyncExternalStore relit alors le stockage). */
const listeners = new Set<() => void>();
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

export function ForumVisitorBanner() {
  // Côté serveur, le bandeau est affiché (pas de saut de mise en page pour un nouveau visiteur) ; dans le navigateur,
  // il disparaît s'il a déjà été fermé
  const closedStored = useSyncExternalStore(subscribe, readClosed, () => false);
  const [closedNow, setClosedNow] = useState(false);

  if (closedStored || closedNow) return null;

  const close = () => {
    setClosedNow(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Stockage indisponible : le bandeau est masqué pour cette visite seulement
    }
    listeners.forEach((listener) => listener());
  };

  return (
    <Card className="relative flex flex-col gap-3 border-bb-accent px-4 py-4 pr-14" role="region" aria-labelledby="forum-visitor-banner-title">
      <h2 id="forum-visitor-banner-title" className={title}>
        Bienvenue sur BBFrance
      </h2>
      <p className="m-0 text-[0.95rem] text-bb-text-muted">
        Le site de la communauté française de Blood Bowl : on y parle du jeu, de ses équipes et de ses tournois. Tout se
        lit sans compte ; pour écrire, un compte se crée en un appui avec Discord, Google ou une adresse e-mail.
      </p>
      <JoinButton callbackUrl="/forum" className="self-start max-sm:w-full" />
      <Button type="button" variant="quiet" size="tap-icon" aria-label="Masquer ce message de bienvenue" onClick={close} className="absolute top-1 right-1">
        <X size={20} aria-hidden="true" />
      </Button>
    </Card>
  );
}

export function TopicVisitorInvite({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-4 py-6 text-center" role="region" aria-labelledby="topic-visitor-invite-title">
      <MessageSquare size={28} aria-hidden="true" className="text-bb-accent-text" />
      <h2 id="topic-visitor-invite-title" className={title}>
        Envie de participer ?
      </h2>
      <p className="m-0 max-w-[50ch] text-[0.95rem] text-bb-text-muted">
        Connectez-vous pour répondre à ce sujet. Pas encore de compte ? Il se crée en un appui avec Discord, Google ou
        une adresse e-mail, et vous revenez ici ensuite.
      </p>
      <JoinButton callbackUrl={callbackUrl} className="max-sm:w-full" />
    </Card>
  );
}
