"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CSSProperties } from "react";
import Link from "next/link";
import "./BackButton.css";

interface BackButtonProps {
  href?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Composant bouton de retour uniformisé.
 * Si href est fourni, utilise un Link Next.js.
 * Si href est absent, retourne à la page précédente via router.back().
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
    className: `back-button ${className}`.trim(),
    style,
    onClick: handleBack
  };

  if (!href) {
    return (
      <button type="button" {...commonProps}>
        <ArrowLeft size={20} />
      </button>
    );
  }

  return (
    <Link href={href} {...commonProps}>
      <ArrowLeft size={20} />
    </Link>
  );
}
