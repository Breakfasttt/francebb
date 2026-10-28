---
id: 038
title: Envoi des liens magiques du hub
status: refine
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: un lien magique reçu par mail connecte au hub
---

# 038 — Envoi des liens magiques du hub

## Action

`sendMagicLink` (apps/hub/lib/auth.ts) : envoi SMTP (même config que le site). Dépendance nodemailer à déclarer dans apps/hub (déjà utilisée par le site).
