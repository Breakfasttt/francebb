/**
 * Mise en page commune des écrans de rédaction du forum : répondre à un sujet, modifier un message, créer un sujet
 * (carte 087, ADR 0006).
 *
 * Sur téléphone, ces écrans occupent tout l'écran : la barre de navigation du bas n'y est pas affichée (voir
 * `isComposePath` dans common/components/AppShell/navItems.ts), la barre d'outils de l'éditeur reste collée en haut
 * et la barre d'envoi (« Annuler », « Publier… ») est collée en bas, à portée de pouce. Le bouton retour passe dans
 * la barre du haut du site. Sur ordinateur, le fil d'Ariane est affiché et les boutons sont sous l'éditeur.
 */
import type { ReactNode } from "react";
import { Avatar, Card, cn } from "@bbfrance/ui";
import { Clock } from "lucide-react";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import BackButton from "@/common/components/BackButton/BackButton";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import { parseBBCode } from "@/lib/bbcode";

interface ComposeScreenProps {
  breadcrumbs: { label: string; href?: string; isCategory?: boolean }[];
  title: string;
  /** Ligne sous le titre (« Sujet : … », « Dans le forum : … »). */
  subtitle: ReactNode;
  backHref: string;
  backTitle: string;
  children: ReactNode;
}

export default function ComposeScreen({ breadcrumbs, title, subtitle, backHref, backTitle, children }: ComposeScreenProps) {
  return (
    // En bas, sur téléphone : la place de la barre d'envoi collée en bas de l'écran
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] font-bb-sans text-base text-bb-text lg:px-6 lg:pb-10">
      <div className="hidden pt-4 lg:block">
        <ForumBreadcrumbs items={breadcrumbs} className="mb-0" />
      </div>

      <header className="flex items-start gap-3 pt-3 pb-3 lg:pt-5 lg:pb-4">
        {/* Téléphone : le bouton retour va dans la barre du haut ; ordinateur : il reste à gauche du titre */}
        <MobilePortal targetId="mobile-back-button-slot">
          <span className="lg:hidden">
            <BackButton href={backHref} title={backTitle} style={{ width: 44, height: 44 }} />
          </span>
        </MobilePortal>
        <span className="hidden shrink-0 lg:inline-flex">
          <BackButton href={backHref} title={backTitle} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 border-0 p-0 text-xl leading-tight font-bold tracking-normal break-words text-bb-text normal-case not-italic lg:text-2xl">{title}</h1>
          <p className="m-0 mt-1 text-sm break-words text-bb-text-muted">{subtitle}</p>
        </div>
      </header>

      {children}
    </div>
  );
}

/**
 * Barre d'envoi d'un écran de rédaction : collée en bas de l'écran sur téléphone (au-dessus de la zone protégée de
 * l'iPhone), alignée à droite sous l'éditeur sur ordinateur. L'attribut data-page-bottom-bar="always" fait monter les
 * notifications au-dessus d'elle, y compris pendant la saisie (variable --app-page-bar-space de AppShell.css).
 */
export function ComposeActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-page-bottom-bar="always"
      className={cn(
        "flex items-center gap-2",
        "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[4000] max-lg:border-t max-lg:border-bb-border max-lg:bg-bb-surface max-lg:px-3 max-lg:pt-2 max-lg:pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "lg:mt-4 lg:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

type RecapPost = { id: string; content: string; author: { name: string | null; image: string | null } };

/**
 * « Rappel des derniers messages » sous l'éditeur : les 3 derniers messages du sujet, coupés à quelques lignes.
 * Sur la page de modification, le message modifié est grisé et marqué « (Ce message) ».
 */
export function RecentPostsRecap({
  posts,
  quoteStatusMap,
  currentUserId,
  editingPostId,
}: {
  posts: RecapPost[];
  quoteStatusMap: Parameters<typeof parseBBCode>[1];
  currentUserId?: string;
  editingPostId?: string;
}) {
  return (
    <section aria-labelledby="recap-title" className="mt-8 lg:mt-10">
      <h2 id="recap-title" className="m-0 mb-3 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text-muted normal-case not-italic">
        <Clock size={18} aria-hidden="true" />
        Rappel des derniers messages
      </h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => {
          const isEditing = post.id === editingPostId;
          return (
            <Card key={post.id} className={cn("flex flex-col gap-2 p-3 lg:flex-row lg:gap-4 lg:p-4", isEditing && "border-dashed border-bb-accent-text opacity-60")}>
              <div className="flex shrink-0 items-center gap-2 lg:w-40 lg:flex-col lg:items-start">
                <Avatar name={post.author.name} src={post.author.image} size={32} />
                <p className="m-0 text-sm font-semibold break-words text-bb-text">
                  {post.author.name}
                  {isEditing && <span className="block text-xs font-normal text-bb-accent-text">(Ce message)</span>}
                </p>
              </div>
              <div
                className="max-h-24 min-w-0 flex-1 overflow-hidden text-[0.95rem] break-words text-bb-text-muted [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
                dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap, currentUserId) }}
              />
            </Card>
          );
        })}
      </div>
    </section>
  );
}
