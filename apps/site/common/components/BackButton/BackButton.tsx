"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CSSProperties } from "react";
import Link from "next/link";
import { Button, cn } from "@bbfrance/ui";
import { hasInAppHistory } from "@/common/utils/inAppHistory";

interface BackButtonProps {
  href?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Avec `href` : revient plutôt à la page précédente quand elle fait partie du site, et ne suit `href` que si la
   * page a été ouverte directement (carte 196). Pour une page ouverte depuis plusieurs endroits (panneau « Plus »,
   * menu du compte…), où un retour fixe vers l'accueil ferait perdre la page d'où l'on vient.
   */
  preferHistory?: boolean;
}

/**
 * Bouton de retour uniformisé (flèche dans un carré de surface, variables v2 depuis la carte 101).
 * Si href est fourni, utilise un Link Next.js ; sinon, retourne à la page précédente via router.back().
 * Avec `preferHistory`, le lien n'est suivi que si la page précédente n'est pas une page du site.
 * 44 pixels sur téléphone (taille d'un pouce), 36 sur ordinateur ; `style` peut imposer une autre taille.
 */
export default function BackButton({ href, title = "Retour", className = "", style, preferHistory = false }: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    if (!href || (preferHistory && hasInAppHistory())) {
      e.preventDefault();
      router.back();
    }
  };

  const commonProps = {
    title,
    "aria-label": title,
    className: cn("shrink-0 lg:size-9", className),
    style,
    onClick: handleBack,
  };

  return (
    <Button asChild={!!href} type={href ? undefined : "button"} variant="secondary" size="tap-icon" {...commonProps}>
      {href ? (
        <Link href={href}>
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      ) : (
        <ArrowLeft size={20} aria-hidden="true" />
      )}
    </Button>
  );
}
