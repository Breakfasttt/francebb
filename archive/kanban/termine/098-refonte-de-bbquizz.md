---
id: 098
title: "Refonte de BBQuizz"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 14 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 098 — Refonte de BBQuizz

## Pourquoi

Refaire BBQuizz : jeu, classement, proposer, valider, éditer selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 14 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 14 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/bbquizz`, `/bbquizz/proposer`, `/bbquizz/valider` et `/bbquizz/editer` utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses (dont `?edit=`), les données envoyées et les actions serveur n'ont pas changé ; la logique d'une partie (phases, chronomètres, jokers, passage automatique après 5 secondes) a été recopiée telle quelle, seul l'affichage a changé.
- **`/bbquizz`** : titre « Quizz Blood Bowl » avec « Proposer une question » et, pour la modération, un menu « Gestion du quizz » (« Valider les propositions », « Éditer les questions »). L'accueil du jeu rappelle les règles (temps, points, jokers) et propose « Commencer le quizz ! ». Le classement est une carte avec trois onglets (« Du jour », « Semaine », « Panthéon »), à droite sur ordinateur et sous le jeu sur téléphone.
- **Partie** : une barre en haut de la carte montre « Question N / 20 », le chronomètre (orange pendant la lecture, gris une fois la réponse donnée) et le score ; une fine barre de temps la suit. Les quatre réponses sont de grands boutons pleine largeur sur téléphone (deux colonnes sur ordinateur), floutés pendant les 5 secondes de lecture. Jokers « 50/50 » (réponses barrées), « Communauté » (pourcentage en barre dans chaque réponse) et « Passer », sur une ligne. Après la réponse, les jokers laissent la place aux points (« +112 points »), à l'explication et à « Suivant » (avant : « Continuer »). Sur téléphone, pendant la partie, le titre de la page et le classement sont masqués : la question, le chronomètre, le score, les réponses et les jokers tiennent dans l'écran sans défiler. Écran de fin : score, bonnes réponses, temps total et « Rejouer » (avant : « Recommencer une partie »).
- **Proposer et éditer** : un seul formulaire `QuizForm` en trois blocs (la question et sa catégorie, les quatre réponses avec « Bonne réponse » à cocher sur une ligne de 44 pixels, l'explication facultative) dans `ComposeScreen` : plein écran sur téléphone, « Annuler » et « Envoyer » ou « Enregistrer » collés en bas ; colonne « Envoi » sur ordinateur. `isComposePath` connaît `/bbquizz/proposer` et `/bbquizz/editer`. Comme il ne lit que le chemin de l'adresse, la liste de `/bbquizz/editer` est elle aussi sans barre du bas (le formulaire de modification s'ouvre sur la même adresse, avec `?edit=`).
- **Valider** : une carte par proposition (auteur, date, catégorie, question, réponses avec la bonne en vert, explication), « Rejeter » et « Approuver » côte à côte.
- **Éditer** : recherche, lien « Proposer », liste des questions avec « Éditer » et « Supprimer » en boutons de 44 pixels. La suppression passe par `ConfirmDialog` au lieu de la fenêtre `confirm()` du navigateur ; l'action est la même.
- **Petit changement de fond** : dans le formulaire de modification, une question dont la catégorie n'est pas dans la liste (par exemple « Positionnels ») voit maintenant sa vraie catégorie dans la liste déroulante ; avant, la liste affichait « Règles » tout en gardant l'ancienne catégorie à l'enregistrement.

**Fichiers.**
- Nouveaux : `apps/site/app/bbquizz/component/QuizEngine.tsx`, `QuizForm.tsx`, `QuizLeaderboard.tsx`, `apps/site/app/bbquizz/editer/EditQuestion.tsx`, `apps/site/tests/e2e/inventaire/bbquizz.spec.ts`.
- Refaits : `app/bbquizz/page.tsx`, `proposer/page.tsx`, `proposer/ProposerContent.tsx`, `valider/page.tsx`, `valider/ValiderContent.tsx`, `editer/page.tsx`, `editer/EditerContent.tsx`.
- Modifiés : `common/components/AppShell/navItems.ts` (`isComposePath`), `tests/e2e/security.spec.ts`, `tests/e2e/mobile-audit.spec.ts`, `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/bbquizz/README.md`, `docs/GLOSSAIRE.md` (« Rôle ARIA », « Écran de rédaction »).
- Supprimés (plus importés nulle part) : `app/bbquizz/page.css`, `page-mobile.css`, ceux de `proposer/`, `valider/` et `editer/`, et les dossiers `component/QuizEngine/`, `component/QuizForm/`, `component/QuizLeaderboard/` (3 fichiers chacun).

**Ce qui est vérifié.**
- `tests/e2e/inventaire/bbquizz.spec.ts` (9 tests) a été écrit avant la refonte ; l'ancienne version a seulement reçu des noms accessibles (groupe « Réponses », « Catégorie », « Réponse A » à « D », « Bonne réponse : A » à « D », « Rechercher une question », « Éditer », « Supprimer », « Approuver » et « Rejeter » suivis de la question). Il passait sur l'ancienne version : 9 sur 9 en ordinateur, 9 sur 9 en téléphone. Sur la nouvelle : 18 sur 18, sans modification du test.
- `security.spec.ts` : le test BBQuizz repérait la question, les réponses, les points et le score par des classes CSS. Il les repère maintenant par rôle et nom accessible (zone « Question en cours », groupe « Réponses », annonce « +N points », annonce « Score »), avec les mêmes vérifications : rien de la bonne réponse avant la réponse, points positifs après une bonne réponse, score affiché égal au score calculé par le serveur. Il passait avant (7 sur 7) et passe après, rejoué trois fois : 21 sur 21.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 449 à 435.
- `bbquizz`, `coquille` et `smoke` sur les deux tailles : 77 réussis, 1 ignoré (test de la barre basse prévu pour le téléphone seulement).
- Audit mobile (`/bbquizz`, `/bbquizz/proposer`, `/bbquizz/valider` avec une proposition de l'audit, `/bbquizz/editer`) à 360 et 390 pixels : aucun champ sous 16 pixels, rien de coupé ; restent seulement le logo et les libellés de la barre du bas (coquille).
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : le chronomètre qui restait en couleur après la réponse, une icône en double à côté de « Bonne réponse », le texte d'aide de la recherche coupé sur téléphone.

**Choix à valider par le responsable.** « Éditer » et « Valider » rangés dans le menu « Gestion du quizz » ; titre et classement masqués pendant une partie sur téléphone ; réponses floutées pendant la lecture (comme avant) ; réponses retirées par le 50/50 barrées plutôt qu'effacées ; liste de `/bbquizz/editer` sans barre du bas ; « Annuler » ramène au quizz ou à la liste.

**À essayer à la main sur son téléphone.**
- `/bbquizz` : jouer une partie entière ; vérifier que la question, le chronomètre, le score et les quatre réponses tiennent dans l'écran, essayer les trois jokers, laisser filer le temps sur une question, attendre le passage automatique après une réponse, puis « Rejouer ».
- Changer d'onglet dans le classement (« Du jour », « Semaine », « Panthéon »).
- « Proposer une question » : remplir les quatre réponses, choisir la bonne, envoyer depuis la barre du bas ; vérifier que le clavier ne cache pas le champ en cours.
- En modérateur : « Gestion du quizz », approuver puis rejeter une proposition ; dans « Éditer les questions », chercher, modifier, supprimer avec la confirmation.

**Remarques (hors carte, non corrigées).**
- `updateQuizQuestion` enregistre tel quel l'objet reçu (`data: any`) : un modérateur pourrait y glisser d'autres colonnes (par exemple les compteurs du joker communauté).
- `suggestQuizQuestion` ne vérifie rien côté serveur (réponses vides, bonne réponse hors de 0 à 3, textes très longs) ; seul le navigateur exige les champs.
- `handleQuizSuggestion` ne vérifie pas que la proposition est encore en attente : approuver deux fois (deux onglets) crée deux questions identiques ; rejeter une proposition inconnue provoque une erreur non gérée.
- Le classement « Semaine » commence le dimanche (et non le lundi), à l'heure du serveur.
- La série (`quizStreak`) est affichée mais n'est jamais mise à jour (déjà noté dans la fiche).
- Le titre de la question reste en bleu marine en Saison 3 (règle `[data-theme='saison3'] h2`, défaut connu prévu pour la carte 101).
