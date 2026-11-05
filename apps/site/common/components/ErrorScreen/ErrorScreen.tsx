"use client";

/**
 * Écran affiché quand une page plante (carte 188), dans le style de la page introuvable (app/not-found.tsx) : une
 * carte centrée, un titre de terrain de Blood Bowl, « Réessayer » et « Retour à l'accueil ». Utilisé par
 * app/error.tsx (erreur dans une page, la coquille du site reste affichée) et app/global-error.tsx (erreur dans la
 * mise en page générale, l'écran remplace alors tout le site).
 */
import Link from "next/link";
import { CloudLightning } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";

interface ErrorScreenProps {
  /** Relance le calcul de la page (fonction fournie par Next.js à l'écran d'erreur) */
  onRetry: () => void;
  /** Identifiant de l'erreur noté dans les journaux du serveur, pour que l'équipe la retrouve */
  digest?: string;
}

export default function ErrorScreen({ onRetry, digest }: ErrorScreenProps) {
  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <Card role="alert" className="flex w-full max-w-lg flex-col items-center gap-4 p-6 text-center lg:p-8">
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-accent-soft text-bb-accent-text">
          <CloudLightning size={36} strokeWidth={1.5} />
        </span>
        <div>
          <p className="m-0 text-sm font-bold tracking-wide text-bb-accent-text">Un problème est survenu</p>
          <h1 className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">Match interrompu par l&apos;orage !</h1>
        </div>
        <p className="m-0 text-bb-text-muted">
          Cette page n&apos;a pas pu s&apos;afficher. Ce n&apos;est pas de votre faute : réessayez dans un instant.
          Si le problème continue, revenez un peu plus tard.
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button type="button" variant="primary" size="tap" className="w-full sm:w-auto" onClick={onRetry}>
            Réessayer
          </Button>
          <Button asChild variant="secondary" size="tap" className="w-full sm:w-auto">
            <Link href="/" className="no-underline">Retour à l&apos;accueil</Link>
          </Button>
        </div>
        {digest && (
          <p className="m-0 text-xs text-bb-text-muted">
            Référence de l&apos;erreur, à donner à l&apos;équipe si besoin : {digest}
          </p>
        )}
      </Card>
    </div>
  );
}
