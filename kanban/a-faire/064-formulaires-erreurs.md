---
id: 064
title: Erreurs lisibles sur les formulaires de création
epic: E03
app: site
depends_on: [052]
adr:
verify: scripts/debt-count.mjs ne compte plus de throw dans createForum, createTopic et createLigue ; une erreur de création s'affiche en notification (test e2e)
---

# 064 — Erreurs lisibles sur les formulaires de création

## Pourquoi

Reste de la carte 052. `createForum`, `createTopic` (7 `throw`) et `createLigue` (2 `throw`) sont branchées directement sur l'attribut `action` d'un formulaire. Une action utilisée ainsi ne peut pas renvoyer de réponse au formulaire : en cas d'erreur, elle lève une exception et le membre voit une page d'erreur au lieu d'un message clair.

## Action

- Pour chacun des trois formulaires, un petit composant côté navigateur appelle l'action, reçoit `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) et affiche l'erreur dans une notification, comme les autres formulaires depuis la carte 052.
- Remplacer les `throw` de ces trois actions par des retours `{ success: false, error }`, sans retirer aucun contrôle de droits.
- Un test e2e par formulaire au moins pour un cas d'erreur.
- Vérifier le formulaire sur téléphone (boutons de 44 pixels, champs en 16 pixels).
