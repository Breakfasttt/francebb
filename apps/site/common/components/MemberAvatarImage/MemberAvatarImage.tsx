import type { CSSProperties } from "react";
import { User as UserIcon } from "lucide-react";
import "./MemberAvatarImage.css";

interface MemberAvatarImageProps {
  /** Adresse de l'avatar du membre ; vide ou absente quand le membre n'en a pas choisi. */
  image?: string | null;
  /** Texte alternatif lu par les lecteurs d'écran (souvent le pseudo) ; vide si le nom est déjà écrit à côté. */
  alt?: string;
  /** Classe qui donne la taille, l'arrondi et la bordure : elle s'applique à l'image comme à l'avatar par défaut. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Petite image d'avatar d'un membre, sans cadre de rang (pour le cadre, voir `UserAvatar`).
 * Quand le membre n'a pas d'avatar, affiche l'avatar par défaut du site : la même silhouette que `UserAvatar`,
 * dessinée avec les couleurs du thème actif, donc lisible dans les 7 thèmes et sans fichier image à charger.
 */
export default function MemberAvatarImage({ image, alt = "", className = "", style }: MemberAvatarImageProps) {
  if (image) {
    // Les avatars viennent d'adresses externes choisies par les membres : balise <img> simple, comme UserAvatar.
    return <img src={image} alt={alt} className={className} style={style} />;
  }

  return (
    <span
      className={`member-avatar-fallback ${className}`}
      style={style}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <UserIcon aria-hidden="true" />
    </span>
  );
}
