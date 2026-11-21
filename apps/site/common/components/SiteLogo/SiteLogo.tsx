/*
  SiteLogo : le nom du site composé en typographie (DESIGN.md : pas d'écusson ni de logo dessiné), lien vers l'accueil.
  « BB » en rouge de lecture, « FRANCE » en couleur de la barre, voix Display (Archivo condensé, capitales).
  La zone cliquable fait au moins 44 pixels de haut.
*/
import Link from "next/link";
import { cn } from "@bbfrance/ui";

interface SiteLogoProps {
  /** Taille relative du nom (1 = 28 px de haut de lettre environ) */
  scale?: number;
  className?: string;
}

export default function SiteLogo({ scale = 1, className }: SiteLogoProps) {
  return (
    <Link
      href="/"
      aria-label="BBFrance, accueil"
      className={cn(
        "inline-flex min-h-11 items-center rounded-bb-sm font-bb-display leading-none text-bb-text no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus",
        className
      )}
      style={{ fontSize: `${Math.round(36 * scale)}px` }}
    >
      <span aria-hidden="true">
        <span className="text-bb-accent-text">BB</span>FRANCE
      </span>
    </Link>
  );
}
