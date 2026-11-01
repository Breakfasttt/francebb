"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CSSProperties } from "react";
import Link from "next/link";
import { Button, cn } from "@bbfrance/ui";

interface BackButtonProps {
  href?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Bouton de retour uniformisé (flèche dans un carré de surface, variables v2 depuis la carte 101).
 * Si href est fourni, utilise un Link Next.js ; sinon, retourne à la page précédente via router.back().
 * 44 pixels sur téléphone (taille d'un pouce), 36 sur ordinateur ; `style` peut imposer une autre taille.
 */
export default function BackButton({ href, title = "Retour", className = "", style }: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    if (!href) {
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
