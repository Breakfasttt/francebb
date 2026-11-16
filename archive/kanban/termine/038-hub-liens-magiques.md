---
id: 038
title: Envoi des liens magiques du hub
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: un lien magique reçu par mail connecte au hub
---

# 038 — Envoi des liens magiques du hub

## Action

`sendMagicLink` (apps/hub/lib/auth.ts) : envoi SMTP (même config que le site). Dépendance nodemailer à déclarer dans apps/hub (déjà utilisée par le site).

## Résultat

`apps/hub/lib/mail.ts` envoie le lien magique par SMTP, avec les mêmes réglages `SMTP_*` que le site (bibliothèque `nodemailer`, déjà utilisée par le site, même version). Sans `SMTP_HOST`, le lien s'affiche dans la console, et seulement en développement. Un échec d'envoi est signalé au membre au lieu d'un faux « lien envoyé ». `.env.example`, `DEPLOY.md` (étape 7) et la fiche du hub sont à jour. Test ajouté au test SSO (3 sur 3).
