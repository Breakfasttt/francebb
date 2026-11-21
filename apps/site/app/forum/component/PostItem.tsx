"use client";

/**
 * Un message d'un sujet du forum (refonte, carte 086), repéré par l'ancre id="post-<id>".
 *
 * - Chaque message est un bloc net (DESIGN.md, « Le forum »). Sur ordinateur, l'auteur est dans une colonne à gauche du
 *   texte (avatar 80 px avec son cadre de rang, pseudo, rang, rôle, nombre de messages, ligue, région) ; sur téléphone,
 *   il tient sur une ligne compacte en tête du message. Le bandeau du message montre la date et l'heure exactes et
 *   le numéro (lien permanent). Un appui sur l'avatar ou le pseudo ouvre la « fiche coach » (PostAuthorSheet).
 * - À droite, le bouton « ⋯ » (PostMoreMenu) regroupe les actions rares : partager, signaler, marquer comme non lu,
 *   modifier, supprimer, modérer ou restaurer.
 * - Corps du message en 16 pixels, largeur de lecture limitée à environ 70 caractères ; citations sur fond de surface ;
 *   signature séparée par un filet. Sur téléphone, la signature est repliée derrière un bouton « Voir la signature »
 *   (carte 190) : sur un sujet de vingt messages, les signatures dépliées font beaucoup à faire défiler.
 * - Sous le message, toujours visibles : les réactions et le bouton « Citer » (PostActions). Un passage sélectionné
 *   dans le corps d'un message citable peut aussi être cité seul (QuoteSelectionButton, carte 183).
 * - Message supprimé (carte 165) : la mention dit qui l'a supprimé, son auteur ou la modération (avec la raison).
 * - États conservés : message supprimé, auteur bloqué ou banni (masqué, avec « Afficher le message »), message modéré,
 *   premier message d'un tournoi mis en valeur sur les pages suivantes.
 */
import React, { useState } from "react";
import { Ban, ChevronDown, Eye, EyeOff, Info, Shield } from "lucide-react";
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
  /** Le membre peut modifier ou supprimer ce message (calculé par la page avec lib/forumRights.ts, carte 200). */
  canEdit?: boolean;
  // Le sujet a d'autres messages que le premier : l'auteur ne peut alors plus supprimer le premier (carte 165)
  topicHasReplies?: boolean;
}

/**
 * Date et heure exactes d'un message, toujours visibles (DESIGN.md) : « 21/11/2026 à 14:32 », à l'heure de Paris
 * (le serveur peut tourner à l'heure universelle).
 */
const exactDate = (date: Date | string) => {
  const value = new Date(date);
  const day = value.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  const time = value.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
  return `${day} à ${time}`;
};

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
  canEdit = false,
  topicHasReplies = true,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  // Signature dépliée par le membre sur téléphone ; sur ordinateur, elle est toujours visible
  const [signatureOpen, setSignatureOpen] = useState(false);
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

  const ligueLabel = author.ligues?.[0] ? (author.ligues[0].acronym || author.ligues[0].name) : author.ligueCustom || null;
  const regionLabel = author.region ? regionLabels[author.region] : undefined;
  const createdIso = new Date(post.createdAt).toISOString();

  return (
    <article
      id={`post-${post.id}`}
      aria-label={`Message #${index + 1} de ${name}`}
      className={cn(
        "grid scroll-mt-20 overflow-hidden rounded-bb-lg border bg-bb-surface text-bb-text lg:grid-cols-[200px_minmax(0,1fr)]",
        isFirstPostAlwaysVisible ? "border-bb-accent" : "border-bb-border"
      )}
    >
      {/* Ordinateur : colonne de l'auteur à gauche du texte (DESIGN.md, « Le forum ») */}
      <div className="hidden flex-col items-center gap-1.5 border-r border-bb-border bg-bb-surface-2/40 px-3 py-5 text-center lg:flex">
        <Button type="button" variant="quiet" tabIndex={-1} aria-hidden="true" onClick={openAuthor} className="h-auto shrink-0 rounded-full p-0 hover:bg-transparent">
          {avatar(80)}
        </Button>
        <Button
          type="button"
          variant="quiet"
          aria-label={`Voir la fiche de ${name}`}
          onClick={openAuthor}
          className="mt-1 h-auto min-h-0 max-w-full rounded-bb-sm px-1 py-0.5 text-base font-bold whitespace-normal text-bb-text hover:bg-transparent hover:text-bb-accent-text"
        >
          <span className="min-w-0 break-words">{name}</span>
        </Button>
        {rankLabel && <Badge variant="rank">{rankLabel}</Badge>}
        <dl className="mt-1 flex flex-col gap-0.5 text-sm text-bb-text-muted">
          <dt className="sr-only">Rôle</dt>
          <dd>{roleLabel}</dd>
          <dt className="sr-only">Messages</dt>
          <dd className="tabular-nums">{postCount.toLocaleString("fr-FR")} {postCount > 1 ? "messages" : "message"}</dd>
          {ligueLabel && (
            <>
              <dt className="sr-only">Ligue</dt>
              <dd className="break-words">{ligueLabel}</dd>
            </>
          )}
          {regionLabel && (
            <>
              <dt className="sr-only">Région</dt>
              <dd>{regionLabel}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="flex min-w-0 flex-col">
      {/* Bandeau du message : auteur (téléphone seulement), date et heure exactes, numéro, menu « ⋯ » */}
      <header className="flex items-start gap-2.5 border-b border-bb-border px-3 py-2.5 lg:items-center lg:px-5 lg:py-1.5">
        {/* L'avatar ouvre aussi la fiche ; le pseudo (ci-dessous) porte le nom lu par les lecteurs d'écran */}
        <Button type="button" variant="quiet" tabIndex={-1} aria-hidden="true" onClick={openAuthor} className="h-auto shrink-0 rounded-full p-0 hover:bg-transparent lg:hidden">
          {avatar(40)}
        </Button>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:hidden">
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
          </div>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm leading-snug text-bb-text-muted tabular-nums">
            <span className="lg:hidden">{roleLabel}</span>
            <span aria-hidden="true" className="lg:hidden">·</span>
            <time dateTime={createdIso} className="font-semibold text-bb-text">{exactDate(post.createdAt)}</time>
            <span aria-hidden="true">·</span>
            <a href={`#post-${post.id}`} className="-my-3 inline-flex min-h-11 min-w-11 items-center justify-center text-bb-text-muted no-underline hover:text-bb-accent-text lg:my-0 lg:min-h-0 lg:min-w-0" aria-label={`Lien vers le message numéro ${index + 1}`}>
              #{index + 1}
            </a>
            {isEdited && (
              <>
                <span aria-hidden="true">·</span>
                <span>modifié le {exactDate(post.updatedAt)}</span>
              </>
            )}
            {isFirstPostAlwaysVisible && <Badge variant="outline" className="ml-1">Premier message</Badge>}
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
          canEdit={canEdit}
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

      <div className="flex flex-1 flex-col px-3 pt-3 pb-3 lg:px-6 lg:pt-4 lg:pb-4">
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
            <h3 className="text-base font-bold text-bb-text">
              {isBannedAuthor ? `Coach banni : ${author.name}` : `Utilisateur bloqué : ${author.name}`}
            </h3>
            <p className="m-0 max-w-[60ch] text-sm text-bb-text-muted">
              {isBannedAuthor
                ? "Ce membre a été banni de la plateforme BBFrance. Ses messages sont masqués par défaut pour protéger la sérénité du forum."
                : "Ce contenu est masqué car tu as bloqué cet utilisateur. Tu peux le gérer dans la gestion de ton compte."}
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
              <div className="max-w-[78ch]">
                {post.isModerated && (
                  <p className="m-0 mb-2 text-sm text-bb-text-muted italic">[Contenu original visible par toi seul et les modérateurs]</p>
                )}
                {(isBlocked || isBannedAuthor) && isRevealed && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-bb-md bg-bb-surface-2 px-3 py-1 text-sm font-semibold text-bb-text-muted">
                    <Info size={14} aria-hidden="true" />
                    <span className="flex-1">
                      {isBannedAuthor ? "AFFICHAGE TEMPORAIRE (COACH BANNI)" : "AFFICHAGE TEMPORAIRE (UTILISATEUR BLOQUÉ)"}
                    </span>
                    <Button type="button" variant="quiet" size="tap" onClick={() => setIsRevealed(false)} className="text-sm">
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
                  <div className="mt-4 border-t border-bb-border pt-3 max-lg:pt-1">
                    {/* Téléphone : le bouton déplie ou replie la signature ; il n'existe pas sur ordinateur */}
                    <Button
                      type="button"
                      variant="quiet"
                      size="tap"
                      aria-expanded={signatureOpen}
                      aria-controls={`signature-${post.id}`}
                      onClick={() => setSignatureOpen((open) => !open)}
                      className="-ml-3 gap-1.5 text-sm text-bb-text-muted lg:hidden"
                    >
                      <ChevronDown size={16} aria-hidden="true" className={cn("transition-transform", signatureOpen && "rotate-180")} />
                      {signatureOpen ? "Masquer la signature" : "Voir la signature"}
                    </Button>
                    <div id={`signature-${post.id}`} className={cn(!signatureOpen && "max-lg:hidden")}>
                      <BBCodeContent content={author.signature} currentUserId={currentUserId} className="text-sm leading-normal text-bb-text-muted" />
                    </div>
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
      </div>

      <PostAuthorSheet
        open={authorOpen}
        onOpenChange={setAuthorOpen}
        author={author}
        roleLabel={roleLabel}
        rankLabel={rankLabel}
        regionLabel={regionLabel}
        isAuthorModerator={isAuthorModerator}
        currentUserId={currentUserId}
      />
    </article>
  );
};

export default PostItem;
