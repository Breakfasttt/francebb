---
id: 035
title: Déployer le hub sur un domaine parent commun
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: connexion via le hub en preview Vercel, Safari iOS compris
---

# 035 — Déployer le hub sur un domaine parent commun

## Action

Le user achète/choisit un domaine ; hub sur `auth.<domaine>`, site sur `www.<domaine>` (Vercel, Root Directory `apps/hub`), 2e base Postgres sur Neon (ADR 0004 : Turso est abandonné), variables `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `HUB_DATABASE_URL`, Discord/Google (nouvelles URL de callback). Enregistrer le client du site (`scripts/register-client.mjs`). Tester la reconnexion silencieuse sur Safari iOS réel.

## Essai en local d'abord (2026-10-30)

Le user ne met rien en ligne tant que le hub et le site ne fonctionnent pas ensemble sur son ordinateur. Préparation faite :

- base locale du hub démarrée et à jour ;
- site enregistré comme application cliente du hub sous le nom « BBFrance site local », avec l'adresse de retour `http://localhost:3000/api/auth/callback/hub` ;
- dans `apps/site/.env` : `AUTH_MODE="hub"`, `HUB_ISSUER="http://localhost:4000/api/auth"`, `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET` (vider `AUTH_MODE` pour revenir à la connexion habituelle) ;
- tâche VS Code « Hub + site » (`.vscode/tasks.json`), qui lance les deux serveurs dans deux terminaux.

À essayer par le user : connexion par lien email (le lien s'affiche dans le terminal du hub tant qu'aucun service d'envoi de mails n'est configuré), retour sur le site, déconnexion globale, puis Discord et Google avec les adresses de retour `http://localhost:4000/api/auth/callback/discord` et `…/google`.
