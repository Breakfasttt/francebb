/**
 * Page affichée à un membre banni : raison du bannissement et retour à l'accueil (refonte, carte 090, ADR 0006).
 * Une carte centrée, avec seulement les variables de couleur v2 : lisible dans tous les thèmes.
 */
import { getSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { Ban } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BannedPage() {
  // Session brute : getActiveSession() renverrait null pour un banni, or cette page lui est justement destinée.
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, banReason: true }
  });

  if (!user?.isBanned) {
    redirect("/");
  }

  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <section aria-labelledby="banned-title" className="w-full max-w-lg">
        <Card className="flex flex-col items-center gap-4 p-6 text-center lg:p-8">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-surface-2 text-bb-danger-text">
            <Ban size={36} />
          </span>
          <h1 id="banned-title" className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">
            Compte banni
          </h1>
          <p className="m-0 text-bb-text-muted">
            Votre compte a été suspendu par l’équipe de modération. Vous ne pouvez plus accéder aux fonctionnalités du site.
          </p>

          <div className="w-full rounded-bb-md border border-bb-border bg-bb-surface-2 p-4 text-left">
            <h2 className="m-0 border-0 p-0 text-sm font-bold text-bb-text-muted normal-case not-italic">Raison du bannissement</h2>
            <p className="m-0 mt-1 break-words text-bb-text">
              « {user.banReason || "Raison non spécifiée."} »
            </p>
          </div>

          <Button asChild variant="primary" size="tap" className="w-full sm:w-auto">
            <Link href="/" className="no-underline">Retour à l’accueil</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
