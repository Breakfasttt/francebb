---
id: 083
title: "Bandeau du nouveau look et choix rapide du thème"
epic: E08
app: site
depends_on: [078, 081]
adr: 0006
verify: le bandeau s'affiche une seule fois et propose de revenir à l'ancien thème en un clic ; le thème se change depuis le panneau Plus et depuis le menu de compte
---

# 083 — Bandeau du nouveau look et choix rapide du thème

## Pourquoi

Tous les membres passent au thème « Vestiaire ». Ils doivent pouvoir revenir à leur ancien thème sans chercher dans leur profil.

## Action

- Bandeau affiché une seule fois après la migration : il annonce le nouveau look et propose « Revenir à mon ancien thème », qui utilise la colonne `previousTheme`.
- Sélecteur de thème rapide dans le panneau « Plus » (téléphone) et dans le menu de compte (ordinateur), en réutilisant `updateTheme` (`app/profile/actions.ts`).
- Le choix du thème dans Profil > Éditer et dans l'onboarding reste disponible.
