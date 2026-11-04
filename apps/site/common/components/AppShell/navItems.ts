/**
 * Destinations de la navigation (ADR 0006) : une seule liste pour la barre basse (téléphone), le panneau « Plus »
 * et la barre haute (ordinateur). Ajouter une page au menu = une ligne ici.
 */
import {
  BarChart3, BookOpen, Dices, FileText, Home, LayoutGrid, Map, Mail, MessageSquare, PlaySquare,
  Shield, Trophy, Medal, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Les quatre onglets fixes de la barre basse ; le cinquième, « Plus », ouvre le panneau. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Tournois", href: "/tournois", icon: Trophy },
  { label: "Messages", href: "/messagerie", icon: Mail },
];

/** Le reste du site, dans le panneau « Plus » (téléphone) et le menu « Plus » de la barre haute (ordinateur). */
export const MORE_NAV: NavItem[] = [
  { label: "Ligues", href: "/ligues", icon: Shield },
  { label: "Carte", href: "/carte", icon: Map },
  { label: "Articles", href: "/articles", icon: FileText },
  { label: "Ressources", href: "/ressources", icon: BookOpen },
  { label: "Classement", href: "/classement", icon: Medal },
  { label: "Jouer", href: "/jouer", icon: Dices },
  { label: "Statistiques", href: "/statistiques", icon: BarChart3 },
  { label: "Médias", href: "/media", icon: PlaySquare },
];

/** Liens directs de la barre haute sur ordinateur (le reste est dans son menu « Plus »). */
export const DESKTOP_NAV: NavItem[] = [
  PRIMARY_NAV[0],
  PRIMARY_NAV[1],
  PRIMARY_NAV[2],
  MORE_NAV[0],
  MORE_NAV[2],
  MORE_NAV[3],
];

export const MORE_ICON = LayoutGrid;

/** Vrai si l'adresse courante appartient à cette destination (« / » seulement pour l'accueil exact). */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/ligues" && pathname.startsWith("/ligue/"));
}

/**
 * Écrans de rédaction du forum (répondre, modifier un message, nouveau sujet), qui occupent tout l'écran sur
 * téléphone : la barre basse n'y est pas affichée, pour laisser la place à l'éditeur et à la barre d'envoi (carte 087).
 * Depuis la carte 089, les écrans de création et de modification d'un tournoi et la saisie de ses résultats aussi.
 * Depuis la carte 094, les écrans de création (`/ligues/create`) et de modification (`/ligue/edit/[id]`) d'une ligue ;
 * depuis la carte 095, ceux d'un article (`/articles/create`, `/articles/edit/[id]`) ; depuis la carte 096, ceux d'une
 * ressource (`/ressources/submit`, `/ressources/edit/[id]`) ; depuis la carte 097, l'éditeur d'archives du classement
 * (`/classement/edit-archive`). Les écrans du quiz (carte 098) sont partis avec lui dans apps/bbquizz (carte 180).
 * Un écran plein écran qui n'a pas sa propre adresse (une conversation de la messagerie, ouverte par `?id=`, carte 093)
 * pose plutôt l'attribut `data-fullscreen`, qui retire la barre basse par le CSS (AppShell.css).
 */
export function isComposePath(pathname: string): boolean {
  return /^\/forum\/(topic\/[^/]+\/reply|post\/[^/]+\/edit|new-topic|new-tournament|edit-tournament\/[^/]+|tournament\/[^/]+\/results)\/?$/.test(pathname)
    || /^\/(ligues\/create|ligue\/edit\/[^/]+|articles\/create|articles\/edit\/[^/]+|ressources\/submit|ressources\/edit\/[^/]+|classement\/edit-archive)\/?$/.test(pathname);
}
