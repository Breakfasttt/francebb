/*
  SiteLogo : le nom du site composé en typographie (DESIGN.md : pas d'écusson ni de logo dessiné), lien vers l'accueil.
  Couleurs de la barre du haut (et non de la page) : sa couleur active pour « BB », son texte éclairci pour « FRANCE ».
  Ainsi le nom reste lisible dans chaque thème, y compris ceux à barre rouge (Saison 3, NAF). Voix Display.
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
        "inline-flex min-h-11 items-center rounded-bb-sm font-bb-display leading-none no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus",
        className
      )}
      style={{ fontSize: `${Math.round(36 * scale)}px` }}
    >
      <span aria-hidden="true">
        <span className="text-bb-nav-active">BB</span>
        <span className="text-bb-nav-text brightness-[1.35]">FRANCE</span>
      </span>
    </Link>
  );
}
