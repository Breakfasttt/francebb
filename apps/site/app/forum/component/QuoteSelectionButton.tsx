"use client";

/**
 * Citer seulement un passage d'un message (carte 183).
 *
 * Quand le coach sélectionne du texte à l'intérieur d'un seul message, un bouton « Citer la sélection » apparaît :
 * - sur ordinateur, juste au-dessus de la sélection (ou dessous, si la sélection touche le haut de l'écran) ;
 * - sur téléphone, centré en bas de l'écran, au-dessus de la barre basse et de la barre « Répondre » du sujet : le
 *   menu de sélection du téléphone (Copier, Tout sélectionner…) s'affiche, lui, au-dessus du texte, et les deux ne se
 *   gênent pas.
 * Le bouton n'apparaît pas pour une sélection à cheval sur deux messages, ni dans un message qui ne se cite pas
 * (supprimé, masqué par la modération) : seuls les messages citables portent l'attribut data-quote-post-id (posé
 * par PostItem). Ce composant n'est monté que par la réponse rapide, donc seulement quand le coach peut répondre.
 *
 * Le passage est repris tel qu'il est affiché, en texte brut : le message est rendu en HTML à partir du BBCode, et
 * le texte sélectionné ne permet pas de retrouver les balises d'origine.
 *
 * La sélection du navigateur n'est jamais modifiée tant que le coach n'a pas appuyé sur le bouton : on écoute
 * l'événement selectionchange, avec un petit délai pour ne pas recalculer à chaque lettre ajoutée à la sélection.
 */
import { useEffect, useRef, useState } from "react";
import { MessageSquareQuote } from "lucide-react";
import { Button, DESKTOP_QUERY, toast, useMediaQuery } from "@bbfrance/ui";
import { buildQuote, type QuoteSource } from "@/lib/forumQuote";

const QUICK_REPLY_ID = "quick-reply-area";
// Délai avant de lire la sélection : la sélection change à chaque mouvement du doigt ou de la souris
const SELECTION_DELAY_MS = 200;
// Hauteur du bouton (44 pixels) et écart avec la sélection, pour le placer au-dessus d'elle sur ordinateur
const BUTTON_OFFSET_PX = 52;

/** Mène à la réponse rapide et place le curseur dans l'éditeur (action « Voir ma réponse » de la notification). */
function showQuickReply() {
  const area = document.getElementById(QUICK_REPLY_ID);
  if (!area) return;
  area.scrollIntoView({ behavior: "smooth", block: "start" });
  area.querySelector("textarea")?.focus({ preventScroll: true });
}

/**
 * Ajoute une citation à la fin de la réponse rapide, sans faire défiler la page, puis affiche la notification
 * « Citation ajoutée » avec l'action « Voir ma réponse ». Renvoie faux s'il n'y a pas de réponse rapide dans la page.
 */
export function sendQuoteToQuickReply(quote: string): boolean {
  if (!document.getElementById(QUICK_REPLY_ID)) return false;
  window.dispatchEvent(new CustomEvent("bbcode-insert-text", { detail: quote }));
  toast.success("Citation ajoutée", {
    // Une seule notification à la fois : plusieurs citations de suite remplacent la précédente au lieu de s'empiler
    id: "forum-quote-added",
    action: { label: "Voir ma réponse", onClick: showQuickReply },
    // Bouton de la notification à 44 pixels de haut, aux couleurs du thème
    actionButtonStyle: {
      minHeight: 44,
      padding: "0 14px",
      fontSize: 14,
      fontWeight: 700,
      borderRadius: "var(--bb-radius-md)",
      background: "var(--bb-accent)",
      color: "var(--bb-on-accent)",
    },
  });
  return true;
}

interface SelectionQuote {
  source: QuoteSource;
  text: string;
  // Position de la sélection à l'écran, pour placer le bouton sur ordinateur
  top: number;
  bottom: number;
  centerX: number;
}

/** Message citable qui contient ce nœud de la page, ou null. */
function quoteSourceElement(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest<HTMLElement>("[data-quote-post-id]") ?? null;
}

/** Lit la sélection du navigateur : un passage non vide, entièrement dans un seul message citable. */
function readSelection(): SelectionQuote | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  const sourceElement = quoteSourceElement(selection.anchorNode);
  if (!sourceElement || sourceElement !== quoteSourceElement(selection.focusNode)) return null;
  const text = selection.toString().trim();
  if (!text) return null;
  const { quotePostId: postId, authorId, authorName } = sourceElement.dataset;
  if (!postId || !authorId) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  return {
    source: { postId, authorId, authorName: authorName ?? "" },
    text,
    top: rect.top,
    bottom: rect.bottom,
    centerX: rect.left + rect.width / 2,
  };
}

export default function QuoteSelectionButton() {
  const [selected, setSelected] = useState<SelectionQuote | null>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleSelectionChange = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setSelected(readSelection()), SELECTION_DELAY_MS);
    };
    // Sur ordinateur, le bouton suit la sélection quand la page défile
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSelected((current) => (current ? readSelection() : current)));
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.clearTimeout(timerRef.current);
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (!selected) return null;

  const handleQuote = () => {
    sendQuoteToQuickReply(buildQuote(selected.source, selected.text));
    window.getSelection()?.removeAllRanges();
    setSelected(null);
  };

  // Sur ordinateur, au-dessus de la sélection ; dessous si elle touche le haut de l'écran (sous la barre du haut)
  const desktopTop = selected.top - BUTTON_OFFSET_PX < 72 ? selected.bottom + 8 : selected.top - BUTTON_OFFSET_PX;
  const desktopLeft = Math.min(Math.max(selected.centerX, 110), window.innerWidth - 110);

  return (
    <Button
      type="button"
      variant="primary"
      size="tap"
      // Garde la sélection du navigateur intacte au moment de l'appui
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleQuote}
      className="fixed z-[5000] -translate-x-1/2 shadow-[var(--bb-shadow)]"
      style={
        isDesktop
          ? { top: desktopTop, left: desktopLeft }
          : {
              left: "50%",
              bottom:
                "calc(var(--app-bottom-nav-space, 0px) + var(--app-page-bar-space, 0px) + var(--app-cookie-space, 0px) + 12px)",
            }
      }
    >
      <MessageSquareQuote size={18} aria-hidden="true" /> Citer la sélection
    </Button>
  );
}
