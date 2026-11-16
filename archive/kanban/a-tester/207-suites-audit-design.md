---
id: 207
title: "Suites de l'audit de conception du 16 novembre"
epic:
app: site
depends_on: [206]
verify: "aucun texte de lecture sous 14 pixels sur téléphone (seuls les étiquettes en capitales, les unités, les badges et la barre basse restent à 12 ou 13 pixels) ; les tailles de texte passent par l'échelle de DESIGN.md (plus de valeur isolée comme 1,05 ou 1,2 rem) ; les cadres de rang des avatars gardent leur apparence mais n'animent plus ni ombre ni filtre ; plus de bordure latérale épaisse sur les encadrés ; les mentions légales n'ont plus de fichier page.css ; le détecteur Impeccable ne signale plus que des exceptions documentées ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 207 — Suites de l'audit de conception du 16 novembre

## Pourquoi

L'audit technique du 16 novembre 2026 (`apps/site/.impeccable/audit/`) a noté le site 16 sur 20. Il a relevé quatre points moyens et trois finitions :

- des textes de 12 à 13 pixels, en couleur atténuée, dans les informations sous les sujets du forum et dans plusieurs intertitres, sur téléphone ;
- l'animation sans fin des cadres de rang des avatars (or, diamant), qui redessine une ombre ou un filtre à chaque image et fatigue les téléphones modestes ;
- des tailles de texte isolées (1,05 rem, 1,2 rem, 0,8 rem, 1,0625 rem…) hors de l'échelle de DESIGN.md, qui ne connaît pas non plus le grand titre de l'accueil ;
- trois encadrés avec une bordure gauche épaisse, l'ancien CSS des mentions légales, deux arrondis hors échelle.

Le responsable du projet a décidé que les cadres de rang sont la seule exception assumée au refus du look « jeu vidéo » : ils restent, mais doivent être optimisés.

## Action

1. **Échelle de texte** : ajouter dans `packages/ui/src/tokens.css` les tailles nommées qui manquent (étiquette en capitales, texte de lecture, grand titre), les écrire dans DESIGN.md, puis remplacer les valeurs isolées.
2. **Petits textes** : le texte de lecture et les informations passent à 14 pixels ; seuls les étiquettes en capitales, les unités sous un nombre, les badges et la barre basse restent plus petits.
3. **Cadres de rang** : mêmes couleurs et même mouvement, mais l'animation ne joue plus que sur l'opacité ou la rotation (calculées par la carte graphique, sans redessiner).
4. **Finitions** : encadrés à bordure fine, mentions légales en classes Tailwind sans `page.css`, arrondis sur l'échelle.
5. DESIGN.md : exception des cadres de rang, rôles de texte, échelle mise à jour.

## Résultat

- **Échelle de texte** : quatre tailles nommées dans `packages/ui/src/tokens.css` (`text-bb-label`, `text-bb-lead`, `text-bb-display`, `text-bb-display-lg`) ; DESIGN.md décrit onze rôles, de Display à Caption, et la règle des 14 pixels. Il ne reste plus aucune taille écrite à la main hors de l'échelle.
- **Petits textes** : informations du forum (auteur, date, réponses), aperçus de la messagerie, date des notifications, libellés des éditeurs de résultats et d'archives passent à 14 pixels ; les intertitres en capitales sont unifiés à 13 pixels ; restent à 12 pixels les badges, la barre basse, les tuiles du panneau « Plus », les unités (« points », « CAS ») et l'heure d'un message.
- **Cadres de rang** : la pulsation de l'or est un calque fixe dont seule l'opacité varie ; le diamant ne scintille plus que par l'opacité. Même apparence, sans redessin continu. Exception écrite dans DESIGN.md.
- **Finitions** : encadrés « Aperçu du titre » et « Type de classement CDF » et accordéon BBCode à bordure fine ; mentions légales en classes Tailwind (fichiers `page.css` et `page-mobile.css` supprimés, et sa deuxième balise `<main>`, imbriquée dans celle de la coquille, devient un simple bloc) ; arrondi du panneau « Plus » et de l'étiquette « Banni » sur l'échelle ; icône d'avatar vide en couleur du thème.
- **Vérifications** : `corepack pnpm check` ; détecteur Impeccable (seules restent les exceptions documentées : autres thèmes, cadres de rang, couleur par défaut d'un rôle) ; audit mobile en 360 et 390 pixels sur huit pages (aucun texte sous 12 pixels, aucun élément coupé ; les petites cibles relevées existaient déjà : liens dans le texte, interrupteurs des réglages) ; `test:parcours` ; test d'inventaire des mentions légales.
- **À essayer à la main** : sur un vrai téléphone, un sujet du forum avec un auteur de rang or ou diamant (la pulsation doit rester visible et fluide) et la lisibilité de la liste des sujets.
