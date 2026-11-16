---
id: 044
title: README d'entrée, glossaire, une règle à un seul endroit
epic: E02
app: site
depends_on: [042]
adr: 0004
verify: aucune règle écrite deux fois ; un néophyte trouve depuis le README où est chaque chose
---

# 044 — README d'entrée, glossaire, une règle à un seul endroit

## Pourquoi

La même règle est écrite dans 6 à 8 documents, et beaucoup de termes techniques ne sont jamais expliqués.

## Action

Le `README.md` racine devient la porte d'entrée : ce qu'est le projet, plan des dossiers en quelques lignes, règles du projet (dont les deux règles absolues : tout compréhensible, mobile impeccable), liens. Créer `docs/GLOSSAIRE.md` (ADR, OIDC, SSO, CI, spike, migration, ORM…). Supprimer les doublons dans `ARCHITECTURE.md`, `.claude/CLAUDE.md`, `kanban/README.md` et les skills : chaque règle n'existe qu'à un endroit, les autres documents renvoient vers lui. Les bilans de séance vont dans `docs/bilans/`.

## Résultat

- `README.md` réécrit comme porte d'entrée : présentation, les deux règles absolues (tout compréhensible, mobile impeccable), où chaque règle est écrite, plan du dépôt expliqué, démarrage en local, vérifications. Les anciennes sections d'hébergement autonome et Docker (obsolètes, base SQLite en fichier) sont retirées.
- `docs/GLOSSAIRE.md` créé (environ 75 termes).
- `ARCHITECTURE.md` réécrit : il porte seul les règles de code (sécurité, base de données, interface, bibliothèques). `.claude/CLAUDE.md` n'en garde plus de copie et renvoie vers lui.
- Bilans de séance rangés dans `docs/bilans/`. `apps/site/.env.example` réécrit en français, chaque réglage expliqué (variable inutilisée `RESEND_API_KEY` retirée).
- `DEPLOY.md` : avertissement en tête, en attendant sa réécriture pour Postgres (carte 046).
