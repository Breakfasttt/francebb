import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CSSProperties } from "react";
import "./BackButton.css";

interface BackButtonProps {
  href: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Composant bouton de retour uniformisé, utilisant le design carré aux coins arrondis
 */
export default function BackButton({ href, title = "Retour", className = "", style }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      title={title} 
      className={`back-button ${className}`.trim()}
      style={style}
    >
      <ArrowLeft size={20} />
    </Link>
  );
}
