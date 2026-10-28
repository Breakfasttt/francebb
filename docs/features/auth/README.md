# Feature — Authentification et rôles

## Rôle

Connexion des coachs (Discord, Google, lien magique par email), onboarding du profil, rôles (RBAC) et bannissement. Sera remplacée par le hub SSO en P5 (épic E06).

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `auth.ts` | Config Auth.js v5 runtime Node : providers, `signIn` (promotion `SUPERADMIN_EMAILS`), `jwt` (relecture du user en BDD à chaque appel), pages |
| `auth.config.ts` | Callbacks partagés `jwt` / `session` (aussi utilisés par `proxy.ts`) |
| `proxy.ts` | Remplace `middleware.ts` (Next 16), session sur toutes les routes |
| `lib/authGuard.ts` | `getActiveSession()` : session ou `null` si non connecté **ou banni** |
| `lib/roles.ts` | `ROLE_POWER`, `getRolePower`, `isModerator`, `isAdmin`, `canManageRoles`, `canEditTargetRole`, `getAllowedRolesToAssign` |
| `app/auth/` | Pages login, onboarding, error, verify-request |
| `app/banned/page.tsx` + `common/components/BannedRedirect` | Redirection client des bannis |

## API publique

- Server action : `const session = await getActiveSession(); if (!session) return null;` puis contrôle de rôle avec `lib/roles.ts`.
- Session : `session.user.id`, `role`, `isBanned`, `hasFinishedOnboarding`.

## Invariants

- Toute server action qui lit ou écrit pour un user passe par `getActiveSession()`, jamais `auth()` direct (sauf `app/debugActions.ts` et `app/auth/login/actions.ts`).
- Rôle admin/modo vérifié **côté serveur**.
- Provider `dev-login` (Credentials) : uniquement si `NODE_ENV === "development"` ; utilisé par les tests smoke.
- Session JWT ; `isBanned` et `role` rafraîchis depuis la BDD par le callback `jwt`.
- `User.email` n'est jamais renvoyé par le client `prisma` (omit global, `lib/prisma.ts`) : un `include: { author: true }` ne peut pas fuiter d'adresse vers le navigateur ou une API. Besoin de l'email : `select: { email: true }` explicite, ou `prismaWithEmail` (adapter Auth.js). Test smoke « aucun email d'auteur ».

## État

- Fait (P0) : ban appliqué côté serveur dans les 16 fichiers d'actions.
- Dette : `allowDangerousEmailAccountLinking: true` sur Discord et Google (`auth.ts`) — à retirer au plus tard en P5.
- Coût perf : la relecture BDD dans `jwt` ajoute une requête par `auth()` (carte 017).
- Pas de test smoke du refus d'une action par un banni (carte 002).
