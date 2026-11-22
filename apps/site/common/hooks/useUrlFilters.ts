"use client";

/**
 * Filtres d'une liste gardés dans l'adresse de la page (carte 196), pour les listes chargées dans le navigateur
 * (ressources, annuaire des membres, classement, carte).
 *
 * Au premier affichage, la page lit ses réglages dans l'adresse (`useSearchParams`) : un lien partagé ou un retour
 * arrière retrouve la même liste. À chaque changement, `useSyncUrlFilters` réécrit l'adresse avec
 * `window.history.replaceState`, que Next.js prend en charge depuis sa version 14.1 : l'adresse change sans recharger
 * la page depuis le serveur et sans ajouter une entrée à l'historique à chaque touche tapée. Une valeur vide ou égale
 * à sa valeur par défaut n'est pas écrite, pour garder des adresses courtes.
 *
 * Une page qui utilise `useSearchParams` doit être enveloppée dans un `<Suspense>` (exigence de Next.js).
 */

import { useEffect } from "react";

export type UrlFilterValue = string | number | string[] | null | undefined;

/** Texte de l'adresse (sans le « ? ») pour ces réglages ; les tableaux sont écrits séparés par des virgules. */
export function filtersToSearch(values: Record<string, UrlFilterValue>, defaults: Record<string, UrlFilterValue> = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const text = Array.isArray(value) ? value.join(",") : value == null ? "" : String(value);
    const defaultValue = defaults[key];
    const defaultText = Array.isArray(defaultValue) ? defaultValue.join(",") : defaultValue == null ? "" : String(defaultValue);
    if (text !== "" && text !== defaultText) params.set(key, text);
  }
  return params.toString();
}

/** Réécrit l'adresse de la page à chaque changement des réglages, sans recharger la page. */
export function useSyncUrlFilters(values: Record<string, UrlFilterValue>, defaults: Record<string, UrlFilterValue> = {}) {
  const search = filtersToSearch(values, defaults);
  useEffect(() => {
    // Un tour plus tard : au premier affichage, les effets de la page passent avant ceux du routeur de Next.js, qui
    // n'a pas encore pris l'historique en main. Réécrire l'adresse à ce moment-là bloquait ensuite tous les appels au
    // serveur de la page (classement vide à la deuxième visite, quand les fichiers viennent du cache, carte 221).
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      if (url.search.replace(/^\?/, "") === search) return;
      url.search = search;
      // Premier argument nul, comme dans la documentation de Next.js : il y ajoute lui-même ses informations de navigation
      window.history.replaceState(null, "", url);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [search]);
}

/** Lit un nombre entier positif dans l'adresse, ou rend la valeur par défaut. */
export function readPositiveInt(value: string | null, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Lit une liste séparée par des virgules dans l'adresse. */
export function readList(value: string | null): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}
