import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";

/**
 * Page d'erreur de la connexion, ouverte par Auth.js avec le code de l'erreur dans le paramètre `error`.
 * Refonte (carte 091, ADR 0006) : une carte centrée, avec les composants et les couleurs v2 de packages/ui.
 * Les messages et le code affiché sont ceux d'avant.
 */
export default async function AuthErrorPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  const getErrorMessage = (err?: string) => {
    switch (err) {
      case "Configuration":
        return "Il y a un problème avec la configuration du serveur d'authentification.";
      case "AccessDenied":
        return "L'accès vous a été refusé.";
      case "Verification":
        return "Le lien magique a expiré ou a déjà été utilisé.";
      case "EmailNotVerified":
        // Carte 160 : Discord ou Google indique que l'adresse du compte n'a pas été confirmée
        return "L'adresse e-mail de ce compte n'est pas encore confirmée chez Discord ou Google. Confirmez-la chez eux, puis réessayez.";
      default:
        return "Une erreur inattendue est survenue lors de l'authentification.";
    }
  };

  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <section aria-labelledby="auth-error-title" className="w-full max-w-md">
        <Card className="flex flex-col items-center gap-4 p-6 text-center lg:p-8">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-surface-2 text-bb-danger-text">
            <AlertCircle size={36} />
          </span>

          <h1 id="auth-error-title" className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">
            Erreur d&apos;authentification
          </h1>

          <div className="flex w-full flex-col gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 p-4">
            <p className="m-0 text-bb-text">{getErrorMessage(error)}</p>
            {/* Code technique de l'erreur, utile si le membre la signale */}
            {error && <code className="text-sm break-all text-bb-text-muted">ID Erreur: {error}</code>}
          </div>

          <Button asChild variant="primary" size="tap" className="w-full">
            <Link href="/auth/login" className="no-underline">
              <ChevronLeft size={18} aria-hidden="true" />
              Retour à la page de connexion
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
