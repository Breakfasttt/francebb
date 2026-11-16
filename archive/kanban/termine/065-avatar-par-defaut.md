---
id: 065
title: Avatar par défaut introuvable
epic: E03
app: site
depends_on: []
adr:
verify: plus aucune réponse 404 pour un avatar par défaut dans les journaux des tests e2e ; un membre sans avatar affiche une image propre dans la messagerie et les tournois
---

# 065 — Avatar par défaut introuvable

## Pourquoi

Repéré pendant la carte 019. Huit composants (messagerie, inscription et résultats de tournoi) affichent `/default-avatar.png` ou `/images/default-avatar.png` quand un membre n'a pas d'avatar. Aucun de ces deux fichiers n'existe dans `public/` : le serveur répond « introuvable » (erreur 404) et le navigateur affiche une image cassée.

## Action

- Choisir un seul avatar par défaut : réutiliser celui que le reste du site affiche déjà pour un membre sans avatar s'il en existe un (chercher un composant d'avatar commun avant tout), sinon ajouter un fichier dans `public/images/`.
- Faire passer les huit composants par ce même avatar, idéalement par un composant ou une fonction commune plutôt que huit chemins recopiés.
- Vérifier l'affichage dans les 7 thèmes et sur téléphone.

## Résultat

Le site n'avait pas de fichier d'avatar par défaut, mais `UserAvatar` affichait déjà une silhouette (icône `User`) pour un membre sans image. Le nouveau composant commun `apps/site/common/components/MemberAvatarImage/` reprend cette silhouette pour les petites images d'avatar sans cadre de rang : il affiche l'image du membre s'il en a une, sinon la silhouette dessinée avec les variables du thème actif (`--glass-bg` pour le fond, `--text-muted` pour la silhouette), donc lisible dans les 7 thèmes et sans fichier à charger. La classe de la page (`.msg-avatar`, `.avatar-xs`, `.coach-avatar`…) continue de donner la taille, l'arrondi et la bordure, si bien que l'avatar par défaut a exactement la place de l'image et ne crée aucun défilement horizontal sur téléphone.

Les dix appels des huit composants passent par ce composant : `RegistrationModule.tsx` (deux), `TournamentResultWidget.tsx`, `/forum/tournament/[id]/results/view`, `ChatBubble.tsx`, `ConversationList.tsx` (deux), `ConversationView.tsx`, `InviteParticipantModal.tsx`, `NewConversationModal.tsx`. Plus aucun fichier ne cite `default-avatar.png`. Le composant est ajouté à l'inventaire du skill `reuse-first`.

Vérifications : `npx tsc --noEmit` sans erreur ; `node scripts/lint-ratchet.mjs` à 840 erreurs pour un plafond de 840 ; nouveau test smoke « un membre sans avatar affiche l'avatar par défaut, sans image introuvable » vert sur ordinateur et sur téléphone (il ouvre la recherche de la messagerie et vérifie l'avatar par défaut et l'absence de toute image en erreur 404) ; aucune ligne `default-avatar` dans le journal des tests (`logs/062-065-e2e.log`). Les écrans de tournoi n'ont pas de tournoi dans le jeu de données de test : ils sont vérifiés par la compilation et par la lecture du code, pas par un test.
