# ADR-0009 — Un thème visuel par équipe de Blood Bowl

- **Statut** : accepté, puis révisé le 16 novembre 2026 (voir « Révision ») : le site garde 5 thèmes, pas 35
- **Date** : 2026-11-16
- **Conseil** : oui (`/council`). Cette décision complète l'ADR-0006 sans le remplacer.

> Rédigé pour quelqu'un qui découvre le projet. Les termes techniques sont expliqués sur place ou dans `docs/GLOSSAIRE.md`.

## Le problème

Le site propose 8 thèmes visuels (ADR-0006). Le responsable veut un thème par équipe de la saison 3 de Blood Bowl, soit 31 équipes, chacun avec un terrain dessiné en fond de l'accueil (carte 210). Il veut aussi que « Saison 3 » devienne le thème officiel, avec un terrain en pelouse, et que « Vestiaire » devienne le thème de l'équipe du Chaos.

Faits vérifiés :
- Ajouter un thème demande aujourd'hui de modifier cinq endroits à la main : la liste `SITE_THEMES` (`apps/site/lib/themes.ts`), un fichier de couleurs (`packages/ui/src/themes/<id>.css`), la liste des imports (`themes/index.css`), la liste des tests `E2E_THEMES` (`apps/site/tests/e2e/fixtures.ts`) et la pastille du sélecteur (`ThemePicker.css`).
- Le choix de chaque membre est enregistré par l'identifiant du thème dans `User.theme` (texte libre, « vestiaire » par défaut, `prisma/schema.prisma`). Un identifiant inconnu retombe sur « vestiaire » (`app/profile/actions.ts`, `app/layout.tsx`). Renommer un identifiant obligerait donc à modifier les données des membres.
- Un thème pèse environ 1 Ko ; les 8 thèmes, 8,4 Ko. Le test de contraste tourne sans navigateur sur la liste `SITE_THEMES` ; les captures d'écran font 3 tests et 2 comptes de test par thème.

## La décision

1. **Aucun identifiant de thème ne change.** Seuls les noms affichés changent : `vestiaire` devient « Élus du Chaos (ancien Vestiaire) », `saison3` « Saison 3 (officiel) », `blood` « Khorne », `malpierre` « Skavens » et `nehekhara` « Rois des tombes ». Le thème par défaut reste `vestiaire`, avec ses couleurs. Les thèmes `saison3`, `default` (« Sombre »), `light` (« Clair ») et `naf` forment un groupe « Généraux ».
2. **Une seule source de données** (`packages/ui/src/themes/themeData.mjs`) décrit chaque thème : son nom, son groupe et ses couleurs. Pour un nouveau thème, quelques couleurs de base suffisent : le script `themes:build` calcule les autres et corrige celles qui n'atteignent pas le contraste AA. Il génère les fichiers de couleurs, la liste des imports et la liste des thèmes lue par le site. Les fichiers générés sont enregistrés dans le dépôt : rien n'est calculé pendant que le site tourne. Ajouter une équipe revient à ajouter une entrée.
3. ~~**Le terrain est un seul composant**, avec une surface dessinée par thème.~~ Retiré le 16 novembre 2026 à la demande du responsable, après essai : le terrain dessiné en fond de l'accueil a été jugé disgracieux (carte 214 annulée). L'accueil garde seulement l'en-but et la ligne de mêlée.
4. **Le test de contraste** vérifie tous les thèmes et échoue au premier thème illisible. Les captures d'écran ne portent plus que sur 4 thèmes représentatifs.
5. **Le sélecteur** devient une liste verticale par groupes (Généraux, Chaos, Elfes…), avec des lignes de 44 pixels et un aperçu des couleurs de chaque thème.

## Pourquoi

- Garder les identifiants évite toute migration de données et toute perte du choix des membres (risque bloquant relevé par l'avocat du diable).
- Garder Sombre, Clair et NAF évite de retirer un thème que des membres ont choisi : le site propose donc 35 thèmes (31 équipes, dont 4 reprennent un thème existant, et 4 thèmes généraux).
- Générer les fichiers évite de recopier une trentaine de couleurs par thème, et le contrôle automatique du contraste garantit qu'aucun thème ne devient illisible.
- Options écartées : 8 thèmes avec un terrain choisi à part, ou 8 thèmes rebaptisés (écartées par le responsable) ; un moteur de thèmes calculé pendant que le site tourne (inutile et plus fragile que des fichiers générés).

## Ce qu'on ne fait pas

- Pas de logo, d'image ni de copie des plateaux officiels de Games Workshop.
- Pas de changement du thème par défaut ni du hub, qui reprend le thème par défaut (ADR-0007). Passer à Saison 3 par défaut serait une décision à part.
- Pas de bandeau d'annonce pour l'instant.

## Risques

- Le contraste garantit la lisibilité, pas la beauté : le responsable relit chaque thème.
- Le poids : 35 thèmes font environ 35 Ko de couleurs. Au-delà de 40 Ko, on ne chargera plus que le thème actif.
- Les noms d'équipes sont des marques de Games Workshop : une mention de non-affiliation est ajoutée (carte 217), à valider par le responsable.
- Retour arrière : retirer une entrée du fichier de données et relancer le script ; un identifiant inconnu revient au thème par défaut.

## Cartes

211 à 217.

## Révision du 16 novembre 2026 (carte 218)

Après essai, le responsable du projet a trouvé les 35 thèmes trop nombreux et le terrain dessiné disgracieux (carte 214 annulée). Il garde 5 thèmes : Sombre (identifiant `vestiaire`, ancien Vestiaire, toujours le thème par défaut), Saison 3, NAF, Néhékhara (avec ses couleurs d'avant cet ADR) et Violet (identifiant `elfes-noirs`, l'ancien thème des Elfes noirs).

Ce qui reste de la décision : la source unique `themeData.mjs` et son script (qui supprime désormais le fichier d'un thème retiré), le contrôle du contraste sur tous les thèmes, les captures sur 4 thèmes, et la règle de ne jamais changer l'identifiant d'un thème gardé. Le sélecteur redevient une liste simple, sans rubriques. Les thèmes retirés (Sombre d'avant, d'identifiant `default`, Clair, Blood, Malpierre et les thèmes d'équipe) ne sont plus proposés : un membre qui les avait choisis voit le thème par défaut, sans que son choix enregistré soit effacé de la base. Comme les thèmes ne portent plus de noms d'équipes, la phrase ajoutée aux mentions légales par la carte 217 est retirée.
