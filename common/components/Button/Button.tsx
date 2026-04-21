"use client";

import React from "react";
import Link from "next/link";
import "./Button.css";
import "./Button-mobile.css";

/**
 * Composant de base pour tous les boutons du site BBFrance.
 * Gère le rendu conditionnel (bouton, lien, div, span), les états de chargement et les icônes.
 */

export type ButtonVariant = "classic" | "cta" | "danger" | "admin" | "badge" | "explain" | "toggle";

interface ButtonBaseProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  active?: boolean;
  icon?: React.ElementType | React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  style?: React.CSSProperties;
  title?: string;
}

// Props pour le type Bouton
interface ButtonAsButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
  as?: "button";
}

// Props pour le type Lien
interface ButtonAsLinkProps extends ButtonBaseProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  as?: "link";
}

// Props pour le type Générique (div, span) utile pour l'imbrication dans des liens
interface ButtonAsGenericProps extends ButtonBaseProps, React.HTMLAttributes<HTMLDivElement> {
  href?: never;
  as: "div" | "span";
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsGenericProps;

export default function Button({
  children,
  variant = "classic",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled = false,
  size = "md",
  active = false,
  style,
  title,
  ...props
}: ButtonProps) {
  
  const combinedClassName = [
    "bb-button",
    `variant-${variant}`,
    `size-${size}`,
    fullWidth ? "full-width" : "",
    isLoading ? "loading" : "",
    active ? "active" : "",
    !children ? "icon-only" : "",
    className
  ].filter(Boolean).join(" ");

  const renderIcon = (iconProp: any, position: "left" | "right") => {
    if (!iconProp) return null;
    if (iconPosition !== position) return null;
    
    // Si c'est déjà un élément React (ex: <Search />)
    if (React.isValidElement(iconProp)) {
      return <span className="bb-btn-icon" style={{ display: 'flex', alignItems: 'center' }}>{iconProp}</span>;
    }

    // Gestion robuste pour React 19
    if (typeof iconProp === 'object' && iconProp !== null && 'type' in iconProp) {
        return <span className="bb-btn-icon" style={{ display: 'flex', alignItems: 'center' }}>{iconProp as any}</span>;
    }

    // Si c'est un composant (Fonction ou Objet/ForwardRef)
    if (typeof iconProp === 'function' || typeof iconProp === 'object') {
      const IconComponent = iconProp;
      const iconSize = size === "xs" ? 14 : size === "sm" ? 16 : size === "lg" ? 22 : 18;
      if (!IconComponent) return null;
      // @ts-ignore - Lucide icons props
      return <IconComponent className="bb-btn-icon" size={iconSize} />;
    }

    return null;
  };

  const renderContent = () => (
    <>
      {isLoading && <span className="btn-spinner" />}
      {!isLoading && renderIcon(Icon, "left")}
      {children && <span className="btn-text">{children}</span>}
      {!isLoading && renderIcon(Icon, "right")}
    </>
  );

  // Si c'est un lien
  if ("href" in props && props.href) {
    const { href, target, rel, onClick, ...rest } = props as ButtonAsLinkProps;
    return (
      <Link 
        href={href} 
        className={combinedClassName} 
        target={target} 
        rel={rel} 
        onClick={onClick}
        style={style}
        title={title}
        {...(rest as any)}
      >
        {renderContent()}
      </Link>
    );
  }

  // Rendu en div ou span
  if (props.as === "div" || props.as === "span") {
    const Tag = props.as;
    const { as, ...rest } = props as ButtonAsGenericProps;
    return (
      <Tag
        className={combinedClassName}
        style={style}
        title={title}
        {...(rest as any)}
      >
        {renderContent()}
      </Tag>
    );
  }

  // Rendu par défaut en bouton
  const { type = "button", onClick, ...rest } = props as ButtonAsButtonProps;
  return (
    <button
      type={type as any}
      className={combinedClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={style}
      title={title}
      {...(rest as any)}
    >
      {renderContent()}
    </button>
  );
}
