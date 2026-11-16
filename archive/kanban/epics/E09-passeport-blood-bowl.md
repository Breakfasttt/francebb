---
id: E09
title: Passeport Blood Bowl (profil, RGPD, sécurité, API ouverte)
phase: P5
---

# E09 — Passeport Blood Bowl

Décision : `docs/adr/0007-passeport-blood-bowl.md`.

Le hub devient un service indépendant qui garde la fiche de chaque coach. Il la partage avec toutes les applications par une API documentée, et il respecte le RGPD.

## Terminé quand

- Un coach modifie son profil sur le passeport et le site le reçoit.
- Un coach banni perd l'accès au site à la requête suivante.
- Un coach télécharge toutes ses données (hub et site) en un fichier.
- Une suppression de compte efface toutes ses données personnelles du hub et du site après 30 jours.
- `GET /api/doc` décrit toutes les routes publiques.
- Les mesures de sécurité de l'ADR-0007 sont actives avant la mise en ligne du hub.

Cartes : `pnpm kanban` ou les dossiers de `kanban/` (champ `epic` de chaque carte).
