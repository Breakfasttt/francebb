/**
 * En-tête compact des listes du forum (refonte, carte 085) : titre, sous-titre discret et, à droite, des actions
 * facultatives. Sur téléphone, le bouton retour est envoyé dans la barre du haut (emplacement
 * #mobile-back-button-slot), comme le faisait l'ancien PageHeader ; sur ordinateur, la navigation et le fil
 * d'Ariane suffisent.
 */
import type { ReactNode } from "react";
import BackButton from "@/common/components/BackButton/BackButton";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";

interface ForumListHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Adresse du bouton retour du téléphone ; sans adresse, il revient à la page précédente. */
  backHref?: string;
  backTitle?: string;
  children?: ReactNode;
}

export default function ForumListHeader({ title, subtitle, backHref, backTitle = "Retour", children }: ForumListHeaderProps) {
  return (
    <header className="flex flex-wrap items-end gap-3 pt-4 pb-4 lg:pt-6">
      <MobilePortal targetId="mobile-back-button-slot">
        <span className="lg:hidden">
          {/* 44 pixels pour le pouce (le bouton historique en fait 34) */}
          <BackButton href={backHref} title={backTitle} style={{ width: 44, height: 44 }} />
        </span>
      </MobilePortal>
      <div className="min-w-0 flex-1">
        <h1 className="m-0 flex flex-wrap items-center gap-2 border-0 p-0 text-2xl leading-tight font-bold tracking-normal text-bb-text normal-case not-italic">
          {title}
        </h1>
        {subtitle && <p className="m-0 mt-1 text-[0.95rem] text-bb-text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
