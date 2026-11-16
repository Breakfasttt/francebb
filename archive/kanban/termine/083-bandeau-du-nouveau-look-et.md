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

## Résultat

- `apps/site/common/components/AppShell/NewLookBanner.tsx` : bandeau affiché en haut de chaque page à un membre qui avait un autre thème avant la bascule.
  - Il annonce le nouveau look et propose « Revenir à « ancien thème » » ou « Garder le nouveau look ».
  - Le retour applique le thème tout de suite et l'enregistre dans le profil (`updateTheme`).
  - Le choix est mémorisé dans le navigateur : le bandeau ne revient pas.
- Nouvelle action serveur `getPreviousTheme` (`app/profile/actions.ts`) : elle lit `previousTheme` pour le seul membre connecté, appelée une seule fois. Aucune requête n'est ajoutée au rendu des pages.
- Le choix rapide du thème existe déjà depuis la carte 081 : panneau « Plus » sur téléphone, menu du compte ou bouton Thème sur ordinateur. Profil > Éditer et l'onboarding le gardent aussi.
- **Tests** : `tests/e2e/inventaire/nouveau-look.spec.ts`, verts en taille ordinateur et en taille téléphone. Ils couvrent le retour à l'ancien thème, l'enregistrement en base, le bandeau qui ne revient pas, et l'absence de bandeau pour un membre sans ancien thème.
