/**
 * Mesures d'une page en taille téléphone (carte 049), partagées par l'audit mobile (mobile-audit.spec.ts) et le
 * parcours de fin de carte (tests/parcours/parcours.spec.ts, carte 157) : contenu qui dépasse à droite, cibles
 * tactiles de moins de 44 pixels, textes de moins de 12 pixels, champs de saisie de moins de 16 pixels.
 * Fonction déplacée telle quelle depuis mobile-audit.spec.ts par la carte 157.
 */
import type { Page } from "@playwright/test";

export async function measure(page: Page) {
  return page.evaluate(() => {
    const viewport = window.innerWidth;
    const overflowPx = Math.max(0, document.documentElement.scrollWidth - viewport);
    // Widgets de développement (absents en production) et menu latéral fermé (hors de l'écran) : ignorés
    const ignored = (element: Element) => !!element.closest(".debug-auth-widget, .debug-theme-widget, [class*='debug']");
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none"
        && rect.left < viewport && rect.right > 0 && !ignored(element)
        && !/^Dev (Auth|Theme)/.test((element.textContent ?? "").trim());
    };
    const describe = (element: Element) => {
      const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
      const label = element.getAttribute("aria-label") ?? element.getAttribute("title") ?? "";
      const rect = element.getBoundingClientRect();
      return `${element.tagName.toLowerCase()} « ${text || label || "(icône)"} » ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    };
    // Un élément placé dans un cadre qui défile lui-même de gauche à droite (overflow-x: auto, comme une barre
    // d'outils ou un tableau large) n'est pas coupé : on l'atteint en faisant défiler ce cadre (carte 057)
    const inOwnScrollFrame = (element: Element) => {
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const overflowX = getComputedStyle(parent).overflowX;
        if ((overflowX === "auto" || overflowX === "scroll") && parent.scrollWidth > parent.clientWidth) return true;
      }
      return false;
    };
    const cut = [...document.querySelectorAll("body *")].filter((element) => {
      if (!visible(element) || inOwnScrollFrame(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.right > viewport + 2 && rect.left >= 0;
    });
    const cutRoots = cut.filter((element) => !cut.includes(element.parentElement as Element));
    const targets = [...document.querySelectorAll("a[href], button, [role=button], input[type=checkbox], input[type=radio], select")].filter(visible);
    // Une case à cocher (ou un bouton radio) placée dans une étiquette <label> se coche en touchant toute
    // l'étiquette : la cible réelle est donc l'étiquette, mesurée à sa place (carte 061)
    const touchZone = (element: Element) =>
      element.matches("input[type=checkbox], input[type=radio]") ? element.closest("label") ?? element : element;
    const small = targets.filter((element) => {
      const rect = touchZone(element).getBoundingClientRect();
      return rect.height < 44 || rect.width < 44;
    });
    const texts = [...document.querySelectorAll("p, span, a, li, td, label, small")].filter(
      (element) => visible(element) && (element.textContent ?? "").trim().length > 0 && parseFloat(getComputedStyle(element).fontSize) < 12
    );
    const inputs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea, select")].filter(
      (element) => visible(element) && parseFloat(getComputedStyle(element).fontSize) < 16
    );
    return {
      overflowPx,
      cutCount: cutRoots.length,
      cutElements: cutRoots.slice(0, 6).map((element) => `${describe(element)} (dépasse de ${Math.round(element.getBoundingClientRect().right - viewport)} px)`),
      smallTargetCount: small.length,
      smallTargets: small.slice(0, 8).map(describe),
      tinyTextCount: texts.length,
      // Détail des textes et des champs trop petits (carte 061), avec leur taille de police
      tinyTexts: texts.slice(0, 8).map((element) => `${describe(element)} en ${getComputedStyle(element).fontSize}`),
      zoomingInputs: inputs.length,
      zoomingInputList: inputs.slice(0, 8).map((element) => `${describe(element)} en ${getComputedStyle(element).fontSize}`),
    };
  });
}
