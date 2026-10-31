import { Mail } from "lucide-react";
import Link from "next/link";
import { Button, Card } from "@bbfrance/ui";

/**
 * Page affichée après l'envoi d'un lien magique par email. Refonte (carte 091, ADR 0006) : une carte centrée,
 * avec seulement les composants et les couleurs v2 de packages/ui, lisible dans tous les thèmes.
 */
export default function VerifyRequestPage() {
  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <section aria-labelledby="verify-title" className="w-full max-w-md">
        <Card className="flex flex-col items-center gap-4 p-6 text-center lg:p-8">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-accent-soft text-bb-accent-text">
            <Mail size={34} />
          </span>

          <h1 id="verify-title" className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">
            Vérifiez votre boîte mail
          </h1>

          <p className="m-0 text-bb-text">Un lien de connexion vient de vous être envoyé par email.</p>
          <p className="m-0 text-bb-text-muted">
            Cliquez sur le lien contenu dans le message pour vous connecter instantanément.
          </p>

          <Button asChild variant="primary" size="tap" className="w-full">
            <Link href="/auth/login" className="no-underline">Retour à la connexion</Link>
          </Button>

          <p className="m-0 text-sm text-bb-text-muted">
            Si vous ne recevez rien, vérifiez vos messages indésirables (spams).
          </p>
        </Card>
      </section>
    </div>
  );
}
