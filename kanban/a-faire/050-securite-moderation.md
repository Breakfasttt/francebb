---
id: 050
title: Failles de modération et de connexion
epic: E01
app: site
depends_on: []
adr:
verify: chaque point corrigé ou expliqué dans la carte ; un test smoke par faille corrigée
---

# 050 — Failles de modération et de connexion

## Pourquoi

En rédigeant les fiches de fonctionnalités (carte 045), plusieurs failles ont été repérées dans le code.

## Action

À vérifier puis corriger, une par une :
- `logModerationAction` est exportée d'un fichier « use server » (`app/moderation/actions.ts`) : c'est donc une action serveur publique, et n'importe quel membre connecté peut écrire de fausses entrées dans le journal de modération. La rendre interne (fichier sans « use server » dans `lib/`).
- `toggleBanUser` existe en double. Celle de `app/profile/actions.ts` (utilisée sur `/spy/[id]`) ne vérifie pas la hiérarchie des rôles : un modérateur peut bannir un admin. Ne garder qu'une version, avec contrôle de rang et trace dans le journal.
- `/auth/login` redirige vers `callbackUrl` sans vérifier que l'adresse reste sur le site : redirection possible vers un site externe (« redirection ouverte »).
- `/api/articles` renvoie la fiche complète de l'auteur (`include: { author: true }`), dont sa raison de bannissement. L'email, lui, est masqué par le client Prisma. Ne sélectionner que le pseudo et l'avatar.
- La messagerie ne vérifie pas le blocage entre membres au moment de l'envoi (seule la recherche en tient compte).
- `saveBoardState` (BBScheme) accepte un texte de taille illimitée, même sans être connecté.
