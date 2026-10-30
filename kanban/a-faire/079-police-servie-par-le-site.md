---
id: 079
title: "Police servie par le site"
epic: E08
app: site
depends_on: [075]
adr: 0006
verify: `next build` réussit sans réseau ; la police est chargée (onglet Réseau du navigateur) ; aucune requête vers Google
---

# 079 — Police servie par le site

## Pourquoi

Aucune police n'est chargée aujourd'hui : `globals.css:58` demande « Inter » sans la fournir. Le texte s'affiche donc dans une police différente selon l'appareil.

## Action

- Choisir une police lisible à l'écran, sous licence libre, et ranger son fichier (format woff2, variable si possible) dans le dépôt.
- La charger avec `next/font/local` dans `app/layout.tsx`, exposée par une variable CSS utilisée par les variables v2.
- Vérifier que le build fonctionne sans réseau et que le texte ne saute pas au chargement (mesure CLS de Lighthouse).
