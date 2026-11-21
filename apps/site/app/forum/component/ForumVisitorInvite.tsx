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
import { X } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";

const DISMISS_KEY = "bbfrance_forum_visitor_banner_closed";

const loginHref = (callbackUrl: string) => `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

const title = "text-lg font-bold text-bb-text";

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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-bb-lg border border-bb-border border-l-[3px] border-l-bb-accent bg-bb-surface py-2 pr-2 pl-4" role="region" aria-label="Participer au forum">
      <p className="min-w-0 flex-1 text-[0.95rem] text-bb-text-muted">Tout se lit sans compte. Pour écrire, connecte-toi : le compte se crée en un clic.</p>
      <JoinButton callbackUrl="/forum" className="shrink-0" />
      <Button type="button" variant="quiet" size="tap-icon" aria-label="Masquer ce message" onClick={close} className="shrink-0">
        <X size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}

export function TopicVisitorInvite({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Card className="flex flex-col gap-3 border-l-[3px] border-l-bb-accent px-4 py-4 sm:flex-row sm:items-center sm:justify-between" role="region" aria-labelledby="topic-visitor-invite-title">
      <div className="flex flex-col gap-1">
        <h2 id="topic-visitor-invite-title" className={title}>
          Envie de répondre ?
        </h2>
        <p className="max-w-[60ch] text-[0.95rem] text-bb-text-muted">
          Connecte-toi pour participer. Pas encore de compte ? Il se crée en un clic avec Discord, Google ou un e-mail,
          et tu reviens ici ensuite.
        </p>
      </div>
      <JoinButton callbackUrl={callbackUrl} className="shrink-0 max-sm:w-full" />
    </Card>
  );
}
