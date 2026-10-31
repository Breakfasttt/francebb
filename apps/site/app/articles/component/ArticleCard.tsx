/**
 * Un article dans une liste (refonte, carte 095, ADR 0006) : carte de la grille (`view="grid"`, aussi utilisée par
 * l'onglet « Articles » du profil) ou ligne de la liste (`view="list"`). La carte entière, comme la ligne entière, est
 * un lien vers l'article. On y lit les tags (trois au plus), le titre, le début du texte (grille), l'auteur avec son
 * avatar, la date relative (« il y a 3 jours »), le nombre de vues et, s'il y en a, le nombre de réactions. Un article
 * masqué par la modération porte la mention « Modéré ».
 */
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, ShieldAlert, SmilePlus } from "lucide-react";
import { Badge, cn } from "@bbfrance/ui";
import UserAvatar, { type Rank } from "@/common/components/UserAvatar/UserAvatar";
import { stripBBCode } from "@/lib/bbcode";
import { isModerator } from "@/lib/roles";

export interface ArticleListItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  views?: number | null;
  isModerated?: boolean;
  author: {
    name: string | null;
    image: string | null;
    role?: string | null;
    avatarFrame?: string | null;
    _count?: { posts: number };
  };
  tags: { id: string; name: string }[];
  _count?: { reactions: number };
  reactions?: unknown[];
}

interface ArticleCardProps {
  article: ArticleListItem;
  view?: "grid" | "list";
}

const linkClass =
  "text-bb-text no-underline hover:border-bb-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Vues et réactions (les réactions seulement s'il y en a). */
function Metrics({ views, reactions, className }: { views: number; reactions: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-sm text-bb-text-muted", className)}>
      <span className="inline-flex items-center gap-1" title="Nombre de vues">
        <Eye size={16} aria-hidden="true" />
        {views}
        <span className="sr-only"> vue{views > 1 ? "s" : ""}</span>
      </span>
      {reactions > 0 && (
        <span className="inline-flex items-center gap-1" title="Nombre de réactions">
          <SmilePlus size={16} aria-hidden="true" />
          {reactions}
          <span className="sr-only"> réaction{reactions > 1 ? "s" : ""}</span>
        </span>
      )}
    </span>
  );
}

function Tags({ tags, max }: { tags: ArticleListItem["tags"]; max: number }) {
  if (tags.length === 0) return null;
  return (
    <span className="flex min-w-0 flex-wrap gap-1.5">
      {tags.slice(0, max).map((tag) => (
        <Badge key={tag.id} variant="neutral" className="max-w-full truncate">{tag.name}</Badge>
      ))}
      {tags.length > max && <Badge variant="neutral">+{tags.length - max}</Badge>}
    </span>
  );
}

export default function ArticleCard({ article, view = "grid" }: ArticleCardProps) {
  const dateStr = formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: fr });
  const views = article.views || 0;
  const reactions = article._count?.reactions || article.reactions?.length || 0;
  const author = (size: number) => (
    <UserAvatar
      image={article.author.image}
      name={article.author.name}
      size={size}
      postCount={article.author._count?.posts || 0}
      selectedRank={article.author.avatarFrame as Rank}
      isModerator={isModerator(article.author.role ?? undefined)}
    />
  );
  const moderated = article.isModerated && (
    <Badge variant="danger" className="shrink-0">
      <ShieldAlert size={14} aria-hidden="true" />
      Modéré
    </Badge>
  );

  if (view === "list") {
    return (
      <Link
        href={`/articles/${article.id}`}
        className={cn("flex min-h-14 items-center gap-3 border-b border-bb-border px-3 py-3 last:border-b-0 hover:bg-bb-surface-2 lg:px-4", linkClass)}
      >
        <div className="min-w-0 flex-1">
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold break-words text-bb-text">
            {article.title}
            {moderated}
          </p>
          {/* Des <div> et non un <p> : l'avatar est un bloc, qu'un paragraphe ne peut pas contenir */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-bb-text-muted">
            <div className="inline-flex min-w-0 items-center gap-2">
              {author(24)}
              <span className="min-w-0 truncate font-semibold text-bb-text">{article.author.name}</span>
            </div>
            <span>{dateStr}</span>
            <Metrics views={views} reactions={reactions} className="lg:hidden" />
          </div>
        </div>
        <span className="hidden max-w-[16rem] shrink-0 lg:flex">
          <Tags tags={article.tags} max={2} />
        </span>
        <Metrics views={views} reactions={reactions} className="hidden shrink-0 lg:inline-flex" />
      </Link>
    );
  }

  // Début du texte sans les balises BBCode ; l'affichage le coupe à trois lignes
  const snippet = stripBBCode(article.content).slice(0, 300);
  return (
    <Link
      href={`/articles/${article.id}`}
      className={cn("flex h-full flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface p-4", linkClass)}
    >
      {(article.tags.length > 0 || article.isModerated) && (
        <span className="flex items-start justify-between gap-2">
          <Tags tags={article.tags} max={3} />
          {moderated}
        </span>
      )}
      <h2 className="m-0 line-clamp-2 border-0 p-0 text-lg leading-snug font-bold break-words text-bb-text normal-case not-italic">
        {article.title}
      </h2>
      {snippet && <p className="m-0 line-clamp-3 text-[0.95rem] leading-relaxed break-words text-bb-text-muted">{snippet}</p>}
      <div className="mt-auto flex items-center gap-3 border-t border-bb-border pt-3">
        {author(32)}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-bb-text">{article.author.name}</span>
          <span className="text-sm text-bb-text-muted">{dateStr}</span>
        </span>
        <Metrics views={views} reactions={reactions} className="shrink-0" />
      </div>
    </Link>
  );
}
