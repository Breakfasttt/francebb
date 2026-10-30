/**
 * Page affichée à un membre banni : raison du bannissement et retour à l'accueil.
 * Couleurs : uniquement des variables de thème (lisible dans les 7 thèmes, y compris le thème clair).
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Ban } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import CTAButton from "@/common/components/Button/CTAButton";
import { redirect } from "next/navigation";
import "./page.css";
import "./page-mobile.css";

export const dynamic = "force-dynamic";

export default async function BannedPage() {
  const session = await auth();

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
    <div className="container banned-page">
      <PremiumCard className="banned-card">
        <div className="banned-icon-row">
          <div className="banned-icon">
            <Ban size={48} />
          </div>
        </div>
        <h1 className="banned-title">Compte banni</h1>
        <p className="banned-text">
          Votre compte a été suspendu par l’équipe de modération. Vous ne pouvez plus accéder aux fonctionnalités du site.
        </p>

        <div className="banned-reason">
          <h2>Raison du bannissement :</h2>
          <p>
            « {user.banReason || "Raison non spécifiée."} »
          </p>
        </div>

        <CTAButton href="/">
          Retour à l’accueil
        </CTAButton>
      </PremiumCard>
    </div>
  );
}
