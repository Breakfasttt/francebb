/**
 * Mise en page commune aux pages de profil `/profile` et `/spy/[id]` (refonte, carte 092). Rangée ici parce qu'un
 * fichier `page.tsx` de Next.js ne peut exporter que sa page.
 */

/** Largeur et marges de la page. */
export const PROFILE_PAGE_CLASS = "mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6";

/** Grille : carte du membre à gauche sur ordinateur, une seule colonne sur téléphone. */
export const PROFILE_LAYOUT_CLASS = "flex flex-col gap-4 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6";
