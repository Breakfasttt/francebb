---
id: 212
title: "Contraste bloquant et captures réduites"
epic: E11
app: site
depends_on: [211]
adr: 0009
verify: "le test de contraste vérifie tous les thèmes et échoue sur un thème illisible ; les captures ne portent plus que sur 4 thèmes ; le commentaire de themes/index.css et l'en-tête de visual-themes.spec.ts sont justes"
---

# 212 — Contraste bloquant et captures réduites

## Pourquoi

Avec 35 thèmes, des captures pour chaque thème rallongeraient trop les tests (environ 124 captures), alors que le contraste se vérifie sans navigateur (ADR-0009).

## Action

1. Le test de contraste lit la liste générée et vérifie tous les thèmes.
2. Les captures d'écran ne portent que sur 4 thèmes représentatifs.
3. Corriger le commentaire de `themes/index.css` et l'en-tête périmé de `visual-themes.spec.ts`.

## Résultat

Fait : le test de contraste lisait déjà chaque fichier de thème et échoue au premier écart ; son en-tête est mis à jour. Les captures (`visual-themes.spec.ts`) ne portent plus que sur `E2E_CAPTURE_THEMES` (Vestiaire, Sombre, Clair, Saison 3) ; les 16 captures de référence des 4 autres thèmes sont retirées. Les comptes de test par thème restent pour les 8 thèmes historiques (d'autres tests s'en servent).
