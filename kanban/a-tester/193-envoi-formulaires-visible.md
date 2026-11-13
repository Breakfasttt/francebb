---
id: 193
title: "Retour visible pendant l'envoi des formulaires"
epic: E11
app: site
depends_on: []
verify: "sur téléphone, un double appui rapide sur « Publier » (nouveau sujet), « Créer le tournoi » ou un bouton de connexion n'envoie qu'une fois ; pendant l'envoi, le bouton est grisé et montre un indicateur de chargement ; une réaction en cours d'envoi se voit ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 193 — Retour visible pendant l'envoi des formulaires

## Pourquoi

La revue de l'interface du 13 novembre 2026 a montré que, sur une connexion lente, rien n'indique qu'un formulaire est en train de partir :

- `ActionForm` (`apps/site/common/components/Form/ActionForm.tsx:24-39`) sait qu'un envoi est en cours, mais ne le dit qu'aux lecteurs d'écran (`aria-busy`) : le bouton reste actif et identique. Cinq boutons d'envoi sont concernés, par exemple `NewTopicForm.tsx:97`, `LigueForm.tsx:247` et `NewForumForm.tsx:128`.
- `TournamentForm.tsx:534` et `:548` n'utilisent pas `ActionForm` : rien n'empêche un double appui de créer deux tournois.
- Les boutons de la page de connexion (`app/auth/login/page.tsx:114`, `:131`, `:164`, `:180`) n'ont aucun état d'envoi.
- Les réactions des articles (`ArticleReactions.tsx:96`) ne sont pas désactivées pendant l'envoi, et la classe `disabled:opacity-100` (`PostReactions.tsx:105`, `ArticleReactions.tsx:115`) cache l'état désactivé.

## Action

- Après lecture du skill `reuse-first`, créer un bouton d'envoi réutilisable (`SubmitButton`, dans `common/components/Form/`) qui lit l'état du formulaire avec `useFormStatus` (fonction de React qui dit si le formulaire parent est en cours d'envoi) : il se désactive et affiche un indicateur de chargement, en gardant au moins 44 pixels de haut.
- L'utiliser dans les formulaires d'`ActionForm`, dans `TournamentForm` et sur la page de connexion.
- Désactiver les réactions des articles pendant l'envoi et rendre l'état visible sur les deux grilles de réactions.
- Vérifier en 360 pixels de large, avec une connexion ralentie dans les outils du navigateur.
- Mettre à jour le skill `reuse-first` et le skill `ui-components` avec le nouveau bouton.

## Résultat

Le nouveau composant `SubmitButton` (`apps/site/common/components/Form/SubmitButton.tsx`) est un bouton d'envoi qui sait si son formulaire est en train de partir : dans un `ActionForm`, par le contexte `FormPendingContext` que celui-ci fournit maintenant (un `ActionForm` envoie par `onSubmit`, que `useFormStatus` ne voit pas) ; dans un `<form action={…}>` classique, par `useFormStatus` de React. Pendant l'envoi, il se désactive (le second appui ne renvoie rien), porte `aria-busy` et remplace son icône (prop `icon`) par un indicateur de chargement, qui ne tourne que si le système n'a pas demandé de réduire les animations (`motion-safe:animate-spin`). Il est en variante `primary` et en taille `tap` (44 pixels) par défaut.

Il remplace les boutons d'envoi de la création d'un sujet, d'un forum et d'une ligue (formulaires `ActionForm`), du formulaire de tournoi (création et modification, auparavant sans aucune protection contre le double envoi) et des quatre boutons de la page de connexion (Discord, Google, lien par e-mail, comptes de test du hub). Les libellés n'ont pas changé, donc les tests qui cherchent les boutons par leur nom restent valables.

Réactions : la grille d'émojis des articles est désactivée pendant l'envoi, comme celle du forum l'était déjà. Les pastilles de réaction des articles et du forum s'estompent pendant l'envoi (`disabled:opacity-60`) ; elles gardent leur aspect net quand elles sont désactivées parce que le visiteur ne peut pas réagir, ce qui était la raison de `disabled:opacity-100`.

Non traité : le bouton d'envoi de la lettre d'information de test du profil (`ProfileSettings.tsx:244`), réservé au développement.

Vérifications : `corepack pnpm check` passe. Le test de parcours n'a pas été relancé (tests longs regroupés en fin de série, à la demande du user). Les skills `reuse-first` et `ui-components` et la fiche `forum` sont à jour.

À essayer à la main : avec une connexion ralentie (outils du navigateur, « 3G lente »), créer un sujet et un tournoi en appuyant deux fois de suite sur « Publier » : un seul envoi, bouton grisé avec indicateur ; même essai sur la page de connexion.
