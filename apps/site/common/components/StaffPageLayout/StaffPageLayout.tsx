"use client";

/**
 * Mise en page des pages réservées à l'équipe du site, `/moderation` et `/administration` (refonte, carte 099) : le
 * titre, puis les onglets et le contenu de l'onglet ouvert.
 * - Sur ordinateur, les onglets forment une colonne à gauche : ils sont trop nombreux pour tenir sur une ligne.
 * - Sur téléphone, ils forment une rangée en haut de la page, qui défile de côté (avant la refonte, ils étaient
 *   rangés dans le panneau « Plus » de la barre du bas).
 * Chaque onglet est un lien (`?tab=…`) : l'adresse garde l'onglet ouvert, on peut la partager ou la rouvrir.
 */
import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Card, LinkTabs, Skeleton, type LinkTab } from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

/** Lien d'onglet sans retour en haut de la page : le contenu change juste à côté des onglets. */
function TabLink(props: ComponentProps<typeof Link>) {
  return <Link scroll={false} {...props} />;
}

interface StaffPageLayoutProps {
  title: string;
  subtitle: string;
  /** Nom de la liste des onglets, lu par les lecteurs d'écran (« Onglets de la modération »). */
  tabsLabel: string;
  tabs: LinkTab[];
  /** Nom de la zone de contenu (souvent le libellé de l'onglet ouvert). */
  contentLabel?: string;
  /** Session en cours de lecture : formes grises à la place des onglets et du contenu. */
  loading?: boolean;
  children?: ReactNode;
}

export default function StaffPageLayout({ title, subtitle, tabsLabel, tabs, contentLabel, loading, children }: StaffPageLayoutProps) {
  const phoneTabsRef = useRef<HTMLDivElement>(null);
  const activeHref = tabs.find((tab) => tab.active)?.href;

  // Sur téléphone, la rangée d'onglets défile jusqu'à l'onglet ouvert : sinon, un onglet de la fin de la liste
  // (« Coachs bannis »…) serait ouvert sans être visible dans la rangée.
  useEffect(() => {
    const row = phoneTabsRef.current?.querySelector("nav");
    const active = row?.querySelector<HTMLElement>("[aria-current=page]");
    if (!row || !active) return;
    const rowBox = row.getBoundingClientRect();
    const tabBox = active.getBoundingClientRect();
    row.scrollLeft += tabBox.left - rowBox.left - (rowBox.width - tabBox.width) / 2;
  }, [activeHref, loading]);

  // La place des notifications sous le contenu est réservée par la coquille (AppShell.css, --app-toast-space)
  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-6 font-bb-sans text-base text-bb-text lg:px-6 lg:pb-10">
      <ForumListHeader title={title} subtitle={subtitle} backHref="/" backTitle="Retour à l'accueil" />

      {loading ? (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6" aria-label="Chargement">
          <Skeleton className="h-11 w-full lg:h-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6">
          {/* Téléphone : rangée d'onglets en haut ; elle touche les bords de l'écran pour défiler de côté */}
          <div ref={phoneTabsRef} className="-mx-3 min-w-0 lg:hidden">
            <LinkTabs label={tabsLabel} tabs={tabs} linkComponent={TabLink} className="px-3" />
          </div>
          {/* Ordinateur : colonne d'onglets, qui reste visible quand on fait défiler le contenu */}
          <Card className="hidden p-2 lg:sticky lg:top-24 lg:block">
            <LinkTabs label={tabsLabel} tabs={tabs} orientation="vertical" linkComponent={TabLink} />
          </Card>
          <section aria-label={contentLabel} className="flex min-w-0 flex-col gap-4">
            {children}
          </section>
        </div>
      )}
    </div>
  );
}
