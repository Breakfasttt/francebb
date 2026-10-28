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

## Résultat

Les 6 failles prévues sont corrigées, plus 3 trouvées en chemin.

| Faille | Correction | Test |
|---|---|---|
| Journal de modération falsifiable (`logModerationAction` exportée d'un fichier « use server », donc action publique) | Déplacée dans `lib/moderationLog.ts`, interne au serveur | Oui |
| Un modérateur pouvait bannir un admin depuis `/spy` | Une seule `toggleBanUser` (`app/membres/actions.ts`) : contrôle de rang et trace au journal | Oui (bannissement par la fiche et entrée au journal) |
| Redirection vers un site extérieur après connexion | `safeCallbackUrl` (`lib/safeRedirect.ts`) : adresses internes seulement | Oui |
| `/api/articles` dévoilait la fiche de l'auteur (raison de bannissement…) et les articles masqués, sans limite de taille de page | Auteur réduit à ce qu'affiche la carte, articles masqués réservés à l'auteur et aux modérateurs, page bornée à 24 | Oui |
| Messagerie : blocage ignoré à l'envoi | Vérifié à la création d'une conversation, à l'invitation et à l'envoi en conversation à deux | Non (action appelable seulement par l'interface, qui filtre déjà les bloqués) |
| BBScheme : partage de taille illimitée | 500 Ko maximum, contenu vérifié ; le partage reste ouvert aux visiteurs (outil public) | Non |
| **En plus** : n'importe quel membre pouvait s'ajouter à un groupe de messagerie et lire ses messages (`inviteToGroup` ne vérifiait pas l'appartenance) | Invitation réservée aux membres du groupe | Non |
| **En plus** : ressources en attente ou refusées visibles par tous (`getResource`, `getUserResources`) | Réservées à l'auteur et aux modérateurs, page bornée à 20 | Non |
| **En plus** : géocodage (Nominatim) utilisable comme relais par n'importe quel visiteur | Réservé aux membres connectés | Non |

Règle ajoutée dans `ARCHITECTURE.md` : une fonction exportée d'un fichier « use server » est publique, les fonctions internes vont dans `lib/`. Revue complète des 25 actions publiques sans contrôle d'appelant : les autres sont des lectures publiques normales. Reste connu : `unbanUserAction` ne vérifie pas le rang (impact faible), à traiter avec la carte 051.

Tests : 50 tests verts (ordinateur et téléphone), dont 4 nouveaux dans `tests/e2e/security.spec.ts`.
