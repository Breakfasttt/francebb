/**
 * Liste des outils de l'éditeur BBCode (carte 087) : leur nom, leur icône, leur rubrique dans le panneau « Plus
 * d'outils » et leur façon d'agir. Le nom sert à la fois d'info-bulle et de nom lu par les lecteurs d'écran ; les
 * tests d'inventaire (tests/e2e/inventaire/forum-editeur.spec.ts) cherchent les outils par ce nom.
 *
 * Deux sortes d'outils :
 * - « insert » : l'outil entoure le texte sélectionné de ses balises (ou les insère au curseur), sans rien demander ;
 * - « panel » : l'outil ouvre un petit formulaire d'options (adresse d'un lien, taille, couleur…) avant d'insérer.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter,
  Bold,
  ChevronDown,
  Code,
  DraftingCompass,
  Ghost,
  Hash,
  Image as ImageIcon,
  Italic,
  LayoutGrid,
  Link as LinkIcon,
  List,
  Minus,
  Palette,
  Smile,
  Sparkles,
  Strikethrough,
  Superscript,
  Table as TableIcon,
  Type,
  Underline,
  AtSign,
  Youtube,
} from "lucide-react";

/** Outils qui ouvrent un formulaire d'options. */
export type PanelToolId =
  | "link"
  | "youtube"
  | "image"
  | "gallery"
  | "smileys"
  | "color"
  | "size"
  | "topic"
  | "mention"
  | "spoiler"
  | "accordion"
  | "list"
  | "align"
  | "typo"
  | "bbscheme";

export type EditorTool =
  | { id: string; label: string; icon: LucideIcon; kind: "insert"; open: string; close: string }
  | { id: PanelToolId; label: string; icon: LucideIcon; kind: "panel" }
  | { id: "ai"; label: string; icon: LucideIcon; kind: "ai" };

const TOOLS = {
  bold: { id: "bold", label: "Gras", icon: Bold, kind: "insert", open: "[b]", close: "[/b]" },
  italic: { id: "italic", label: "Italique", icon: Italic, kind: "insert", open: "[i]", close: "[/i]" },
  underline: { id: "underline", label: "Souligné", icon: Underline, kind: "insert", open: "[u]", close: "[/u]" },
  strike: { id: "strike", label: "Barré", icon: Strikethrough, kind: "insert", open: "[s]", close: "[/s]" },
  hr: { id: "hr", label: "Trait horizontal", icon: Minus, kind: "insert", open: "[hr]", close: "" },
  code: { id: "code", label: "Bloc de code", icon: Code, kind: "insert", open: "[code]", close: "[/code]" },
  // Le modèle de tableau est inséré tel quel, sans entourer la sélection
  table: {
    id: "table",
    label: "Tableau",
    icon: TableIcon,
    kind: "insert",
    open: `[table]\n[tr]\n[th]Header 1[/th]\n[th]Header 2[/th]\n[/tr]\n[tr]\n[td]Cell 1[/td]\n[td]Cell 2[/td]\n[/tr]\n[/table]`,
    close: "",
  },
  size: { id: "size", label: "Taille du texte", icon: Type, kind: "panel" },
  color: { id: "color", label: "Couleur du texte", icon: Palette, kind: "panel" },
  typo: { id: "typo", label: "Exposant et indice", icon: Superscript, kind: "panel" },
  align: { id: "align", label: "Alignement du texte", icon: AlignCenter, kind: "panel" },
  list: { id: "list", label: "Liste", icon: List, kind: "panel" },
  accordion: { id: "accordion", label: "Accordéon (bloc repliable)", icon: ChevronDown, kind: "panel" },
  spoiler: { id: "spoiler", label: "Spoiler (texte caché)", icon: Ghost, kind: "panel" },
  link: { id: "link", label: "Ajouter un lien", icon: LinkIcon, kind: "panel" },
  image: { id: "image", label: "Ajouter une image", icon: ImageIcon, kind: "panel" },
  topic: { id: "topic", label: "Lien vers un sujet du forum", icon: Hash, kind: "panel" },
  mention: { id: "mention", label: "Mentionner un membre", icon: AtSign, kind: "panel" },
  gallery: { id: "gallery", label: "Galerie d'images", icon: LayoutGrid, kind: "panel" },
  youtube: { id: "youtube", label: "Vidéo YouTube", icon: Youtube, kind: "panel" },
  bbscheme: { id: "bbscheme", label: "Schéma BBScheme", icon: DraftingCompass, kind: "panel" },
  smileys: { id: "smileys", label: "Smileys", icon: Smile, kind: "panel" },
  ai: { id: "ai", label: "Assistant de mise en forme par IA", icon: Sparkles, kind: "ai" },
} satisfies Record<string, EditorTool>;

/**
 * Outils toujours visibles dans la barre, les plus utilisés. `desktopOnly` : sur téléphone, la barre n'a pas la
 * place pour celui-ci (moins de 375 pixels utiles) ; il est alors rangé dans le panneau « Plus d'outils ».
 */
export const PRIMARY_TOOLS: { tool: EditorTool; desktopOnly?: boolean }[] = [
  { tool: TOOLS.bold },
  { tool: TOOLS.italic },
  { tool: TOOLS.link },
  { tool: TOOLS.image },
  { tool: TOOLS.spoiler, desktopOnly: true },
  { tool: TOOLS.smileys },
];

/** Les autres outils, rangés par rubrique dans le panneau « Plus d'outils ». */
export const MORE_TOOL_GROUPS: { title: string; tools: EditorTool[] }[] = [
  { title: "Texte", tools: [TOOLS.underline, TOOLS.strike, TOOLS.size, TOOLS.color, TOOLS.typo, TOOLS.align] },
  { title: "Blocs", tools: [TOOLS.spoiler, TOOLS.list, TOOLS.table, TOOLS.hr, TOOLS.code, TOOLS.accordion] },
  { title: "Liens et médias", tools: [TOOLS.topic, TOOLS.mention, TOOLS.gallery, TOOLS.youtube, TOOLS.bbscheme] },
  { title: "Aide", tools: [TOOLS.ai] },
];

/** Identifiant de l'outil rangé dans « Plus d'outils » sur téléphone seulement (voir PRIMARY_TOOLS). */
export const PHONE_ONLY_MORE_TOOLS = new Set(PRIMARY_TOOLS.filter((item) => item.desktopOnly).map((item) => item.tool.id));

/** Nom de chaque outil à formulaire, pour le titre de son panneau. */
export const PANEL_TOOL_LABELS = Object.fromEntries(
  Object.values(TOOLS)
    .filter((tool) => tool.kind === "panel")
    .map((tool) => [tool.id, tool.label])
) as Record<PanelToolId, string>;

/** Tailles proposées par l'outil « Taille du texte ». */
export const TEXT_SIZES = ["0.7rem", "0.85rem", "1rem", "1.25rem", "1.5rem", "2rem"];

/**
 * Pastilles de l'outil « Couleur du texte » : la couleur écrite dans la balise [color=…] du message, et son nom
 * (lu par les lecteurs d'écran). Ce sont des valeurs du BBCode, pas des couleurs de thème : elles restent les mêmes
 * dans les 7 thèmes du site.
 */
export const TEXT_COLORS: { value: string; name: string }[] = [
  { value: "#ef4444", name: "Rouge" },
  { value: "#f97316", name: "Orange" },
  { value: "#eab308", name: "Jaune" },
  { value: "#22c55e", name: "Vert" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#3b82f6", name: "Bleu" },
  { value: "#a855f7", name: "Violet" },
  { value: "#ec4899", name: "Rose" },
  { value: "#9ca3af", name: "Gris" },
  { value: "#ffffff", name: "Blanc" },
];
