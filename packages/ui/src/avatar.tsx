/**
 * Avatar rond : image si elle existe, sinon l'initiale du pseudo. `ring` entoure l'avatar d'un anneau
 * (couleur de rang par défaut). Les cadres de rang historiques restent dans UserAvatar (apps/site).
 */
import * as React from "react";
import { cn } from "./cn";

export interface AvatarProps extends React.ComponentProps<"span"> {
  name?: string | null;
  src?: string | null;
  /** Diamètre en pixels (40 par défaut, taille des messages du forum sur téléphone). */
  size?: number;
  ring?: boolean;
}

export function Avatar({ name, src, size = 40, ring, className, style, ...props }: AvatarProps) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bb-surface-2 font-bold text-bb-text",
        ring && "ring-2 ring-bb-rank",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), ...style }}
      {...props}
    >
      {src ? (
        // Image distante (avatar d'un membre) : pas d'optimisation next/image dans un paquet partagé
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}
