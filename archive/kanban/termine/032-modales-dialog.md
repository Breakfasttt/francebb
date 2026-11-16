---
id: 032
title: Modales sur Radix Dialog
epic: E05
app: site
depends_on: [030]
adr: 0001
verify: captures "modale de signalement" identiques dans les 7 thèmes ; Échap, clic extérieur et focus piégé fonctionnent
---

# 032 — Modales sur Radix Dialog

## Action

`Modal`, `ConfirmModal`, `ReportModal` et les 3 modales de messagerie gardent leur API et leur CSS, mais leur coquille (portail, overlay, Échap, blocage du scroll) passe sur le Dialog de `@bbfrance/ui` : focus piégé, `role="dialog"`, titre annoncé aux lecteurs d'écran.

## Résultat

`Modal`, `ConfirmModal`, `ReportModal` et les 3 modales de messagerie ont une coquille Radix Dialog ; CSS et API inchangés. Captures des 7 thèmes identiques au pixel. Nouveau : focus piégé, `role=dialog` nommé par le titre, Échap ferme partout. `ConfirmModal` et `ReportModal` ne se ferment toujours pas au clic extérieur (comportement d'origine, évite de perdre une saisie).
