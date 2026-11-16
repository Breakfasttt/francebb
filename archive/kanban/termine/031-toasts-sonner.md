---
id: 031
title: Un seul système de toast (sonner)
epic: E05
app: site
depends_on: [030]
adr: 0001
verify: grep react-hot-toast et common/components/Toast = 0 ; test "signalement sans raison" vert
---

# 031 — Un seul système de toast (sonner)

## Action

Remplacer `react-hot-toast` (43 fichiers) et `common/components/Toast` (4 usages) par `toast` de `@bbfrance/ui` (sonner, même API `toast.success/error`). `Toaster` stylé par les variables de thème. Retirer la dépendance `react-hot-toast`.

## Résultat

47 fichiers passent sur `toast` de `@bbfrance/ui` (API identique). `common/components/Toast` supprimé (4 usages convertis, durée 7 s conservée dans l'éditeur BBCode). `react-hot-toast` retiré. Test « signalement sans raison » vert.
