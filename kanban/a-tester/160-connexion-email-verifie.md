---
id: 160
title: "Connexion Discord et Google : e-mail vérifié obligatoire"
epic: E10
app: site
depends_on: []
verify: "une connexion Discord dont l'e-mail n'est pas vérifié est refusée avec un message clair ; un membre supprimé perd ses droits à sa visite suivante ; pnpm check passe"
---

# 160 — Connexion Discord et Google : e-mail vérifié obligatoire

## Pourquoi

Tant que le hub n'est pas en ligne (carte 035), le site gère lui-même la connexion. Il rattache un compte Discord ou Google à un compte existant sur la seule base de l'adresse e-mail, même non vérifiée : on peut prendre le compte d'un autre membre (audit, section 2.2). C'est une correction de secours ; la vraie solution est de tout faire passer par le hub (carte 161).

Même fichier, autre défaut (audit, section 2.6) : si le membre n'existe plus en base, ou si la base ne répond pas, le jeton de session garde l'ancien rôle.

## Action

1. Dans le rappel `signIn` de `apps/site/auth.ts` : refuser Discord si `profile.verified !== true`, et Google si `profile.email_verified !== true`.
2. Dans le rappel `jwt` : si le membre n'existe plus, vider le jeton (session fermée) ; si la base ne répond pas, ne pas garder un rôle supérieur à « coach ».
3. Les actions sensibles de l'administration relisent le rôle de l'auteur en base.

## Résultat

- `auth.ts`, rappel `signIn` : une connexion Discord dont `profile.verified` n'est pas vrai, ou Google dont `profile.email_verified` n'est pas vrai, est refusée et renvoie vers `/auth/error?error=EmailNotVerified`, qui explique quoi faire.
- `auth.ts`, rappel `jwt` : membre introuvable en base, le rappel renvoie `null` et Auth.js efface le cookie de session (vérifié dans le code d'Auth.js, `@auth/core/lib/actions/session.js`) ; base injoignable, le rôle est ramené à « coach » pour cette lecture.
- Point 3 de la carte (actions sensibles qui relisent le rôle) : inutile après ce changement. Le proxy passe avant chaque page et chaque action serveur et relit déjà le rôle en base à chaque fois ; les deux trous (membre supprimé, base en erreur) sont bouchés ici.
- Non traité ici : un super administrateur qui supprime son propre compte garde son rôle dans la fiche conservée (`lib/accountDeletion.ts`, carte 124 de la session RGPD) ; signalé dans l'audit.
- Fiche `docs/features/auth/README.md` mise à jour.
