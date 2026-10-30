---
id: 024
title: Extraire le lecteur BBScheme dans packages/bbscheme-player
epic: E07
app: site
depends_on: [022]
adr: 
verify: `[bbscheme]` rendu dans un post depuis le package
---

# 024 — Extraire le lecteur BBScheme dans packages/bbscheme-player

## Action

`app/bbscheme/*`, modèle `BBSchemeState`, rosters `public/data/roster` ; casse le couplage `common/components/BBCodeContent/BBCodeContent.tsx:4`.

## Périmètre réduit (2026-10-30)

La carte ne crée que le paquet `packages/bbscheme-player`, qui affiche un schéma BBScheme dans un message du forum : c'est ce que demande sa vérification. Le site l'utilise à la place de `app/bbscheme/component/BBSchemePlayer.tsx`, ce qui supprime le lien direct entre `BBCodeContent` et la page `/bbscheme`. Sortir l'éditeur `/bbscheme` dans une application à part est reporté à la carte 071, qui attend la mise en ligne du hub (carte 035).

## Résultat

- Nouveau paquet `packages/bbscheme-player` (nom `@bbfrance/bbscheme-player`), construit comme `packages/ui` : `package.json`, `tsconfig.json`, `CLAUDE.md` et `src/index.ts`. Il contient le lecteur (`BBSchemePlayer.tsx`, `BBSchemePlayer.css`, `BBSchemePlayer-mobile.css`) et ce qu'il utilise : le terrain (`Pitch`), les pions (`Token`) et les types du plateau (`types.ts`, sortis de `app/bbscheme/page.tsx`). Ces fichiers sont copiés à l'identique ; seules les lignes d'import changent, plus trois adaptations imposées par la frontière entre paquet et application.
- Adaptations : le lecteur reçoit la fonction `loadBoard` au lieu d'importer l'action serveur `getBoardState` (un paquet n'accède pas à la base) ; ses six boutons sont ceux de `@bbfrance/ui` au lieu de `ClassicButton`, `CTAButton` et `ToggleButton` du site, avec un nom lu par les lecteurs d'écran ; la règle téléphone qui les porte à 44 pixels vise la classe `bb-player-btn` (point de rupture 1024 pixels inchangé). L'import inutilisé de `Tooltip` est retiré, et `NodeJS.Timeout` devient `ReturnType<typeof setInterval>` (le paquet n'a pas les types de Node).
- Le site importe le lecteur depuis le paquet : `BBCodeContent.tsx` (avec `loadBoard={getBoardState}`) et l'éditeur `app/bbscheme/page.tsx` ; `FigurineBox`, `Dugout`, `Sidebar` et `Toolbar` prennent `Token` et les types dans le paquet. Dépendance `workspace:*` dans `apps/site/package.json`, paquet ajouté à `transpilePackages` dans `next.config.ts`. Les anciens fichiers `component/BBSchemePlayer*`, `Pitch*` et `Token*` du site sont supprimés après vérification de tous leurs usages.
- Couleurs : celles de l'interface du lecteur passent déjà par les variables des thèmes. Les couleurs de jeu du terrain et des pions (`Pitch.css`, `Token.css`, `Token.tsx`) restent écrites en dur, comme avant.
- Test e2e : le sujet `e2e_audit_bbscheme_topic` est maintenant créé par `globalSetup.ts` (et non plus par l'audit mobile pendant que le site tourne). Nouveau test smoke « un message contenant [bbscheme] affiche le lecteur », en taille ordinateur et téléphone : lecteur visible, bouton Lecture, compteur d'images, et sur téléphone bouton de 44 pixels au moins et lecteur pas plus large que l'écran.
- Documentation : `docs/features/bbscheme/README.md`, `ARCHITECTURE.md`, `docs/GLOSSAIRE.md` (« Paquet du dépôt »), skills `reuse-first` et `project-structure`.
- Vérifications : `npx tsc --noEmit` sans erreur dans le site et dans le paquet ; `node scripts/lint-ratchet.mjs` à 817 erreurs (plafond abaissé de 840 à 817 avec `--update`, car le code déplacé n'est plus relu) ; `corepack pnpm build` réussi ; `smoke.spec.ts` et `visual-themes.spec.ts` : 67 réussis.
- Reste : ESLint ne relit pas encore les paquets (des `any` restent dans le code copié) ; `BBCodeContent` importe toujours l'action `getBoardState` de `app/bbscheme/actions.ts` ; l'éditeur en application à part est la carte 071.
