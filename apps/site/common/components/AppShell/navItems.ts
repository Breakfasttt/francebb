/**
 * Destinations de la navigation (ADR 0006) : une seule liste pour la barre basse (téléphone), le panneau « Plus »
 * et la barre haute (ordinateur). Ajouter une page au menu = une ligne ici.
 */
import {
  BarChart3, BookOpen, Dices, FileText, Home, LayoutGrid, Map, Mail, MessageSquare, PlaySquare,
  Shield, Trophy, Medal, Users, type LucideIcon,
} from "lucide-react";

/**
 * Les trois groupes de rubriques (carte 189), partagés par l'accueil (ses trois blocs) et le panneau « Plus » : les
 * deux rangent le site de la même façon, avec les mêmes titres. L'ordre de cette liste est l'ordre d'affichage.
 */
export const NAV_GROUPS = [
  { id: "debuter", title: "Débuter", description: "Apprendre les règles et se lancer." },
  { id: "competition", title: "Jouer en compétition", description: "Tournois, ligues et classement national." },
  { id: "communaute", title: "La communauté", description: "Discuter, lire, partager." },
] as const;

export type NavGroupId = (typeof NAV_GROUPS)[number]["id"];

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Groupe de la rubrique dans le panneau « Plus » (même rangement que l'accueil) */
  group?: NavGroupId;
  /** Rubrique réservée aux membres connectés : elle n'est pas proposée à un visiteur */
  membersOnly?: boolean;
}

/** Les quatre onglets fixes de la barre basse ; le cinquième, « Plus », ouvre le panneau. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Forum", href: "/forum", icon: MessageSquare, group: "communaute" },
  { label: "Tournois", href: "/tournois", icon: Trophy, group: "competition" },
  { label: "Messages", href: "/messagerie", icon: Mail },
];

/**
 * Le reste du site, dans le panneau « Plus » (téléphone) et le menu « Plus » de la barre haute (ordinateur), rangé
 * par groupe dans l'ordre de l'accueil. L'annuaire des membres (carte 189) n'est proposé qu'aux membres connectés :
 * la page leur est réservée, un visiteur serait seulement renvoyé vers la connexion.
 */
export const MORE_NAV: NavItem[] = [
  { label: "Jouer", href: "/jouer", icon: Dices, group: "debuter" },
  { label: "Ressources", href: "/ressources", icon: BookOpen, group: "debuter" },
  { label: "Ligues", href: "/ligues", icon: Shield, group: "competition" },
  { label: "Carte", href: "/carte", icon: Map, group: "competition" },
  { label: "Classement", href: "/classement", icon: Medal, group: "competition" },
  { label: "Articles", href: "/articles", icon: FileText, group: "communaute" },
  { label: "Membres", href: "/membres", icon: Users, group: "communaute", membersOnly: true },
  { label: "Statistiques", href: "/statistiques", icon: BarChart3, group: "communaute" },
  { label: "Médias", href: "/media", icon: PlaySquare, group: "communaute" },
];

/** Les rubriques de MORE_NAV qu'on propose à ce visiteur (sans celles réservées aux membres s'il n'est pas connecté). */
export function moreNavFor(isLoggedIn: boolean): NavItem[] {
  return MORE_NAV.filter((item) => isLoggedIn || !item.membersOnly);
}

const moreItem = (href: string) => MORE_NAV.find((item) => item.href === href)!;

/** Liens directs de la barre haute sur ordinateur (le reste est dans son menu « Plus »). */
export const DESKTOP_NAV: NavItem[] = [
  PRIMARY_NAV[0],
  PRIMARY_NAV[1],
  PRIMARY_NAV[2],
  moreItem("/ligues"),
  moreItem("/articles"),
  moreItem("/ressources"),
];

export const MORE_ICON = LayoutGrid;

/** Vrai si l'adresse courante appartient à cette destination (« / » seulement pour l'accueil exact). */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/ligues" && pathname.startsWith("/ligue/"));
}

/**
 * Pages rangées dans le panneau « Plus » en dehors de MORE_NAV : le profil, la modération, l'administration et les
 * mentions légales. Sur l'une d'elles, l'onglet « Plus » est allumé, comme sur une rubrique de MORE_NAV.
 */
const MORE_PANEL_PAGES = ["/profile", "/moderation", "/administration", "/mentions-legales"];

/**
 * Onglet de la barre basse à allumer (carte 189) : un seul à la fois. Panneau « Plus » ouvert : « Plus ». Sinon,
 * l'onglet de la page courante, « Plus » pour une page rangée dans le panneau, aucun pour les autres pages
 * (notifications, profil d'un autre coach…). Renvoie l'adresse de l'onglet, « more » pour « Plus », ou null.
 */
export function activeBottomTab(pathname: string, moreOpen: boolean): string | null {
  if (moreOpen) return "more";
  const primary = PRIMARY_NAV.find((item) => isActive(pathname, item.href));
  if (primary) return primary.href;
  if ([...MORE_NAV.map((item) => item.href), ...MORE_PANEL_PAGES].some((href) => isActive(pathname, href))) return "more";
  return null;
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
