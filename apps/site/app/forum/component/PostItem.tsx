"use client";

/**
 * Un message d'un sujet du forum (refonte, carte 086), repéré par l'ancre id="post-<id>".
 *
 * - En-tête compact : avatar avec son cadre de rang (40 pixels sur téléphone, 48 sur ordinateur), pseudo, badge de
 *   rang, puis une ligne discrète « rôle · date · #N » (et « modifié le … »). Un appui sur l'avatar ou le pseudo ouvre
 *   la « fiche coach » (PostAuthorSheet) avec les statistiques de l'auteur et les boutons Profil et MP.
 * - À droite, le bouton « ⋯ » (PostMoreMenu) regroupe les actions rares : partager, signaler, marquer comme non lu,
 *   modifier, supprimer, modérer ou restaurer.
 * - Corps du message en 16 pixels, largeur de lecture limitée à environ 70 caractères ; citations sur fond de surface ;
 *   signature séparée par un filet.
 * - Sous le message, toujours visibles : les réactions et le bouton « Citer » (PostActions). Un passage sélectionné
 *   dans le corps d'un message citable peut aussi être cité seul (QuoteSelectionButton, carte 183).
 * - Message supprimé (carte 165) : la mention dit qui l'a supprimé, son auteur ou la modération (avec la raison).
 * - États conservés : message supprimé, auteur bloqué ou banni (masqué, avec « Afficher le message »), message modéré,
 *   premier message d'un tournoi mis en valeur sur les pages suivantes.
 */
import React, { useState } from "react";
import { Ban, Eye, EyeOff, Info, Shield } from "lucide-react";
import { Badge, Button, cn } from "@bbfrance/ui";
import UserAvatar, { RANK_LABELS, resolveRank, type Rank } from "@/common/components/UserAvatar/UserAvatar";
import BBCodeContent from "@/common/components/BBCodeContent/BBCodeContent";
import { getRoleLabel, isModerator } from "@/lib/roles";
import PostActions from "./PostActions";
import PostMoreMenu from "./PostMoreMenu";
import PostAuthorSheet, { type PostAuthor } from "./PostAuthorSheet";
import { SplitPostCheckbox } from "./TopicTools";
import { postDeletedBy } from "@/lib/forumDeletion";
import type { QuoteStatusMap } from "@/lib/bbcode";

/**
 * Un message tel que la page du sujet le confie à ce composant. Le texte (`content`) est déjà vidé quand le lecteur
 * n'a pas le droit de le lire, et l'auteur ne contient que les champs affichés (voir lib/forumPostPrivacy.ts).
 */
export interface TopicPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  /** Membre qui a supprimé le message (carte 165) : différent de l'auteur quand c'est la modération. */
  deletedById?: string | null;
  /** Raison donnée par la modération quand elle a supprimé le message. */
  deletionReason?: string | null;
  isModerated: boolean;
  moderationReason: string | null;
  moderator: { name: string | null } | null;
  reactions: { emoji: string; userId: string }[];
  author: PostAuthor & { role: string; signature?: string | null };
}

interface PostItemProps {
  // Message lu par la page serveur, avec son auteur (ligues, nombre de messages), son modérateur et ses réactions
  post: TopicPost;
  index: number;
  topicId: string;
  currentUserId?: string;
  isUserModerator: boolean;
  quoteStatusMap: QuoteStatusMap;
  safeCurrentPage: number;
  regionLabels: Record<string, string>;
  // Libellés des rôles personnalisés (nom du rôle -> libellé), chargés une seule fois par la page sujet
  roleLabels?: Record<string, string>;
  isFirstPostAlwaysVisible?: boolean;
  isTournament?: boolean;
  tournamentId?: string;
  firstPostId?: string;
  isBlocked?: boolean;
  // Faux quand le membre ne peut pas répondre (sujet ou forum verrouillé) : le bouton « Citer » est alors masqué
  canReply?: boolean;
  // Le sujet a d'autres messages que le premier : l'auteur ne peut alors plus supprimer le premier (carte 165)
  topicHasReplies?: boolean;
}

/** Date et heure à la française, comme avant la refonte (« 12 mars 2026 à 10:00 »). */
const longDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Mise en forme du corps du message. Les citations, produites par lib/bbcode.ts avec des styles écrits dans la balise,
 * passent sur un encadré de surface : d'où les « ! » (priorité forte).
 */
const bodyClass =
  "text-base leading-[1.6] text-bb-text break-words [&_blockquote]:bg-bb-surface-2! [&_blockquote]:not-italic! [&_blockquote]:text-bb-text! [&_blockquote]:border-bb-border!";

const PostItem: React.FC<PostItemProps> = ({
  post,
  index,
  topicId,
  currentUserId,
  isUserModerator,
  quoteStatusMap,
  safeCurrentPage,
  regionLabels,
  roleLabels = {},
  isFirstPostAlwaysVisible = false,
  isTournament = false,
  tournamentId,
  firstPostId,
  isBlocked = false,
  canReply = true,
  topicHasReplies = true,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const author = post.author;
  const isBannedAuthor = !!author.isBanned;
  const isAuthorModerator = isModerator(author.role);
  const postCount = author._count?.posts || 0;
  const rank = resolveRank(postCount, author.avatarFrame as Rank | null, isAuthorModerator);
  const rankLabel = RANK_LABELS[rank];
  const roleLabel = roleLabels[author.role] ?? getRoleLabel(author.role || "COACH");
  const name = author.name || "Coach";
  const isEdited = new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime() + 1000;
  const isHidden = (isBlocked || isBannedAuthor) && !isRevealed;
  const isFirstTournamentPost = isTournament && post.id === firstPostId;
  const deletedBy = postDeletedBy(post);
  const openAuthor = () => setAuthorOpen(true);
  // Même règle que le bouton « Citer » : le coach peut répondre et le message n'est pas masqué (carte 164)
  const isQuotable = !!currentUserId && canReply && !post.isModerated;

  const avatar = (size: number) => (
    <UserAvatar
      image={author.image}
      name={author.name}
      postCount={postCount}
      size={size}
      isBanned={isBannedAuthor}
      selectedRank={author.avatarFrame as Rank | null}
      isModerator={isAuthorModerator}
    />
  );

  return (
    <article
      id={`post-${post.id}`}
      aria-label={`Message #${index + 1} de ${name}`}
      className={cn(
        "scroll-mt-20 rounded-bb-lg border bg-bb-surface text-bb-text",
        isFirstPostAlwaysVisible ? "border-2 border-bb-accent" : "border-bb-border"
      )}
    >
      {/* En-tête : avatar, pseudo et rang, ligne discrète, menu « ⋯ » */}
      <header className="flex items-start gap-2.5 px-3 pt-3 lg:gap-3 lg:px-5 lg:pt-4">
        {/* L'avatar ouvre aussi la fiche ; le pseudo (ci-dessous) porte le nom lu par les lecteurs d'écran */}
        <Button type="button" variant="quiet" tabIndex={-1} aria-hidden="true" onClick={openAuthor} className="shrink-0 rounded-full p-0 hover:bg-transparent">
          <span className="lg:hidden">{avatar(40)}</span>
          <span className="hidden lg:block">{avatar(48)}</span>
        </Button>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1 lg:pt-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Button
              type="button"
              variant="quiet"
              aria-label={`Voir la fiche de ${name}`}
              onClick={openAuthor}
              className="-my-2.5 min-h-11 max-w-full justify-start rounded-bb-sm px-0 text-base font-bold whitespace-normal text-bb-text hover:bg-transparent hover:underline"
            >
              <span className="min-w-0 break-words">{name}</span>
            </Button>
            {rankLabel && <Badge variant="rank">{rankLabel}</Badge>}
            {isFirstPostAlwaysVisible && <Badge variant="outline">Premier message</Badge>}
          </div>
          <p className="m-0 text-[0.8125rem] leading-snug text-bb-text-muted">
            {roleLabel}
            <span aria-hidden="true"> · </span>
            <time dateTime={new Date(post.createdAt).toISOString()}>{longDate(post.createdAt)}</time>
            <span aria-hidden="true"> · </span>
            <span>#{index + 1}</span>
            {isEdited && (
              <>
                <span aria-hidden="true"> · </span>
                <span>modifié le {longDate(post.updatedAt)}</span>
              </>
            )}
          </p>
        </div>

        {/* Mode « scission » d'un modérateur (carte 169) : case pour choisir ce message */}
        {!isFirstPostAlwaysVisible && <SplitPostCheckbox postId={post.id} isFirstPost={index === 0} />}

        <PostMoreMenu
          postId={post.id}
          topicId={topicId}
          page={safeCurrentPage}
          authorId={post.authorId}
          authorName={author.name || ""}
          currentUserId={currentUserId}
          isModerator={isUserModerator}
          isModerated={!!post.isModerated}
          showContentActions={!post.isDeleted && !isHidden}
          isDeletedByModeration={deletedBy === "moderation"}
          // `index` compte depuis le début du sujet : 0 est son premier message, quelle que soit la page
          isFirstPost={index === 0}
          topicHasReplies={topicHasReplies}
          isTournament={isTournament || isFirstPostAlwaysVisible}
          editHref={isFirstTournamentPost && tournamentId ? `/forum/edit-tournament/${tournamentId}` : `/forum/post/${post.id}/edit`}
          editLabel={isFirstTournamentPost ? "Modifier le tournoi" : "Modifier"}
        />
      </header>

      <div className="px-3 pt-2 pb-3 lg:pr-6 lg:pb-4 lg:pl-[92px]">
        {post.isDeleted ? (
          <p className="m-0 rounded-bb-md bg-bb-surface-2 px-3 py-4 text-center text-sm text-bb-text-muted italic">
            {deletedBy === "moderation"
              ? `Ce message a été supprimé par la modération${post.deletionReason ? `, raison : ${post.deletionReason}` : ""}`
              : "Ce message a été supprimé par son auteur"}
          </p>
        ) : isHidden ? (
          <div className="flex flex-col items-center gap-3 rounded-bb-md border border-dashed border-bb-border bg-bb-surface-2 px-4 py-6 text-center">
            <span aria-hidden="true" className={isBannedAuthor ? "text-bb-danger-text" : "text-bb-text-muted"}>
              {isBannedAuthor ? <Ban size={28} /> : <EyeOff size={28} />}
            </span>
            <h3 className="m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              {isBannedAuthor ? `Coach banni : ${author.name}` : `Utilisateur bloqué : ${author.name}`}
            </h3>
            <p className="m-0 max-w-[60ch] text-sm text-bb-text-muted">
              {isBannedAuthor
                ? "Ce membre a été banni de la plateforme BBFrance. Ses messages sont masqués par défaut pour protéger la sérénité du forum."
                : "Ce contenu est masqué car vous avez bloqué cet utilisateur. Vous pouvez le gérer dans votre gestion de compte."}
            </p>
            <Button type="button" variant="secondary" size="tap" onClick={() => setIsRevealed(true)}>
              <Eye size={18} aria-hidden="true" /> Afficher le message
            </Button>
          </div>
        ) : (
          <>
            {post.isModerated && (
              <p className="m-0 mb-3 flex items-start gap-2 rounded-bb-md border border-bb-danger-text px-3 py-2 text-sm text-bb-danger-text">
                <Shield size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>
                  Ce message a été modéré par {post.moderator?.name || "un modérateur"}, raison : {post.moderationReason}
                </span>
              </p>
            )}

            {!post.isModerated || isUserModerator || currentUserId === post.authorId ? (
              <div className="max-w-[70ch]">
                {post.isModerated && (
                  <p className="m-0 mb-2 text-xs text-bb-text-muted italic">[Contenu original visible par vous seul et les modérateurs]</p>
                )}
                {(isBlocked || isBannedAuthor) && isRevealed && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-bb-md bg-bb-surface-2 px-3 py-1 text-xs font-semibold text-bb-text-muted">
                    <Info size={14} aria-hidden="true" />
                    <span className="flex-1">
                      {isBannedAuthor ? "AFFICHAGE TEMPORAIRE (COACH BANNI)" : "AFFICHAGE TEMPORAIRE (UTILISATEUR BLOQUÉ)"}
                    </span>
                    <Button type="button" variant="quiet" size="tap" onClick={() => setIsRevealed(false)} className="text-xs">
                      Masquer à nouveau
                    </Button>
                  </div>
                )}
                {/* Un message citable porte ces attributs : le bouton « Citer la sélection » (QuoteSelectionButton,
                    carte 183) ne s'affiche que pour un passage sélectionné ici, signature exclue */}
                <div {...(isQuotable ? { "data-quote-post-id": post.id, "data-author-id": post.authorId, "data-author-name": author.name || "" } : {})}>
                  <BBCodeContent
                    content={post.content}
                    quoteStatusMap={quoteStatusMap}
                    currentUserId={currentUserId}
                    className={cn(bodyClass, post.isModerated && "opacity-70")}
                  />
                </div>

                {author.signature && (
                  <div className="mt-4 border-t border-bb-border pt-3">
                    <BBCodeContent content={author.signature} currentUserId={currentUserId} className="text-sm leading-normal text-bb-text-muted" />
                  </div>
                )}
              </div>
            ) : (
              <p className="m-0 rounded-bb-md bg-bb-surface-2 px-3 py-4 text-center text-sm text-bb-text-muted italic">
                Le contenu de ce message a été masqué par la modération.
              </p>
            )}

            <PostActions
              postId={post.id}
              authorId={post.authorId}
              authorName={author.name || ""}
              content={post.content}
              initialReactions={post.reactions}
              currentUserId={currentUserId}
              topicId={topicId}
              // Un message masqué par la modération ne se cite pas, même par un modérateur : la citation recopierait
              // le texte caché dans un message visible de tous (carte 164)
              canQuote={canReply && !post.isModerated}
              canReact={canReply}
            />
          </>
        )}
      </div>

      <PostAuthorSheet
        open={authorOpen}
        onOpenChange={setAuthorOpen}
        author={author}
        roleLabel={roleLabel}
        rankLabel={rankLabel}
        regionLabel={author.region ? regionLabels[author.region] : undefined}
        isAuthorModerator={isAuthorModerator}
        currentUserId={currentUserId}
      />
    </article>
  );
};

export default PostItem;
