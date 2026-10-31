"use client";

/**
 * Une ressource dans la liste `/ressources` (refonte, carte 096, ADR 0006) : carte de la grille (`view="grid"`) ou
 * ligne de la liste (`view="list"`). La carte entière, comme la ligne entière, est un lien vers la ressource : un lien
 * hors du site s'ouvre dans un nouvel onglet, un lien du site dans le même onglet. On y lit l'image (ou l'image par
 * défaut), le badge « Officiel » des outils du site, le titre, la description, les tags et le site de destination.
 * L'auteur et la modération retrouvent « Éditer » et « Supprimer » dans le menu « ⋯ » de la ressource, placé à côté du
 * lien et non dedans (un lien ne peut pas contenir un bouton). Avant la refonte, ces deux boutons n'apparaissaient
 * qu'au survol de la souris, donc jamais sur téléphone.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { ActionMenu, Badge, cn } from "@bbfrance/ui";

export interface ResourceListItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  link: string;
  isSystem?: boolean;
  authorId?: string;
  tags: { id: string; name: string }[];
}

interface ResourceCardProps {
  resource: ResourceListItem;
  view?: "grid" | "list";
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

const FALLBACK_IMAGE = "/images/resource-placeholder.png";

const linkClass =
  "text-bb-text no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Destination lisible du lien : le nom du site pour un lien externe, « Sur BBFrance » pour une page du site. */
function destination(link: string, external: boolean): string {
  if (!external) return "Sur BBFrance";
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

/** Image de la ressource ; l'image par défaut la remplace si elle manque ou ne se charge pas. */
function ResourceImage({ src, className }: { src?: string | null; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const url = src && failed !== src ? src : FALLBACK_IMAGE;
  return (
    // Image hébergée n'importe où (ImgBB, site de l'outil) : pas d'optimisation next/image, dont les domaines sont limités
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" loading="lazy" onError={() => setFailed(src ?? null)} className={cn("block object-cover", className)} />
  );
}

/** Lien vers la ressource : `Link` pour une page du site, lien classique dans un nouvel onglet sinon. */
function ResourceLink({ resource, external, className, children }: { resource: ResourceListItem; external: boolean; className: string; children: ReactNode }) {
  if (external) {
    return (
      <a href={resource.link} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={resource.link} className={className}>
      {children}
    </Link>
  );
}

function Tags({ tags, max }: { tags: ResourceListItem["tags"]; max: number }) {
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

const officialBadge = <Badge variant="accent" className="shrink-0">Officiel</Badge>;

export default function ResourceCard({ resource, view = "grid", canEdit, canDelete, onDelete }: ResourceCardProps) {
  const external = /^https?:\/\//.test(resource.link);
  const site = destination(resource.link, external);
  const menu = (canEdit || canDelete) && (
    <ActionMenu
      label={`Actions de la ressource ${resource.title}`}
      title={resource.title}
      linkComponent={Link}
      triggerClassName={view === "grid" ? "border border-bb-border bg-bb-surface text-bb-text" : undefined}
      items={[
        { label: "Éditer", icon: <Pencil size={18} aria-hidden="true" />, href: `/ressources/edit/${resource.id}`, hidden: !canEdit },
        { label: "Supprimer", icon: <Trash2 size={18} aria-hidden="true" />, onSelect: onDelete, danger: true, hidden: !canDelete || resource.isSystem },
      ]}
    />
  );

  if (view === "list") {
    return (
      <div className="flex items-center gap-1 border-b border-bb-border pr-1 last:border-b-0 hover:bg-bb-surface-2 lg:pr-2">
        <ResourceLink
          resource={resource}
          external={external}
          className={cn("flex min-h-16 min-w-0 flex-1 items-center gap-3 px-3 py-2.5 lg:px-4", linkClass)}
        >
          <ResourceImage src={resource.imageUrl} className="size-12 shrink-0 rounded-bb-md border border-bb-border bg-bb-surface-2" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="min-w-0 font-bold break-words text-bb-text">{resource.title}</span>
              {resource.isSystem && officialBadge}
            </span>
            <span className="truncate text-sm text-bb-text-muted">{resource.description}</span>
          </span>
          <span className="hidden max-w-[14rem] shrink-0 lg:flex">
            <Tags tags={resource.tags} max={2} />
          </span>
          <ExternalLink size={16} aria-hidden="true" className={cn("shrink-0 text-bb-text-muted", !external && "hidden")} />
        </ResourceLink>
        {menu}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <ResourceLink
        resource={resource}
        external={external}
        className={cn(
          "flex h-full flex-row overflow-hidden rounded-bb-lg border bg-bb-surface hover:border-bb-text-muted sm:flex-col",
          resource.isSystem ? "border-bb-accent-text" : "border-bb-border",
          linkClass
        )}
      >
        {/* Petit téléphone : vignette carrée à gauche, pour voir plusieurs ressources par écran ; plus large : bandeau 16/9 */}
        <ResourceImage
          src={resource.imageUrl}
          className="mt-3 ml-3 size-20 shrink-0 rounded-bb-md border border-bb-border bg-bb-surface-2 sm:m-0 sm:aspect-[16/9] sm:size-auto sm:w-full sm:rounded-none sm:border-0 sm:border-b"
        />
        {/* Des <div> et non des <span> : le titre est un <h2>, qu'un élément en ligne ne peut pas contenir */}
        <div className={cn("flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4", menu && "max-sm:pr-12")}>
          {resource.isSystem && <div className="flex">{officialBadge}</div>}
          <h2 className="m-0 line-clamp-2 border-0 p-0 text-lg leading-snug font-bold tracking-normal break-words text-bb-text normal-case not-italic">{resource.title}</h2>
          <p className="m-0 line-clamp-2 text-[0.95rem] sm:line-clamp-3 leading-relaxed break-words text-bb-text-muted">{resource.description}</p>
          <Tags tags={resource.tags} max={4} />
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-bb-border pt-3 text-sm">
            <span className="min-w-0 truncate text-bb-text-muted">{site}</span>
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-bb-accent-text">
              Ouvrir
              {external && <ExternalLink size={16} aria-hidden="true" />}
              {external && <span className="sr-only"> (nouvel onglet)</span>}
            </span>
          </div>
        </div>
      </ResourceLink>
      {menu && <div className="absolute top-2 right-2">{menu}</div>}
    </div>
  );
}
