---
id: 073
title: "Hub invisible : les boutons du site passent par lui"
epic: E06
app: hub
depends_on: [037]
adr: 0003
verify: en AUTH_MODE=hub, l'écran de connexion du site affiche les mêmes boutons qu'avant (Discord, Google, email) et aucun bouton « Compte BBFrance » ; la connexion par email passe par le hub sans qu'aucun écran du hub ne s'affiche (test pnpm test:sso) ; Discord et Google vont directement du site à Discord ou Google (essai du user)
---

# 073 — Hub invisible : les boutons du site passent par lui

## Pourquoi

En mode hub, l'écran de connexion du site ajoutait un bouton « Compte BBFrance » à côté de Discord, Google et email, et ce bouton menait à un second écran de connexion, celui du hub. C'est un doublon : le coach n'a pas à savoir que le hub existe. Le responsable du projet veut que le hub soit invisible.

## Action

- **Site** (`apps/site/app/auth/login/page.tsx`) : en mode hub, retirer le bouton « Compte BBFrance » ; les boutons Discord, Google et email lancent la connexion par le hub en lui indiquant le moyen choisi (et l'adresse email pour le lien par email).
- **Hub** : quand le moyen est indiqué, la page de connexion lance aussitôt Discord, Google ou l'envoi du lien, sans afficher ses propres boutons (au plus un court message « Redirection… »). Seules les valeurs `discord`, `google` et `email` sont acceptées.
- **Hub** : aucun écran d'autorisation (« autoriser BBFrance à… ») pour le site, application de confiance ; un membre déjà connecté au hub revient sur le site sans aucun écran.
- **Tests** : `test:sso` passe par le moyen email et vérifie qu'aucun écran du hub ne s'affiche.

## Résultat

- **Site** : en mode hub, l'écran `/auth/login` n'a plus de bouton « Compte BBFrance ». Les boutons Discord, Google et email appellent `signIn("hub", …, { login_method, login_hint })` : le moyen choisi (et l'adresse email) part au hub dans la demande d'autorisation. Les trois boutons sont toujours affichés en mode hub, puisque c'est le hub qui les fournit. Les fournisseurs directs Discord, Google et email du site (`auth.ts`) sont retirés en mode hub, pour qu'il n'existe qu'une porte d'entrée. Hors mode hub, rien ne change.
- **Hub** : le plugin OAuth Provider recopie et signe les paramètres qu'il ne connaît pas dans l'adresse de `/sign-in`. La page lit `login_method` (`lib/oauthResume.ts`) seulement si la demande est signée, sans erreur, avec une valeur de la liste `discord`, `google`, `email` (et une adresse valide pour l'email). Elle lance alors aussitôt Discord, Google ou l'envoi du lien (`AutoSignIn.tsx`) avec un simple « Redirection… » ; sinon, ou en cas d'échec, le formulaire habituel (`SignInForm.tsx`, ancien contenu de la page) s'affiche.
- **Lien magique** : il contient maintenant l'adresse de reprise de la demande d'autorisation (`/api/auth/oauth2/authorize?…`). Le coach qui l'ouvre arrive connecté au hub, qui le renvoie aussitôt sur le site. Avant, il restait sur l'accueil du hub, même depuis le formulaire du hub. Un lien expiré ramène au formulaire du hub avec un message clair.
- Pas d'écran de consentement : le site est enregistré avec `skipConsent` (`scripts/register-client.mjs`), et un coach déjà connecté au hub revient sur le site sans écran (vérifié par le test existant de reconnexion).
- En production sans SMTP, le hub n'écrit plus le lien magique dans les journaux. En test, `HUB_DEV_MAIL_FILE` lui fait écrire le dernier lien dans un fichier.
- **Tests** : `pnpm test:sso` passe (7 tests). Nouveaux tests : parcours email depuis le bouton du site jusqu'au retour connecté, en vérifiant qu'aucun bouton du hub n'apparaît, même un instant ; départ vers `discord.com` et `accounts.google.com` avec l'adresse de retour du hub (sans suivre la page du fournisseur). Les tests existants passent toujours par le formulaire du hub. Tests du site `smoke` et `security` en mode legacy : 50 sur 50 (un test de forum, sans lien avec la connexion, a échoué une fois par lenteur puis est passé seul).
- Les serveurs de développement du user (ports 3000 et 4000) empêchent Next.js 16 de lancer un second serveur dans le même dossier : les tests ont été lancés dans une copie de travail temporaire (`D:/bbf073`, retirée de git ; le dossier restant est à supprimer à la main).
- Docs : `docs/features/hub/README.md`, `docs/GLOSSAIRE.md` (lien magique, `login_hint`), `DEPLOY.md` et `apps/hub/.env.example` (Discord et Google obligatoires au hub, avec leurs adresses de retour).
