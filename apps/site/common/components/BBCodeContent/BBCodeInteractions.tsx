"use client";

import { useEffect } from "react";

/**
 * Comportements des blocs BBCode qui demandent un clic (carte 159) : ouvrir un spoiler, puis le recouvrir.
 * Avant, ces comportements étaient écrits dans le HTML produit (attributs onclick). La politique de sécurité du
 * contenu du site interdit désormais tout code écrit dans le HTML, pour qu'un message piégé ne puisse rien exécuter :
 * un seul écouteur, posé une fois pour toute la page, s'en charge. Monté dans app/layout.tsx.
 * Il couvre tous les endroits qui affichent du BBCode, y compris ceux qui n'utilisent pas BBCodeContent.
 */
export default function BBCodeInteractions() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const rehide = target.closest(".bb-spoiler-rehide");
      if (rehide) {
        rehide.closest(".bb-spoiler-box")?.classList.remove("revealed");
        return;
      }
      target.closest(".bb-spoiler-box")?.classList.add("revealed");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
