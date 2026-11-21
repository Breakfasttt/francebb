/**
 * En-tête compact des listes du forum (refonte, carte 085) : titre, sous-titre discret et, à droite, des actions
 * facultatives. Sur téléphone, le bouton retour est à gauche du titre (carte 156 : plus de portail vers la barre
 * du haut) ; sur ordinateur, la navigation et le fil d'Ariane suffisent.
 */
import type { ReactNode } from "react";
import BackButton from "@/common/components/BackButton/BackButton";

interface ForumListHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Adresse du bouton retour du téléphone ; sans adresse, il revient à la page précédente. */
  backHref?: string;
  backTitle?: string;
  /** Revient à la page précédente quand elle fait partie du site, `backHref` sinon (voir `BackButton`, carte 196). */
  backPreferHistory?: boolean;
  children?: ReactNode;
}

export default function ForumListHeader({ title, subtitle, backHref, backTitle = "Retour", backPreferHistory, children }: ForumListHeaderProps) {
  return (
    <header className="flex flex-wrap items-end gap-3 pt-4 pb-4 lg:pt-6">
      {/* Page de premier niveau (retour vers l'accueil) : pas de flèche, la barre basse suffit */}
      {backHref !== "/" && <BackButton href={backHref} title={backTitle} preferHistory={backPreferHistory} className="self-center lg:hidden" />}
      <div className="min-w-0 flex-1">
        <h1 className="flex flex-wrap items-center gap-2 font-bb-display text-[1.75rem] text-bb-text lg:text-[2.25rem]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[0.95rem] text-bb-text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
