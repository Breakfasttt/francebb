---
id: 055
title: Mobile : un seul seuil téléphone/ordinateur
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: aucune page où une colonne disparaît sans être reprise dans le menu, à 360, 800 et 1000 px
---

# 055 — Mobile : un seul seuil téléphone/ordinateur

## Pourquoi

Certaines règles basculent à 1024 pixels (`.mobile-only`), d'autres à 768 (`useIsMobile`, `MobilePortal`). Sur tablette, des onglets (modération) disparaissent sans être accessibles ailleurs.

## Action

Choisir un seuil unique (768 px), le définir à un seul endroit (variable CSS et constante partagée par `useIsMobile`), et l'appliquer partout. Vérifier la modération, l'administration et le profil à 800 et 1000 px.
