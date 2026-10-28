---
id: 037
title: Ban global et déconnexion propagés
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: un membre banni au hub ne peut plus se connecter au site ; logout site déconnecte du hub
---

# 037 — Ban global et déconnexion propagés

## Action

Ban décidé au hub : refus de connexion + révocation des refresh tokens. Déconnexion globale (`end_session`). Le site garde son ban local (rôle forum).
