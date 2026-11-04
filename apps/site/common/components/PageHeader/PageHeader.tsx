/**
 * En-tête de page simple (refonte, carte 101) : titre qui domine, sous-titre discret, actions facultatives à droite.
 * Même allure que l'en-tête des listes du forum (ForumListHeader). Le bouton retour est à gauche du titre, à toutes
 * les tailles d'écran (carte 156 : plus de portail vers la barre du haut).
 * Utilisé par la page des mentions légales ; les écrans refaits ont chacun leur en-tête.
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
    <header className={cn("mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-3 px-4 pt-4 pb-2 lg:px-8 lg:pt-8", className)} style={style}>
      {showBack && (
        <BackButton href={backHref} title={backTitle} />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-2xl leading-tight font-bold text-bb-text lg:text-3xl">{title}</h1>
        {subtitle && <p className="m-0 mt-1 text-[0.95rem] text-bb-text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
