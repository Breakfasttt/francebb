---
id: 126
title: Dossier RGPD
epic: E09
app: site
depends_on: [124, 125]
adr: 0007
verify: relecture par le user ; les mentions légales en ligne citent les durées de conservation décidées
---

# 126 — Dossier RGPD

## Pourquoi

Le RGPD demande de tenir un registre de ce qu'on fait des données, et d'informer clairement les membres.

## Action

- Rédiger dans `docs/rgpd/` le registre des traitements : quelles données sont gardées, pourquoi et combien de temps.
- Y indiquer les durées de conservation : journal d'audit 1 an, délai de grâce de 30 jours, résultats de tournoi anonymisés.
- Lister les sous-traitants : Neon, Vercel, Discord, Google, service d'envoi de mails.
- Mettre à jour les mentions légales et la politique de confidentialité du site.
- Préparer une annonce pour le forum et Discord.

## Avancement (31/10)

- Brouillon du registre des traitements écrit : `docs/rgpd/registre.md` (droits du coach, quatre traitements, durées, sous-traitants).
- **À faire après la relecture du user** :
  - compléter l'adresse de contact et la durée du journal des emails ;
  - mettre à jour les mentions légales et la politique de confidentialité du site ;
  - préparer l'annonce sur le forum et Discord.
