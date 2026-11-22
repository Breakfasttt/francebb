/**
 * Coquille des pages (DESIGN.md, « Mise en page ») : la même grammaire sur tout le site.
 * - Ordinateur : panneau gauche (action principale + navigation de la rubrique, collé au défilement), contenu fluide,
 *   colonne de contexte à droite à partir de 1440 px. Toute la largeur est utilisée (bornée à 1760 px).
 * - Entre 1025 et 1439 px, la colonne de contexte passe sous le contenu.
 * - Téléphone : une colonne. Le panneau gauche est affiché sous le contenu (`asideOnMobile="bottom"`), au-dessus
 *   (`"top"`) ou pas du tout (`"hidden"`, la page affiche alors ses actions autrement) ; le contexte passe en dessous.
 * - Accueils (tableau de bord sans panneau gauche) : `contextSide="left"` met la colonne de contexte à gauche, comme le
 *   panneau gauche du reste du site ; sur téléphone, elle reste sous le contenu.
 */
import type { ReactNode } from "react";
import { cn } from "@bbfrance/ui";

interface SiteLayoutProps {
  /** En-tête de la page (PageTitle), sur toute la largeur au-dessus des colonnes */
  header?: ReactNode;
  /** Panneau gauche : action principale de la rubrique puis sa navigation */
  aside?: ReactNode;
  /** Libellé accessible du panneau gauche */
  asideLabel?: string;
  /** Place du panneau gauche sur téléphone */
  asideOnMobile?: "top" | "bottom" | "hidden";
  /** Colonne de contexte à droite (seulement si elle sert) */
  context?: ReactNode;
  contextLabel?: string;
  /** Largeur d'écran à partir de laquelle le contexte passe à droite : 1440 px par défaut, 1025 px (`"lg"`) pour un
   *  tableau de bord sans panneau gauche (accueils) */
  contextFrom?: "lg" | "xl";
  /** Côté de la colonne de contexte sur ordinateur (`"left"` : accueils, seulement sans panneau gauche) */
  contextSide?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export default function SiteLayout({
  header,
  aside,
  asideLabel = "Navigation de la rubrique",
  asideOnMobile = "bottom",
  context,
  contextLabel = "En ce moment",
  contextFrom = "xl",
  contextSide = "right",
  children,
  className,
}: SiteLayoutProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-bb-text lg:px-6 xl:px-8", className)}>
      {header}
      <div
        className={cn(
          "flex flex-col gap-5 lg:grid lg:items-start lg:gap-6 xl:gap-8",
          aside ? "lg:grid-cols-[240px_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)]",
          aside && context && "min-[1440px]:grid-cols-[240px_minmax(0,1fr)_300px]",
          !aside && context && contextFrom === "xl" && "min-[1440px]:grid-cols-[minmax(0,1fr)_300px]",
          !aside && context && contextFrom === "lg" && contextSide === "right" && "lg:grid-cols-[minmax(0,1fr)_320px] min-[1440px]:grid-cols-[minmax(0,1fr)_380px]",
          !aside && context && contextFrom === "lg" && contextSide === "left" && "lg:grid-cols-[320px_minmax(0,1fr)] min-[1440px]:grid-cols-[380px_minmax(0,1fr)]"
        )}
      >
        {aside && (
          <aside
            aria-label={asideLabel}
            className={cn(
              "flex flex-col gap-5 lg:sticky lg:top-20 lg:order-none lg:row-span-2",
              asideOnMobile === "top" && "order-first",
              asideOnMobile === "bottom" && "order-last",
              asideOnMobile === "hidden" && "max-lg:hidden"
            )}
          >
            {aside}
          </aside>
        )}
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
        {context && (
          <aside
            aria-label={contextLabel}
            className={cn(
              "flex min-w-0 flex-col gap-5",
              contextFrom === "xl" && "min-[1440px]:sticky min-[1440px]:top-20",
              !aside && contextSide === "left" && "lg:order-first"
            )}
          >
            {context}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Intitulé d'un groupe du panneau gauche ou de la colonne de contexte (voix Heading). */
export function PanelTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={cn("mb-1 font-bb-heading text-bb-label text-bb-text-muted", className)}>
      {children}
    </h2>
  );
}

/**
 * Lien de navigation du panneau gauche : une ligne, trait d'accent de 3 px à gauche quand il est actif, compteur
 * facultatif aligné à droite (chiffres tabulaires).
 */
export function PanelLink({
  href,
  active,
  count,
  children,
  linkComponent: LinkComponent,
}: {
  href: string;
  active?: boolean;
  count?: number | string;
  children: ReactNode;
  linkComponent: React.ElementType;
}) {
  return (
    <LinkComponent href={href} aria-current={active ? "page" : undefined} className={panelItemClass(active)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <span className="text-sm text-bb-text-muted tabular-nums">{count}</span>}
    </LinkComponent>
  );
}

/** Allure commune d'un élément du panneau gauche : trait d'accent de 3 px et voile quand il est actif. */
export function panelItemClass(active?: boolean) {
  return cn(
    "flex min-h-11 w-full items-center gap-2 border-l-[3px] py-1.5 pr-2 pl-3 text-left text-[0.95rem] no-underline",
    active
      ? "border-bb-accent-text bg-bb-accent-soft font-semibold text-bb-text"
      : "border-transparent text-bb-text-muted hover:border-bb-border hover:text-bb-text"
  );
}
