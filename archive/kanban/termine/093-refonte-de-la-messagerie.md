---
id: 093
title: "Refonte de la messagerie"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 8 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 093 — Refonte de la messagerie

## Pourquoi

Refaire la messagerie selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 8 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 8 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Sur téléphone, la liste des conversations puis la conversation en plein écran, comme une application de messagerie, avec la zone de saisie collée en bas au-dessus du clavier.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/messagerie` utilise maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses (`?id=`, `?userId=`), les actions serveur et les données n'ont pas changé.
- **Ordinateur** : deux colonnes de la hauteur de l'écran. À gauche, le titre « Messagerie », le bouton « Nouvelle conversation » et la liste ; la conversation ouverte y est mise en valeur. À droite, la conversation ; sans conversation ouverte, une invitation à en choisir une, avec la note sur le chiffrement.
- **Téléphone** : comme une application de messagerie. La liste seule, puis la conversation en plein écran : en-tête (flèche de retour à la liste, avatar, nom, bouton « Participants », menu « ⋯ »), bulles de messages, zone de saisie collée en bas. La conversation n'a pas sa propre adresse : elle pose l'attribut `data-fullscreen`, qui retire la barre de navigation du bas (`AppShell.css`). Son cadre suit la partie visible de l'écran (`window.visualViewport`) pour que la saisie remonte au-dessus du clavier.
- **Liste** : avatar (ou icône de groupe) avec la pastille des non-lus, nom ou titre du groupe en gras s'il y a des non-lus, heure du dernier message (ou sa date s'il n'est pas du jour ; la durée écoulée reste au survol), participants d'un groupe, début du dernier message sans les balises BBCode.
- **Conversation** : bulles (les siennes à droite sur la couleur douce de l'accent), avatar de l'auteur sur le dernier message d'une suite, nom de l'auteur dans un groupe, heure et date. Fil en `flex-col-reverse` : le plus récent reste en bas sans calcul de défilement. L'éditeur BBCode de la carte 087 est réutilisé tel quel ; seule sa zone de texte est rendue plus basse par la page (2 lignes sur téléphone).
- **Fenêtres** : « Nouvelle discussion », « Ajouter des participants », « Renommer le groupe », « Participants » et la confirmation du départ (`ConfirmDialog`) sont des panneaux qui montent du bas sur téléphone, des fenêtres centrées sur ordinateur. La recherche de coachs est un composant commun aux deux premières (`MemberPicker.tsx`). « Ajouter des participants » et « Renommer le groupe » sont dans le menu « ⋯ », seulement dans un groupe.
- `app/messagerie/page.css` (614 lignes, dont une copie des styles BBCode) est supprimé ; la page importe `app/forum/page.css`, comme `/jouer`. Il n'y avait pas de `page-mobile.css`.
- La carte 113 (sur téléphone, la barre du bas qui réapparaît après une saisie peut faire rater un bouton) ne concerne plus la messagerie : la barre reste retirée pendant toute la conversation.

**Ce qui est vérifié.**
- `tests/e2e/inventaire/messagerie.spec.ts` (7 tests) a été écrit avant la refonte. Pour qu'il trouve les éléments par leur nom, l'ancienne version a d'abord reçu quelques `aria-label` (pastille des non-lus, trois boutons-icônes, champs des fenêtres) et un rôle de bouton sur les résultats de recherche. Il passait alors sur l'ancienne version : 14 sur 14 (une erreur passagère de la petite base de test a été corrigée dans le test en réessayant la requête). Sur la nouvelle version : 14 sur 14, sans autre modification du test.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 585 à 560.
- `coquille.spec.ts`, `smoke.spec.ts` et le test de la messagerie sur les deux tailles : 72 réussis, 1 sauté, 1 échec isolé (la fermeture du navigateur a dépassé le temps permis après des vérifications toutes réussies), passé à la relance.
- Audit mobile de `/messagerie` et d'une conversation (ajoutée à `mobile-audit.spec.ts`) à 360 et 390 pixels : rien de coupé, aucun champ sous 16 pixels. Restent le petit logo et les libellés de la barre du bas (coquille), la pastille de 11 pixels (défaut connu de `CountBadge`) et un lien dans le texte d'un message.
- Captures relues à 360, 390 et 1280 pixels en Vestiaire, Saison 3 et NAF, puis supprimées.

**À essayer à la main sur son téléphone.**
- Ouvrir une conversation depuis la liste, puis toucher la zone de texte : le clavier s'ouvre, la zone de saisie et « Envoyer » doivent rester visibles juste au-dessus de lui, et l'en-tête en haut. Écrire et envoyer un message, puis revenir à la liste avec la flèche.
- Faire défiler un long fil de messages, recevoir un message pendant la lecture (il apparaît en 10 secondes au plus).
- « Nouvelle conversation » : chercher un coach (le champ de recherche doit rester au-dessus du clavier), le choisir, démarrer ; puis créer un groupe avec un titre.
- Dans un groupe : « Participants », menu « ⋯ » puis « Ajouter des participants », « Renommer le groupe », « Quitter la conversation ».
- Le lien « MP » d'un message du forum ou d'un profil doit ouvrir directement la conversation.
- Sur iPhone : vérifier que la page derrière la conversation ne défile pas et que rien ne passe sous la barre de l'iPhone en bas.

**Remarques (hors carte, non corrigées).**
- La liste des participants (`getConversationMessages`) compte aussi les coachs qui ont quitté le groupe : ils restent affichés dans « Participants » et dans le nombre de participants.
- Dans `startConversation` (`app/messagerie/actions.ts`), la variable `otherId` est déclarée mais jamais utilisée (avertissement ESLint).
- Un visiteur non connecté voit toujours « Aucune conversation pour le moment », sans invitation à se connecter (déjà noté dans la fiche).
