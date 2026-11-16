---
id: 061
title: "Mobile : derniers défauts de l'audit"
epic: E03
app: site
depends_on: [058]
adr:
verify: audit mobile complet à 0 cible trop petite et 0 texte sous 12 px (hors liens de texte et faux positifs écrits dans docs/mobile-audit.md), /administration mesurée avec un compte administrateur
---

# 061 — Mobile : derniers défauts de l'audit

## Pourquoi

Après les cartes 053 à 058, l'audit mobile relève encore 20 cibles tactiles trop petites et 4 textes de moins de 12 pixels. D'autres défauts ont été notés pendant ces cartes sans entrer dans leur périmètre.

## Action

- Corriger les cibles trop petites restantes, dont les 9 cases à cocher de 22 pixels de `/tournois`.
- Corriger les 4 textes de moins de 12 pixels de `/profile`.
- Faire mesurer `/administration` par l'audit avec un compte administrateur : un modérateur est renvoyé vers l'accueil, la page n'est donc pas mesurée aujourd'hui.
- Liste des tournois : sous 900 pixels, les colonnes lieu, format et prix disparaissent ; les rendre visibles autrement (par exemple dans la carte du tournoi) sur téléphone.
- BBScheme : le décalage fixe de 168 pixels sous la barre de navigation, le zoom à deux doigts sur le terrain, et le lecteur `BBSchemePlayer` affiché dans les messages du forum.

## Résultat

- **Audit mobile complet** (`MOBILE_AUDIT=1`, 360 et 390 pixels) : avant la carte, sur les 28 pages, 24 cibles trop petites, 4 textes de moins de 12 pixels, 2 champs sous 16 pixels et 6 éléments coupés. Après, sur 30 mesures par taille d'écran (les 28 pages, plus le panneau de filtres de `/tournois` et un sujet avec un schéma BBScheme) : 8 cibles trop petites, 0 texte sous 12 pixels, 0 champ sous 16 pixels, 6 éléments coupés. Les restes sont les faux positifs et liens de texte écrits dans `docs/mobile-audit.md` : les deux liens du crédit de `/carte` (« Leaflet », « OpenStreetMap », obligatoires) et ses tuiles coupées par le cadre de la carte, les deux liens dans le texte de `/mentions-legales`. Relevés dans `logs/061-audit-avant.json` et `logs/061-audit-apres.json`.
- **Outil d'audit** (`tests/e2e/mobile-audit.spec.ts`) : filtre facultatif `MOBILE_AUDIT_PAGES` (par exemple `profile,tournois`) pour ne mesurer que quelques pages, résumé d'une ligne par page et par taille d'écran (affiché et écrit dans `logs/mobile-audit-summary.txt`), détail des textes et champs trop petits avec leur taille de police. Il mesure aussi `/administration` avec un compte administrateur créé pour l'occasion, `/tournois` une seconde fois avec le panneau de filtres ouvert, et un sujet dont le message contient un schéma BBScheme. Une case à cocher placée dans une étiquette est mesurée avec son étiquette, puisque toucher l'étiquette coche la case. Documenté dans `docs/mobile-audit.md` et le skill `mobile-ux`.
- **Cases à cocher de `/tournois`** (22 pixels) : toute leur ligne, de 44 pixels de haut, les coche déjà. L'audit les mesure maintenant avec leur étiquette, panneau ouvert : 0 défaut. Même chose pour les cases « Épingler » et « Verrouiller » de la création de sujet.
- **Textes de `/profile`** : les intitulés « NAF » et « Messages » (11,2 pixels) passent à 12 pixels sur téléphone, pour tout le site (`StatItem-mobile.css`) ; dans la carte du profil, les intitulés « Région », « Équipe », « Ligues » et les étiquettes des ligues aussi (`app/profile/page-mobile.css`).
- **`/administration`** : mesurée en administrateur. Le champ « Communauté Discord » était en 15,2 pixels ; tous les champs de l'administration passent en 16 pixels sur téléphone (`app/administration/page-mobile.css`).
- **Liste des tournois** : sous 900 pixels, le lieu, le format et le prix sont repris sur une ligne sous le nom du tournoi (`app/tournois/page.tsx`, `page.css`, `page-mobile.css`). Non mesuré par l'audit : la base de test ne contient aucun tournoi.
- **Autres cibles** : onglets de `/classement` de 43,8 à 48 pixels ; lien « Prochaine étape » de `/jouer` de 24 à 44 pixels.
- **BBScheme, décalage de 168 pixels** : il comptait une barre de navigation de 58 pixels, alors qu'elle en mesure 64 ; les outils recouvraient le bas de la barre. Le décalage est maintenant calculé depuis une variable CSS `--mobile-nav-height` (`globals-mobile.css`, utilisée aussi par la barre elle-même) et `--bbscheme-mobile-top` au début de `app/bbscheme/page-mobile.css`.
- **Lecteur `BBSchemePlayer` dans les messages** : ses commandes dépassaient de 172 à 202 pixels sur téléphone, avec des boutons de 28 pixels et un champ de vitesse en 13,6 pixels. Nouveau fichier `BBSchemePlayer-mobile.css` : commandes sur deux lignes, boutons de 44 pixels, champ en 16 pixels. Mesuré : 0 défaut.
- **Reporté : zoom à deux doigts sur le terrain de BBScheme**, nouvelle carte 068. Il faut gérer les gestes tactiles dans l'éditeur (plus de 1 600 lignes) sans casser le déplacement des joueurs, le dessin et le défilement au doigt, et le tester sur un vrai téléphone : c'est un travail à part entière.
- **Vérifications** : types, 0 erreur ; ESLint, 840 erreurs, égal au plafond ; suite e2e complète (`logs/061-e2e.log`) : 71 réussis, 1 ignoré volontairement (l'audit), dont les captures ordinateur des 7 thèmes, inchangées. Fiches mises à jour : `tournois`, `profil-membres`, `classement-statistiques`, `pages-diverses`, `administration`, `bbscheme` ; glossaire : « Variable CSS ».
