---
id: 168
title: "Modération : signalements lisibles et actionnables"
epic: E10
app: site
depends_on: [165]
verify: "un signalement de message affiche l'extrait, l'auteur et un lien vers le message dans le même onglet, avec les boutons Masquer, Ignorer et Voir ; masquer ferme le signalement ; épingler et archiver donnent un retour visible"
---

# 168 — Modération : signalements lisibles et actionnables

## Pourquoi

Un message signalé n'apparaît dans l'écran de modération que sous la forme « Contenu 3f2a9b1c… » : ni texte, ni auteur, ni lien (audit, section 3.3).

## Action

1. `getPendingReportsByType` charge le contenu signalé : extrait, auteur, sujet et page.
2. Une carte par signalement, sur téléphone comme sur ordinateur, avec « Masquer » (ouvre la fenêtre de modération et ferme le signalement), « Ignorer » et « Voir dans le sujet » (dans le même onglet).
3. Les signalements d'un contenu supprimé se ferment d'eux-mêmes.
4. Épingler, verrouiller et archiver affichent une notification et ferment le panneau des outils.

## Résultat

L'écran de modération montre désormais, pour chaque contenu signalé, une fiche lisible sur téléphone comme sur ordinateur : le type de contenu, la raison, le premier membre qui a signalé et la date, puis le contenu lui-même (titre, auteur et extrait de 200 caractères en texte brut). La fonction `getPendingReportsByType` (`apps/site/app/moderation/actions.ts`) charge ce contenu pour les seules fiches de la page affichée ; pour un message, elle calcule la page du sujet où il se trouve, de la même façon que la page du sujet et la recherche du forum (20 messages par page, tri par date puis par identifiant).

Les boutons de la fiche d'un message sont « Voir dans le sujet » (la bonne page, directement sur le message, dans le même onglet), « Masquer » (la fenêtre « Modérer le message » ; le message masqué voit ses signalements se fermer seuls), « Ignorer », « Détails » et, dans le menu « ⋯ », « Marquer comme traité ». Les sujets, coachs, articles et ligues signalés ont la même fiche, avec « Voir » (ou « Voir le profil ») dans le même onglet, « Ignorer » et « Marquer comme traité ». Les ressources n'ont pas de bouton « Signaler » sur le site : il n'y a donc pas de fiche de signalement de ressource.

Les signalements d'un contenu supprimé se ferment d'eux-mêmes : `moderatePost`, `deletePost` et `deleteTopic` (`apps/site/app/forum/actions.ts`) appellent la nouvelle fonction `closePendingReports` (`apps/site/lib/moderationReports.ts`, interne au serveur). Un contenu supprimé autrement (avant cette carte, article ou ligue effacé, message d'un sujet supprimé) s'affiche « Contenu déjà supprimé » avec le seul bouton « Fermer le signalement ».

Dans les outils d'un sujet (`TopicTools.tsx`), épingler et archiver affichent maintenant une notification, ferment le panneau du téléphone et rechargent la page ; verrouiller (`LockButton.tsx`, qui affichait déjà une notification) ferme aussi le panneau.

Vérifications : `corepack pnpm check` passe (types, tests unitaires, ESLint). Un test a été ajouté dans `apps/site/tests/e2e/inventaire/moderation.spec.ts` (fiche d'un message signalé, lien dans le même onglet, « Masquer » qui ferme le signalement) ; il n'a pas encore été lancé, pas plus que les tests de parcours, pour ne pas gêner la carte 167 qui les lance en même temps. Le contrôle à l'œil en taille téléphone reste à faire au moment du `/ship`.
