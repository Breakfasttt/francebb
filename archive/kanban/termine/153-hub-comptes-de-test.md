---
id: 153
title: Comptes de test pour le hub en local
epic: E09
app: hub
depends_on: [128]
adr: 0007
verify: corepack pnpm --filter @bbfrance/hub test:api passe, dont un test qui crée un compte de test et s'y connecte ; la section « Comptes de test » s'affiche correctement en taille téléphone (375 pixels)
---

# 153 — Comptes de test pour le hub en local

## Pourquoi

En local, le site passe par le hub pour connecter les membres (`AUTH_MODE="hub"` dans `apps/site/.env`). Pour se connecter au hub, il faut aujourd'hui copier le lien de connexion affiché dans la console du hub, car aucun email n'est envoyé sans réglage SMTP (le service d'envoi d'emails). La connexion de test du site (`dev-login`) contourne le hub : le membre est connecté au site sans session au hub, donc le passeport et la déconnexion ne se comportent pas comme en production.

## Action

- Sur la page de connexion du hub, ajouter une section « Comptes de test », visible seulement en développement : un bouton par compte de test, qui connecte d'un clic, et un bouton « Créer un compte de test » (pseudo et email générés, par exemple `coach-test-3@test.com`).
- Réutiliser la connexion par mot de passe déjà réservée au développement (`HUB_DEV_PASSWORD_LOGIN=1`) : les comptes de test ont tous le même mot de passe, connu, et leur email est marqué comme vérifié pour que le site les accepte.
- Le serveur refuse de lister ou de créer des comptes de test en production ou sans `HUB_DEV_PASSWORD_LOGIN=1`, quelle que soit la page qui le demande.
- Pour un compte administrateur du site, utiliser la variable `SUPERADMIN_EMAILS` du site, qui existe déjà.

## Vérification

- Test automatique : création d'un compte de test, puis connexion avec lui.
- Section affichée en taille téléphone (375 pixels) : boutons d'au moins 44 pixels, pas de défilement horizontal.

## Résultat (01/11/2026)

- `lib/devAccounts.ts` liste et crée les comptes de test. La création passe par l'inscription de Better Auth (pseudo unique, journal), puis marque l'email comme vérifié. Les deux fonctions ne font rien en production ni sans `HUB_DEV_PASSWORD_LOGIN=1`.
- `app/sign-in/DevAccounts.tsx` affiche la section dans le formulaire de connexion, partout où il apparaît (page d'accueil du hub sans session, `/sign-in`, échec d'une connexion automatique). Le navigateur ne la demande jamais en production, et le serveur répond « désactivé » dans les autres cas.
- Test ajouté dans `tests/api/passport.spec.ts` : création d'un compte de test, contrôle en taille téléphone (pas de défilement horizontal, boutons d'au moins 44 pixels), connexion d'un clic jusqu'au passeport. `test:api` : 37 tests passent.
- Site : en développement et en mode hub, la page de connexion affiche « Comptes de test du hub ». Ce bouton passe par le hub sans lui indiquer de moyen de connexion : le hub affiche alors son formulaire complet, avec la section. Sans ce bouton, chaque bouton du site lance directement Discord, Google ou l'email, et la section n'apparaît jamais. Ce parcours site ↔ hub n'est pas encore passé par un test automatique : à vérifier au prochain `test:sso`, qui ne peut pas tourner pendant que l'autre session teste le site.
- Pour un compte administrateur du site : mettre l'email du compte de test dans `SUPERADMIN_EMAILS` (`apps/site/.env`).
