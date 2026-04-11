"use client";

import React from "react";
import Link from "next/link";
import "./Button.css";
import { LucideIcon } from "lucide-react";

/**
 * Composant de base pour tous les boutons du site BBFrance.
 * Gère le rendu conditionnel (bouton ou lien), les états de chargement et les icônes.
 */

export type ButtonVariant = "classic" | "cta" | "danger" | "admin";

interface ButtonBaseProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  icon?: React.ElementType | React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

// Props pour le type Bouton
interface ButtonAsButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
  as?: "button";
}

// Props pour le type Lien
interface ButtonAsLinkProps extends ButtonBaseProps {
  href: string;
  as?: "link";
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button({
  children,
  variant = "classic",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  
  const combinedClassName = [
    "bb-button",
    `variant-${variant}`,
    fullWidth ? "full-width" : "",
    isLoading ? "loading" : "",
    className
  ].filter(Boolean).join(" ");

  const renderIcon = (iconProp: any, position: "left" | "right") => {
    if (!iconProp) return null;
    if (iconPosition !== position) return null;
    
    // Si c'est déjà un élément React (ex: <Search />)
    if (React.isValidElement(iconProp)) {
      return <span className="btn-icon-wrapper">{iconProp}</span>;
    }

    // Si c'est un composant (ex: Search)
    const IconComponent = iconProp;
    return <IconComponent className="btn-icon" size={20} />;
  };

  const content = (
    <>
      {isLoading && <span className="btn-spinner" />}
      {!isLoading && renderIcon(Icon, "left")}
      <span className="btn-text">{children}</span>
      {!isLoading && renderIcon(Icon, "right")}
    </>
  );

  // Si c'est un lien
  if ("href" in props && props.href) {
    const { href, target, rel, onClick } = props as ButtonAsLinkProps;
    return (
      <Link 
        href={href} 
        className={combinedClassName} 
        target={target} 
        rel={rel} 
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  // Si c'est un bouton standard
  const { type = "button", onClick } = props as ButtonAsButtonProps;
  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
