---
id: 190
title: "Petits défauts d'affichage relevés par l'audit"
epic: E10
app: site
depends_on: [189]
verify: "le bandeau des cookies tient sur deux lignes et ne recouvre plus la barre d'envoi ; les onglets du classement et du profil montrent qu'ils défilent ; les textes coupés (recherche, tri des tournois) sont lisibles ; le bouton « Connexion » est masqué sur la page de connexion ; la messagerie a son bouton retour ; la case NAF vide est expliquée ; signatures repliées et images flottantes en pleine largeur sur téléphone ; « Aucun sujet » n'est plus répété ; les textes de l'inscription et de la page d'erreur de connexion sont clairs"
---

# 190 — Petits défauts d'affichage relevés par l'audit

## Pourquoi

Audit, sections 3.4 (autres points de confort) et 4.7, et captures en taille téléphone : une série de petits défauts visibles qui donnent une impression d'inachevé.

## Action

Corriger chaque point de la ligne `verify`, en vérifiant sur téléphone et dans les 8 thèmes, et en ne régénérant les captures de référence que pour les changements voulus.

## Résultat

Le bandeau des cookies tient sur deux lignes à 360 pixels de large (62 pixels de haut au lieu d'environ 100) : « Cookies techniques seulement. En savoir plus », avec « Accepter » et la croix sur la même rangée ; le titre n'est affiché que sur ordinateur. Le lien « En savoir plus » mène aux mentions légales et sa zone d'appui fait 47 pixels de haut. Le bandeau ne s'affiche plus sur les écrans de rédaction (`isComposePath`) et revient sur la page suivante.

Les rangées d'onglets sont corrigées une seule fois, dans `packages/ui/src/tabs.tsx` : `LinkTabs` et `TabsList` estompent le bord du côté où il reste des onglets à voir et se placent d'eux-mêmes sur l'onglet ouvert. Cela vaut pour le classement, le profil, la modération et l'administration ; le code qui centrait l'onglet ouvert dans `StaffPageLayout` est donc retiré.

Les textes coupés sont raccourcis : le champ de la recherche du forum affiche « Rechercher… », et le tri des tournois propose « Plus tôt », « Plus tard », « Moins cher », « Plus cher », « Moins de places » et « Plus de places ». Le bouton « Se connecter / S'inscrire » de la barre du haut est masqué sur `/auth/login`. La messagerie a son bouton retour à gauche du titre sur téléphone.

Sur le profil, la case NAF vide affiche « Non renseigné » ; sur son propre profil, le membre lit en dessous à quoi sert ce numéro et le lien « Ajouter mon numéro » ouvre l'onglet de modification.

Dans un sujet du forum, la signature est repliée sur téléphone derrière « Voir la signature » (44 pixels) et reste ouverte sur ordinateur. Les images et vidéos placées à gauche ou à droite du texte reçoivent la classe `bb-float` (`lib/bbcode.ts`), que `bbcode.css` annule jusqu'à 1024 pixels : elles passent seules sur leur ligne, la vidéo en pleine largeur. Les images d'un message ont pour texte de remplacement « Image du message ». Un forum vide n'affiche plus que « Aucun sujet ».

La page d'erreur de connexion affiche « Code : Verification » en petit au lieu de « ID Erreur: Verification » en police de code ; « lien magique » devient « lien de connexion par e-mail » sur la page de connexion et dans le message d'erreur. L'inscription précise que le reste du profil peut être rempli plus tard, explique en une phrase le numéro NAF et nomme la signature « Signature (texte mis en forme) ».

Vérifié à l'écran en 360 pixels (bandeau, tournois, recherche, classement, connexion, erreur de connexion) et en 1280 pixels pour le bandeau : pas de défilement horizontal. Les pages d'un membre connecté (profil, messagerie, signatures) n'ont pas pu être capturées faute de compte de test dans la base de développement. Les fiches `pages-diverses`, `forum`, `profil-membres`, `messagerie`, `auth` et `classement-statistiques` ainsi que la skill `mobile-ux` sont à jour ; `corepack pnpm check` passe. Les tests e2e modifiés (`connexion.spec.ts`, `coquille-fin.spec.ts`) restent à lancer.
