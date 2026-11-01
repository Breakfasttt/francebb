import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { Lock, MessageSquarePlus, Pin } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, Card, Label } from "@bbfrance/ui";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { createTopic } from "../actions";
import ActionForm from "@/common/components/Form/ActionForm";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import ComposeScreen, { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { parseInlineBBCode } from "@/lib/bbcode";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur

/**
 * Page de création d'un sujet classique (carte 087 : écran de rédaction plein écran sur téléphone, voir
 * ComposeScreen). Un forum de tournoi utilise /forum/new-tournament pour les annonces.
 * Sur ordinateur, une colonne « Publication » à droite porte les cases de modération et les boutons ; sur téléphone,
 * les cases passent sous le message et les boutons dans la barre collée en bas de l'écran.
 */
export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) notFound();

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: {
      category: true,
      parentForum: {
        include: { category: true }
      }
    }
  });

  if (!forum) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(forum, roles)) notFound();

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Nouveau sujet" });

  const cancelHref = `/forum/${forumId}`;
  const checkboxRow = "flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] text-bb-text";
  const checkbox = "size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]";

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title="Nouveau sujet"
      subtitle={<>Dans le forum : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></>}
      backHref={cancelHref}
      backTitle="Retour au forum"
    >
      <ActionForm action={createTopic} fallbackError="La création du sujet a échoué.">
        <input type="hidden" name="forumId" value={forumId} />

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Titre du sujet</Label>
              <TitleInputWithSmiley />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Message</Label>
              <BBCodeEditor id="content" name="content" placeholder="Tapez votre message ici... Utilisez les boutons ou les balises BBCode." rows={20} screen />
            </div>
          </div>

          {/* Colonne « Publication » (ordinateur) ; sur téléphone, seules les cases de modération restent ici */}
          <aside aria-label="Publication" className={userCanStick ? "" : "max-lg:hidden"}>
            <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
              <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
                <MessageSquarePlus size={18} aria-hidden="true" className="text-bb-accent-text" />
                Publication
              </h2>

              {userCanStick && (
                <div className="flex flex-col border-y border-bb-border py-1">
                  <label className={checkboxRow}>
                    <input type="checkbox" name="isSticky" value="on" className={checkbox} />
                    <Pin size={16} aria-hidden="true" className="text-bb-text-muted" />
                    <span>Épingler (Post-it)</span>
                  </label>
                  <label className={checkboxRow}>
                    <input type="checkbox" name="isLocked" value="on" className={checkbox} />
                    <Lock size={16} aria-hidden="true" className="text-bb-text-muted" />
                    <span>Verrouiller le sujet</span>
                  </label>
                </div>
              )}

              <div className="hidden flex-col gap-2 lg:flex">
                <Button type="submit" variant="primary" size="tap" className="w-full">
                  Créer le sujet
                </Button>
                <Button asChild variant="secondary" size="tap" className="w-full">
                  <Link href={cancelHref}>Annuler</Link>
                </Button>
              </div>
            </Card>
          </aside>
        </div>

        <ComposeActionBar className="lg:hidden">
          <Button asChild variant="secondary" size="tap">
            <Link href={cancelHref}>Annuler</Link>
          </Button>
          <Button type="submit" variant="primary" size="tap" className="flex-1">
            <MessageSquarePlus size={18} aria-hidden="true" /> Créer le sujet
          </Button>
        </ComposeActionBar>
      </ActionForm>
    </ComposeScreen>
  );
}
