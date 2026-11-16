---
id: 192
title: "Avatars de rang : animations, contraste et texte"
epic: E11
app: site
depends_on: []
verify: "avec le réglage « réduire les animations » activé sur le téléphone, les cadres de rang ne pulsent plus et ne tournent plus ; le bandeau « banni » se lit à 360 pixels (au moins 12 pixels, couleurs de danger du thème) dans les 8 thèmes ; le liseré clair des cadres reste visible dans le thème clair ; corepack pnpm check passe"
---

# 192 — Avatars de rang : animations, contraste et texte

## Pourquoi

La revue de l'interface du 13 novembre 2026 a trouvé dans `apps/site/common/components/UserAvatar/UserAvatar.css` les défauts les plus visibles du site, puisque les avatars apparaissent sur presque toutes les pages :

- les animations sans fin des cadres de rang (`gold-pulse`, `diamond-shimmer`, `master-rotate`, lignes 76, 124, 147 et 173) ignorent le réglage « réduire les animations » du système. Ce réglage sert aux personnes que les mouvements gênent ou rendent malades ; les autres feuilles de style du site le respectent déjà (`globals.css`, `AppShell.css`, `MorePanel.css`, `bbcode.css`) ;
- `transition: all 0.3s` (lignes 7 et 39) anime toutes les propriétés, y compris les dimensions, ce qui coûte cher au navigateur ;
- le bandeau « banni » (lignes 216 à 218) est écrit en 9,6 pixels, sous le minimum de 12 pixels du skill `mobile-ux`, avec un rouge et un blanc écrits en dur au lieu des couleurs du thème ;
- des blancs translucides écrits en dur (`rgba(255,255,255,…)`, lignes 21 et 44) disparaissent sur le thème clair ;
- l'image de l'avatar (`UserAvatar.tsx:89`) est chargée tout de suite, même hors de l'écran, alors qu'un sujet du forum en affiche des dizaines.

## Action

- Ajouter un bloc `@media (prefers-reduced-motion: reduce)` qui arrête les trois animations, sur le modèle de `globals.css`.
- Remplacer `transition: all` par la liste des propriétés réellement animées.
- Bandeau « banni » : couleurs `--bb-danger` et `--bb-on-danger`, taille portée à 0,75 rem (12 pixels).
- Remplacer les blancs translucides par une variable de thème lisible sur fond clair comme sur fond sombre (voir le skill `theming-rules`).
- Ajouter `loading="lazy"` (chargement différé : l'image n'est téléchargée qu'à l'approche de l'écran) sur l'image de l'avatar.
- Vérifier en 360 pixels de large, dans les 8 thèmes, avec et sans le réglage « réduire les animations ».

## Résultat

`UserAvatar.css` a maintenant un bloc `@media (prefers-reduced-motion: reduce)` qui arrête la pulsation des cadres or, le scintillement du diamant et la rotation des cadres maître et grand maître, ainsi que les transitions, quand le système du coach demande de réduire les animations. Les deux `transition: all` ne portent plus que sur les propriétés qui changent vraiment (ombre, couleur de bord, opacité). Le bandeau « banni » est écrit en 12 pixels (au lieu de 9,6), aux couleurs `--bb-danger` et `--bb-on-danger` du thème ; son espacement a été un peu resserré pour qu'il tienne sur un petit avatar. Les blancs translucides écrits en dur sont remplacés par `--bb-border` : le liseré des membres sans rang est donc visible dans tous les thèmes, et un peu plus marqué qu'avant dans les thèmes sombres. L'image de l'avatar est chargée en différé (`loading="lazy"`, `decoding="async"`). Les couleurs propres à chaque rang n'ont pas changé.

Vérifications : `corepack pnpm check` passe ; le test de parcours de fin de carte passe (26 pages, en taille téléphone) ; les temps de réponse des 5 pages principales restent sous 1000 ms (sujet du forum : 365 ms). La fiche `profil-membres` et le glossaire (« Chargement différé », « Réduire les animations ») sont à jour.

À essayer à la main, car l'IA n'a pas vu le rendu à l'écran : sur un vrai téléphone, activer « réduire les animations » et ouvrir un sujet dont un auteur a le rang or ou plus (le cadre doit rester immobile) ; regarder le bandeau « banni » dans deux ou trois thèmes, dont le thème clair ; vérifier que le liseré des avatars sans rang n'est pas trop marqué dans les thèmes sombres (sinon, l'atténuer avec `color-mix`).
