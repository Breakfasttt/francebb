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

## Résultat

- Police Inter variable, sous-ensemble latin (48 Ko, accents français compris), rangée dans `apps/site/app/fonts/` avec sa licence OFL (`Inter-OFL.txt`). Elle est chargée par `next/font/local` dans `app/layout.tsx` et exposée par la variable `--font-bb`.
- Les 11 déclarations `'Inter'` du CSS historique (CSS global, thèmes, `PageHeader`, BBScheme) deviennent `var(--font-bb, 'Inter')`. Les variables v2 l'utilisent par `--bb-font-sans`.
- Le fichier vient du paquet npm `@fontsource-variable/inter` 5.2.5, déballé à part : **aucune bibliothèque ajoutée au projet**.
- **Vérifications** :
  - `next build` réussit, sans aucune requête de police vers l'extérieur.
  - Les captures des thèmes ont été régénérées, parce que tout le texte change de police (c'est le but de la carte).
  - L'absence de saut de mise en page au chargement (mesure CLS) sera mesurée par Lighthouse à la carte 101.
