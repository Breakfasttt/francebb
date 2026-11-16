---
id: 092
title: "Refonte du profil et des membres"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 7 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 092 — Refonte du profil et des membres

## Pourquoi

Refaire `/profile` (7 onglets), `/spy/[id]` et `/membres` selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 7 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 7 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Onglets gardés dans l'adresse (`?tab=`). Sur téléphone, liste d'onglets en haut de page plutôt que dans le menu.
- Annuaire des membres en cartes sur téléphone, avec filtres et tri dans un panneau.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/profile` (sept onglets), `/spy/[id]` et `/membres` utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses, le paramètre `?tab=`, les noms des champs du formulaire et les actions serveur n'ont pas changé.
- **Profil** : sur ordinateur, la carte du membre à gauche et les onglets avec leur contenu à droite ; sur téléphone, une seule colonne (carte, rangée d'onglets `LinkTabs` qui défile de côté, contenu). Les onglets ne sont plus dans le panneau « Plus ». Sujets suivis, activité, articles, ressources et bloqués sont des listes dans des cartes pleines, avec la pagination compacte `PageNav`. La pastille « Non lu » est gardée.
- **Éditer mon profil** : blocs empilés comme à l'inscription (avatar, profil de coach, ligues, signature, thème). Le générateur d'avatar, dont le style avait disparu avec la carte 091, est maintenant un composant partagé avec l'inscription (`common/components/AvatarGenerator/AvatarGeneratorSheet.tsx`) : panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur. Le contour d'avatar est une liste (les contours pas encore débloqués sont grisés) : l'ancien `RankSelect`, qui n'était utilisé qu'ici et ne marchait pas au clavier, est supprimé. Le thème se choisit avec `AppShell/ThemePicker`, comme à l'inscription.
- **Gérer mon compte** : blocs « Passeport Blood Bowl » (mode hub), « Moyens de connexion », « Notifications par email » (interrupteurs `Switch`), « Zone de danger ». Les deux confirmations de la suppression du compte passent par `ConfirmDialog`.
- **Profil d'un autre membre** : mêmes carte et onglets ; « Message privé », « Signaler », « Bloquer » et « Bannir » sont juste sous le nom ; chaque action a sa fenêtre de confirmation. La fenêtre de bannissement est partagée avec l'annuaire (`common/components/BanUserDialog/BanUserDialog.tsx`).
- **Annuaire** : recherche toujours visible ; sur ordinateur, filtres au-dessus d'un tableau aux en-têtes triables ; sur téléphone, un membre par carte, et filtres et tri dans le panneau « Filtrer les membres » (bouton « Filtres » avec le nombre de filtres actifs, comme `/tournois`). Filtres actifs en pastilles. « Bannir », « Débannir » et « Supprimer » sont dans le menu « ⋯ » de chaque membre ; « Changer le rôle » reste une liste visible.
- **Rôles en clair** : `getRoleLabel(role, labels)` (`lib/roles.ts`) accepte les libellés de la table `RoleConfig`, lus par `getRoleLabelMap` (`lib/roleLabels.ts`) ou l'action `getRoleLabels`. La carte du profil, la liste des bloqués et l'annuaire n'affichent plus de code brut, y compris pour les rôles personnalisés.
- `PageNav` (`packages/ui`) accepte `onPageChange` : ses flèches deviennent des boutons, pour les listes chargées dans la page.

**Deux bugs corrigés avant l'écriture du test** (l'inventaire les décrit comme des fonctions existantes) : `/profile?tab=activity` ouvrait les sujets suivis, et `/spy/` avec son propre identifiant affichait « Utilisateur introuvable » au lieu de renvoyer vers `/profile`.

**Ce qui est vérifié.**
- `tests/e2e/inventaire/profil.spec.ts` (10 tests) a été écrit avant la refonte et passait sur l'ancienne version en taille ordinateur (10 sur 10) et en taille téléphone (9 sur 10 : la pagination des sujets suivis était cachée sous la barre du bas, défaut corrigé par la refonte). Sur la nouvelle version : 20 sur 20. Seul changement du test après la refonte : le lien « Éditer » d'une ressource est cherché par son nom exact (sinon il trouvait l'onglet « Éditer mon profil »).
- `npx tsc --noEmit` sans erreur (site et `packages/ui`) ; ESLint du site en baisse, plafond abaissé de 633 à 585.
- `connexion.spec.ts` (l'inscription utilise le générateur partagé) : 16 sur 16. `coquille`, `smoke`, `security` sur les deux tailles : tout passe ; deux échecs isolés d'une première passe (liste des bannis de la modération pas encore chargée, création d'un forum sur téléphone) ont passé à la relance. Le test `smoke` du thème cherche maintenant le thème comme bouton radio ou bouton (le profil utilise le sélecteur du menu du compte).
- Audit mobile (`/profile`, ses onglets `edit`, `settings`, `ressources`, `/spy/[id]`, `/membres` avec et sans le panneau des filtres) à 360 et 390 pixels : rien de coupé, aucun champ sous 16 pixels. Restent le petit logo et les libellés de la barre du bas (coquille), et les interrupteurs de notification mesurés à 28 pixels de haut (leur zone d'appui est agrandie à 44 pixels par le composant `Switch`, invisible pour l'audit).
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées.

**À essayer à la main sur son téléphone.**
- `/profile` : passer d'un onglet à l'autre en faisant défiler la rangée d'onglets ; aller à la page 2 des sujets suivis.
- « Éditer mon profil » : « Générer » (le clavier ne doit pas cacher le champ « Graine »), « Aléatoire », envoyer une vraie image, changer de contour, ajouter une ligue, changer de thème, puis « Sauvegarder le profil » (en mode hub, le passeport doit accepter).
- « Gérer mon compte » : basculer un interrupteur de notification, délier puis réassocier Discord ou Google.
- Profil d'un autre membre : bloquer puis débloquer, signaler ; en modérateur, bannir puis débannir.
- `/membres` : chercher un nom, ouvrir « Filtres », choisir une région et « Nom (Z-A) », retirer une pastille ; en modérateur, ouvrir le menu « ⋯ » d'un membre et changer un rôle.

**Remarques (hors carte, non corrigées).**
- Le classement d'un tournoi (`app/forum/component/TournamentResultWidget.tsx`) mène à `/profile/${id}`, une page qui n'existe pas. Les liens morts de la messagerie et des articles cités par l'inventaire avaient déjà été corrigés par la carte 105.
- `/membres` envoie toujours au navigateur la fiche complète de chaque membre (sans `select`), et le filtre « Rôle » ne propose que les rôles de base.
- Le test `security.spec.ts` ne masque pas le bandeau des cookies : sur ordinateur, ce bandeau couvre le bas de la colonne de gauche et peut faire échouer un clic (c'est pour cela que les actions du profil ont été remontées sous le nom).
- `TabSystem` garde une variante `docked-sidebar` qui n'est plus utilisée nulle part.
