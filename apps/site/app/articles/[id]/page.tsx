/**
 * Page d'un article `/articles/[id]` (refonte, carte 095, ADR 0006).
 * Une seule colonne de lecture, centrée, sur ordinateur comme sur téléphone :
 * - en tête, les tags, le titre qui domine, puis l'auteur (avatar et lien vers son profil), la date de publication et
 *   le nombre de vues, et les actions (« Modifier » et le menu « ⋯ » de `ArticleActions`) ;
 * - l'avis de modération, s'il y a lieu ;
 * - le texte, limité à environ 70 caractères par ligne avec un interligne de 1,6 pour un confort de lecture ;
 * - les réactions émoji.
 * Un article modéré n'est lisible que par son auteur et par la modération ; les autres lecteurs voient seulement
 * l'avis de modération. Le compteur de vues (`ViewCounter`) est inchangé.
 * Avant la refonte, l'auteur, les informations et les actions étaient dans une colonne à gauche du texte.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, EyeOff, ShieldAlert } from "lucide-react";
import { Badge, Card } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { parseBBCode } from "@/lib/bbcode";
import { isModerator } from "@/lib/roles";
import BackButton from "@/common/components/BackButton/BackButton";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import UserAvatar, { type Rank } from "@/common/components/UserAvatar/UserAvatar";
import ArticleActions from "./component/ArticleActions";
import ArticleReactions from "./component/ArticleReactions";
import ViewCounter from "./component/ViewCounter";
// Styles des blocs BBCode (accordéons, spoilers, galeries) du texte, comme dans les sujets du forum
import "@/app/forum/page.css";

export const dynamic = "force-dynamic";

/**
 * Mise en forme du texte converti depuis le BBCode : liens soulignés, gras, images à la largeur de la colonne,
 * paragraphes et listes aérés. Les blocs particuliers (citations, spoilers…) gardent leurs propres styles.
 */
const proseClass =
  "text-[1.0625rem] leading-[1.6] break-words text-bb-text [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:pl-6";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getActiveSession();
  const sessionUser = session?.user;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        include: {
          _count: { select: { posts: true } }
        }
      },
      tags: true,
      reactions: {
        include: { user: { select: { name: true } } }
      },
      moderator: { select: { name: true } }
    }
  });

  if (!article) notFound();

  const isAuthor = sessionUser?.id === article.authorId;
  const isMod = isModerator(sessionUser?.role);
  const canEdit = isAuthor || isMod;
  const canRead = !article.isModerated || isMod || isAuthor;

  const createdAt = new Date(article.createdAt);
  const formattedDate = format(createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <div className="mx-auto w-full max-w-[860px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ViewCounter articleId={id} />

      {/* Téléphone : bouton retour dans la barre du haut ; ordinateur : lien vers la liste au-dessus de l'article */}
      <MobilePortal targetId="mobile-back-button-slot">
        <span className="lg:hidden">
          <BackButton href="/articles" title="Retour aux articles" style={{ width: 44, height: 44 }} />
        </span>
      </MobilePortal>
      <div className="hidden pt-4 lg:block">
        <Link href="/articles" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-bb-accent-text no-underline hover:underline">
          <ChevronLeft size={16} aria-hidden="true" />
          Tous les articles
        </Link>
      </div>

      <article className="flex flex-col gap-4 pt-3 lg:pt-1">
        <header className="flex flex-col gap-3">
          {article.tags.length > 0 && (
            <ul aria-label="Tags" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {article.tags.map((tag) => (
                <li key={tag.id}>
                  <Badge variant="outline">{tag.name}</Badge>
                </li>
              ))}
            </ul>
          )}
          <h1 className="m-0 border-0 p-0 text-[1.75rem] leading-tight font-bold tracking-normal break-words text-bb-text normal-case not-italic lg:text-4xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bb-border pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                image={article.author.image}
                name={article.author.name}
                size={44}
                postCount={article.author._count?.posts || 0}
                selectedRank={article.author.avatarFrame as Rank}
                isModerator={isModerator(article.author.role)}
              />
              <div className="flex min-w-0 flex-col">
                <Link
                  href={`/spy/${article.authorId}`}
                  className="flex min-h-11 min-w-0 items-center self-start font-semibold text-bb-text no-underline hover:text-bb-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-bb-focus"
                >
                  <span className="min-w-0 truncate">{article.author.name}</span>
                </Link>
                <p className="m-0 -mt-1.5 text-sm text-bb-text-muted">
                  <span>Publié le {formattedDate}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{article.views} vue{article.views > 1 ? "s" : ""}</span>
                </p>
              </div>
            </div>
            <ArticleActions
              articleId={article.id}
              articleTitle={article.title}
              authorName={article.author.name || "Inconnu"}
              isModerated={article.isModerated}
              canEdit={canEdit}
              canModerate={isMod}
              canReport={!!sessionUser && !isAuthor}
            />
          </div>
        </header>

        {article.isModerated && (
          <Card role="note" className="flex flex-col gap-2 border-bb-danger-text p-4">
            <p className="m-0 flex items-center gap-2 font-bold text-bb-danger-text">
              <ShieldAlert size={20} aria-hidden="true" />
              Article modéré par l&apos;équipe
            </p>
            <p className="m-0 text-[0.95rem] text-bb-text">
              Raison : {article.moderationReason || "Cet article a été modéré par un membre de l'équipe."}
            </p>
            {article.moderator && <p className="m-0 text-sm text-bb-text-muted">Par {article.moderator.name}</p>}
            {canRead && (
              <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-bb-text-muted">
                <EyeOff size={16} aria-hidden="true" />
                Contenu original visible par vous seul et les modérateurs.
              </p>
            )}
          </Card>
        )}

        {canRead ? (
          // Texte de l'article (BBCode converti en HTML) ; atténué quand il est modéré
          <div
            className={`${proseClass} max-w-[70ch] ${article.isModerated ? "opacity-60" : ""}`}
            dangerouslySetInnerHTML={{ __html: parseBBCode(article.content, undefined, sessionUser?.id) }}
          />
        ) : (
          <Card className="px-4 py-10 text-center text-bb-text-muted italic">
            Le contenu de cet article a été masqué par la modération.
          </Card>
        )}

        <div className="border-t border-bb-border pt-4">
          <ArticleReactions articleId={article.id} reactions={article.reactions} currentUserId={sessionUser?.id} />
        </div>
      </article>
    </div>
  );
}
