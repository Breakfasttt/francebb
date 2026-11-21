/**
 * Blason d'une ligue (refonte, carte 094) : l'image envoyée par la ligue dans un carré arrondi. Sans blason, rien
 * n'est affiché (carte 220), sauf dans l'aperçu du formulaire (`showPlaceholder`). Partagé par la liste `/ligues`, la fiche d'une ligue et son formulaire.
 * `alt` est vide par défaut (le nom de la ligue est déjà écrit à côté) ; la fiche passe « Blason … ».
 */
import { Shield } from "lucide-react";
import { cn } from "@bbfrance/ui";

export default function LigueBlason({ image, alt = "", size = 56, className, showPlaceholder = false }: { image: string | null; alt?: string; size?: number; className?: string; showPlaceholder?: boolean }) {
  // Sans blason, rien n'est affiché (pas d'écusson de remplissage) ; seul l'aperçu du formulaire garde un cadre vide
  if (!image && !showPlaceholder) return null;
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-bb-md border border-bb-border bg-bb-surface-2 text-bb-text-muted", className)}
      style={{ width: size, height: size }}
    >
      {image ? (
        // Image hébergée chez ImgBB (adresse quelconque) : pas d'optimisation next/image, dont les domaines sont limités
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="size-full object-contain p-1" loading="lazy" />
      ) : (
        <Shield size={Math.round(size * 0.5)} aria-hidden="true" />
      )}
    </span>
  );
}
