/**
 * Garde de la messagerie (carte 221) : la page est un composant navigateur, elle ne peut pas rediriger avant
 * l'affichage. Sans ce gabarit, un visiteur voyait « Pas encore de conversation » et un bouton « Nouvelle
 * conversation » qui ne menait à rien. Un visiteur est envoyé vers la connexion (avec retour ici), un banni vers
 * /banned (sinon la page de connexion, qui renvoie un membre déjà connecté, tournerait en boucle).
 */
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/authGuard";

export default async function MessagerieLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login?callbackUrl=/messagerie");
  if ((session.user as { isBanned?: boolean }).isBanned) redirect("/banned");
  return children;
}
