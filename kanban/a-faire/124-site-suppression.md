---
id: 124
title: Le site traite la suppression d'un compte
epic: E09
app: site
depends_on: [122, 123]
adr: 0007
verify: test e2e - après user.deleted, aucune ligne du site ne contient plus l'email, le nom de coach ni le numéro NAF du compte
---

# 124 — Le site traite la suppression d'un compte

## Pourquoi

La suppression actuelle (`apps/site/lib/accountDeletion.ts`) laisse des traces :
- le nom de coach et le numéro NAF dans les résultats de tournoi ;
- l'email dans `MailLog` et `LegacyMember` ;
- le créateur dans `BBSchemeState` ;
- les données d'un Super Admin qui supprime son propre compte, qui ne sont pas vidées.

## Action

- Traiter `user.deleted` en appelant `anonymizeAndDeleteUser`, puis envoyer l'accusé de réception.
- Pour les résultats de tournoi, garder l'historique sportif (intérêt légitime), mais remplacer le nom et le NAF par un pseudonyme.
- Nettoyer `MailLog.to`, `LegacyMember`, `BBSchemeState.creatorId` et traiter le cas du Super Admin.
- Faire pointer le bouton « Supprimer mon compte » du site vers la page de suppression du passeport.
- Mettre à jour `docs/features/profil-membres/README.md`.
