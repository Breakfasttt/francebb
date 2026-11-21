/**
 * En-tête de page simple (refonte, carte 101) : titre qui domine, sous-titre discret, actions facultatives à droite.
 * Même allure que l'en-tête des listes du forum (ForumListHeader). Le bouton retour est à gauche du titre, à toutes
 * les tailles d'écran (carte 156 : plus de portail vers la barre du haut).
 * Titre en voix Display (DESIGN.md). Le bouton retour n'apparaît que sur téléphone : sur ordinateur, la navigation suffit.
 */
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@bbfrance/ui";
import BackButton from "@/common/components/BackButton/BackButton";

interface PageHeaderProps {
  /** Le titre principal de la page */
  title: ReactNode;
  /** Un sous-titre optionnel */
  subtitle?: ReactNode;
  /** Le lien de retour. Si omis, utilisera router.back(). Si défini sur null, n'affiche pas de bouton. */
  backHref?: string | null;
  /** Titre au survol du BackButton */
  backTitle?: string;
  /** Style inline pour le header */
  style?: CSSProperties;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Contenu optionnel à afficher à droite, ou en dessous (boutons d'action, filtres) */
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, backHref, backTitle = "Retour", style, className, children }: PageHeaderProps) {
  const showBack = backHref !== null;
  return (
    <header className={cn("mx-auto flex w-full max-w-[1760px] flex-wrap items-center gap-3 px-3 pt-4 pb-3 lg:px-6 lg:pt-6 xl:px-8", className)} style={style}>
      {showBack && (
        <BackButton href={backHref} title={backTitle} className="lg:hidden" />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-bb-display text-[1.75rem] text-bb-text lg:text-[2.25rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.95rem] text-bb-text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
