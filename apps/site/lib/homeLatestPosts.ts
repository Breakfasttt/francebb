/**
 * Début lisible d'un message du forum, affiché sous chaque sujet du bloc « Forum » des accueils
 * (`app/component/homeData.ts`). Ce fichier portait aussi la liste des derniers messages de l'ancien accueil du
 * visiteur, mise à jour en direct (carte 205) ; elle a disparu le 17 novembre 2026, quand cet accueil a repris les
 * blocs de celui du membre.
 */
import { stripBBCode } from "@/lib/bbcode";

/** Longueur maximale du début de message affiché, en caractères. */
const EXCERPT_LENGTH = 140;

/**
 * Début lisible d'un message : sans les citations (le texte cité n'est pas celui de l'auteur), sans balises BBCode,
 * espaces regroupés, coupé à `EXCERPT_LENGTH` caractères avec « … ».
 */
export function postExcerpt(content: string): string {
  let text = content;
  // Retire les citations de l'intérieur vers l'extérieur, pour venir à bout des citations imbriquées
  const innerQuote = /\[quote[^\]]*\](?:(?!\[quote)[\s\S])*?\[\/quote\]/gi;
  while (innerQuote.test(text)) text = text.replace(innerQuote, " ");
  text = stripBBCode(text).replace(/\s+/g, " ").trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH - 1).trimEnd()}…` : text;
}
