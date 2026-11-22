---
id: 226
title: Médias en deux onglets, directs en tourniquet
app: site
---

# 226 — Médias en deux onglets, directs en tourniquet

## Pourquoi

La page `/media` empile les directs Twitch et les chaînes YouTube : 7 cadres d'accord Twitch identiques, et des lecteurs « hors ligne » qui n'apportent rien. Le user veut (22/11/2026) une page proche de Twitch : on voit d'abord qui est en direct.

## À faire

- `/media` en deux onglets, « YouTube » et « Twitch », gardés dans l'adresse (`?onglet=`).
- Onglet YouTube : tourniquet des chaînes en direct (lecture page publique `/live`, sans clé, cache 5 minutes ; lancé seul, sans le son), puis les dernières vidéos comme aujourd'hui.
- Onglet Twitch : rien de Twitch avant l'accord du visiteur (un seul cadre clair, case « Retenir mon choix » 6 mois). Après l'accord : tourniquet des chaînes en direct, puis les chaînes hors ligne.
  - Sans clés Twitch : détection des directs par le lecteur Twitch dans le navigateur ; chaînes hors ligne = nom et lien.
  - Avec `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` (application créée par le user sur dev.twitch.tv) : l'API de Twitch, côté serveur (cache 2 minutes), donne les directs et la dernière vidéo ou le dernier clip des chaînes hors ligne.
- Tourniquet commun (pas de bibliothèque) : glissement sur téléphone, flèches sur ordinateur, seul l'élément du centre charge un lecteur.
- Tests unitaires (lecture des réponses YouTube et Twitch), e2e de `/media`, fiche `ressources-media`, `TESTS-MANUELS.md`.

## Résultat
- Fait par le commit `1d76592` (22/11/2026) : `/media` en deux onglets gardés dans l'adresse ; tourniquet commun sans bibliothèque (`MediaCarousel.tsx`), seul l'élément du centre charge un lecteur ; YouTube lu sur la page publique `/live` (cache 5 minutes) ; Twitch caché jusqu'à l'accord du visiteur, directs détectés par le lecteur sans clés, ou par l'API Helix avec `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` (cache 2 minutes, voyant dans Administration > Médias).
- Tests : `mediaChannels.test.mjs`, `twitchEmbed.test.mjs` ; e2e `/media` de `accueil.spec.ts`, relancé le 22/11 au rangement de la carte, vert sur téléphone et ordinateur.
- À essayer à la main (déjà dans `TESTS-MANUELS.md`, section 25) : directs réels YouTube et Twitch sur un vrai téléphone, puis avec les clés Twitch réglées sur Vercel.
