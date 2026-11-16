---
id: 127
title: Ouverture du hub aux applications tierces
epic: E09
app: hub
depends_on: [118, 123, 126]
adr: 0007
verify: tests - un client non validé est refusé, un client qui dépasse son quota est bloqué, un refus de consentement ne donne aucun jeton
---

# 127 — Ouverture du hub aux applications tierces

## Pourquoi

Des outils de la communauté (bots Discord, outils de ligue) doivent pouvoir utiliser le passeport, avec l'accord du coach.

## Action

- Créer l'écran de consentement en français. Les droits demandés y sont décrits en phrases simples, par exemple « lire ton profil » ou « modifier ton profil ». Le bouton « Refuser » est aussi visible que « Autoriser ».
- Décrire la procédure de validation à la main dans `docs/features/hub/README.md`.
- Fixer un quota de requêtes par client.
- Ajouter un réglage d'ouverture, désactivé par défaut tant qu'aucune application tierce n'a été validée.

## Résultat

- **Enregistrement** : `register-client.mjs --tiers` crée une application tierce avec écran de consentement, sans jamais le droit à l'email, et **désactivée**. `validate-client.mjs` l'active après examen (`--disable` la coupe). La procédure de validation est dans `docs/features/hub/README.md`.
- **Réglage d'ouverture** `HUB_THIRD_PARTY_APPS` : vide par défaut, toutes les applications tierces sont alors refusées dès la demande de connexion.
- **Écran de consentement** (`app/consent/`) : « Autoriser <application> ? », droits en phrases simples (`lib/scopes.ts`, partagé avec la liste des applications liées), « Refuser » de même taille qu'« Autoriser », rappel que l'accès se retire depuis le passeport.
- **Quota** : `HUB_THIRD_PARTY_QUOTA` demandes par heure et par application tierce sur `/api/v1/profile` (1000 par défaut), réponse 429 `QUOTA_EXCEEDED` au-delà.
- **Tests** (`pnpm --filter @bbfrance/hub test:api`, 33 tests verts), à 375 px de large :
  - une application non validée est refusée ;
  - l'écran de consentement est en français, sans nom technique, avec des boutons de même taille ;
  - un refus revient avec `error=access_denied` et sans code ;
  - après acceptation, la quatrième demande au-delà du quota de test (3) est bloquée.
- **Dépendance** : la carte 126 (dossier RGPD) n'est pas faite. Le réglage d'ouverture reste vide tant que les mentions légales ne citent pas les applications tierces.
