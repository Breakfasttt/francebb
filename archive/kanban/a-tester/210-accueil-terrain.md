---
id: 210
title: "Accueil sur le terrain : visiteur et membre"
epic: E11
app: site
depends_on: [205, 207]
verify: "un visiteur voit la feuille de match sur le terrain (« Tu joues déjà » avec « Aller au forum » et Discord, « Tu découvres » avec « Blood Bowl, c'est quoi ? »), puis les prochains tournois, les derniers messages, l'article au hasard et les rubriques ; un membre connecté voit, dans cet ordre, « Aller au forum » et Discord, ses trois derniers messages non lus, les prochains tournois avec « Créer », les ligues de sa région avec « Créer » et la carte, les articles avec « Écrire », puis les autres rubriques ; aucun classement sur l'accueil ; un message d'un forum réservé n'apparaît jamais à qui ne peut pas le lire ; lisible et sans défilement horizontal en 360, 390 et 1440 pixels, dans plusieurs thèmes ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 210 — Accueil sur le terrain : visiteur et membre

## Pourquoi

Revue de l'accueil avec le responsable du projet le 16 novembre 2026 (outil de conception Impeccable, esquisses dans `apps/site/.impeccable/mocks/decision/`) :

- l'accueil est une suite de blocs de même forme, sans rien qui domine ;
- il ne « sent » pas Blood Bowl ;
- il ne montre rien de personnel au membre connecté ;
- le plus important est l'accès au forum ; pour un nouveau joueur, c'est la page « Blood Bowl, c'est quoi ? » (`/jouer`) ; Discord doit être facile à trouver, moins que le forum ;
- pas de classement sur l'accueil.

## Action

Deux accueils, sur un même fond : le terrain de Blood Bowl vu du dessus (quadrillage des cases, en-but rouge, couloirs, ligne de mêlée), dans les couleurs du thème actif.

1. **Visiteur** : la feuille de match. En haut, « Tu joues déjà » : « Aller au forum » (bouton principal), Discord, l'activité du jour, Tournois et Classement. La ligne de mêlée, marquée « contre ». En bas, « Tu découvres » : « Blood Bowl, c'est quoi ? », « Ligue près de moi », Ressources. Puis les prochains tournois, les derniers messages (mis à jour en direct, carte 205), l'article au hasard et les rubriques. Sur ordinateur, le terrain se couche : les deux équipes côte à côte, la ligne de mêlée verticale.
2. **Membre connecté**, dans cet ordre : « Salut … », « Aller au forum » et Discord ; ses trois derniers messages non lus du forum ; les prochains tournois avec « Créer » ; les ligues de sa région avec « Créer » et un lien vers la carte (sur ordinateur, une petite carte chargée seulement quand le bloc apparaît) ; les articles avec « Écrire » ; les autres rubriques. Sur ordinateur, le forum et les articles à gauche, les tournois et les ligues à droite.
3. Discord seulement si l'invitation est réglée dans l'administration (carte 189).
4. Adapter `tests/e2e/inventaire/accueil.spec.ts`, la fiche `docs/features/pages-diverses/README.md`, `docs/refonte/inventaire.md` et DESIGN.md (le terrain, motif de l'accueil).

## Résultat

- **Deux accueils** (`app/component/VisitorHome.tsx`, `MemberHome.tsx`), choisis par `app/page.tsx` ; requêtes dans `app/component/homeData.ts`, blocs partagés dans `HomeBlocks.tsx`, terrain dans `PitchField.tsx`. Les esquisses validées avec le responsable sont dans `apps/site/.impeccable/mocks/decision/` (fichiers locaux).
- **Visiteur** : feuille de match sur le terrain (« Tu joues déjà » / « contre » / « Tu découvres »), puis tournois, derniers messages, article au hasard et rubriques. Sur ordinateur, terrain couché : camps côte à côte, ligne de mêlée verticale, en-buts et couloirs. L'activité du jour est masquée quand elle vaut zéro.
- **Membre** : « Salut … », « Aller au forum » et Discord ; 3 sujets non lus (même liste que `/forum/unread`) ; tournois avec « Créer » et « Tu es inscrit » ; ligues de sa région (repli sur les dernières ligues) avec « Créer » et la carte ; articles avec « Écrire » ; autres rubriques. Sur ordinateur, petite carte des ligues (`LiguesMiniMap.tsx`), chargée seulement quand le bloc apparaît : `LeafletMapContainer` a reçu l'option `compact` (cadrage sur les points, pas de zoom à la molette ; `/carte` inchangée) et ses classes de thème sont passées telles quelles dans `app/carte/component/leafletTheme.ts`.
- **Tests** : `tests/e2e/inventaire/accueil.spec.ts` adapté (feuille de match, ordre de l'accueil du membre, non-lus jamais réservés sauf pour un modérateur) ; l'audit mobile mesure aussi l'accueil du membre.
- **Documentation** : fiche `docs/features/pages-diverses/README.md`, `docs/refonte/inventaire.md`, DESIGN.md (« Terrain de l'accueil »).
- **Vérifications** : `corepack pnpm check` ; tests de l'accueil (24 cas ; un cas des derniers messages a échoué une fois dans l'enchaînement à cause du cache de 30 secondes, puis passé seul) ; audit mobile de l'accueil visiteur et membre en 360 et 390 pixels (aucun défaut) ; `test:parcours` ; relecture finale par l'agent de relecture d'Impeccable, six correctifs appliqués et notés résolus, plus un dernier écart (couloir collé au titre) corrigé et vérifié sur capture.
- **À essayer à la main** : la base de test n'a ni tournoi, ni article, ni ligue ; vérifier sur de vraies données la petite carte des ligues, l'article au hasard, les tournois remplis et le bouton Discord, sur téléphone et sur ordinateur.

**Mise à jour du 16 novembre 2026** : à la demande du responsable, le fond dessiné (quadrillage, surfaces, couloirs, en-buts latéraux sur ordinateur) est retiré. L'accueil garde la feuille de match du visiteur, l'en-but derrière le titre et la ligne de mêlée « contre » ; la marge du visiteur sur ordinateur revient à 24 pixels.
