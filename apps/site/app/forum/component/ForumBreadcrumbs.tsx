import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { parseInlineBBCode } from "@/lib/bbcode";

/**
 * Fil d'Ariane du forum (accueil du forum › catégorie › forum parent › page courante), partagé par les pages du forum.
 * Couleurs de la refonte (ADR 0006, carte 085). Sur téléphone, chaque lien fait 44 pixels de haut pour le pouce.
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
  isCategory?: boolean;
}

interface ForumBreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Marge sous le fil d'Ariane : 1,5 rem par défaut, comme avant la refonte. */
  className?: string;
}

const linkClass = "inline-flex items-center gap-1 font-semibold text-bb-accent-text hover:underline max-lg:min-h-11";

export default function ForumBreadcrumbs({ items, className = "mb-6" }: ForumBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`forum-breadcrumbs text-sm ${className}`}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1 p-0">
        <li className="flex items-center">
          <Link href="/forum" className={linkClass}>
            <Home size={14} aria-hidden="true" />
            Accueil Forum
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-1">
            <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
            {item.href ? (
              <Link
                href={item.href}
                className={item.isCategory ? "pointer-events-none text-bb-text-muted max-lg:inline-flex max-lg:min-h-11 max-lg:items-center" : linkClass}
                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(item.label) }}
              />
            ) : (
              <span
                className={`min-w-0 break-words ${item.isCategory ? "text-bb-text-muted" : "font-semibold text-bb-text"}`}
                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(item.label) }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
