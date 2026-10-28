---
id: 035
title: Déployer le hub sur un domaine parent commun
status: refine
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: connexion via le hub en preview Vercel, Safari iOS compris
---

# 035 — Déployer le hub sur un domaine parent commun

## Action

Le user achète/choisit un domaine ; hub sur `auth.<domaine>`, site sur `www.<domaine>` (Vercel, Root Directory `apps/hub`), 2e base Turso, variables `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `HUB_DATABASE_URL`, `HUB_DATABASE_AUTH_TOKEN`, Discord/Google (nouvelles URL de callback). Enregistrer le client du site (`scripts/register-client.mjs`). Tester la reconnexion silencieuse sur Safari iOS réel.
