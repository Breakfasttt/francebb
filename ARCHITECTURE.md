# Architecture et règles de code

Ce document dit **comment le code est organisé et quelles règles respecter** quand on le modifie. Les règles générales du projet sont dans le [README](README.md), les mots techniques dans le [glossaire](docs/GLOSSAIRE.md), les décisions et leurs raisons dans [docs/adr/](docs/adr/).

## Les applications

| Application | Rôle | État |
|---|---|---|
| `apps/site` | Le site BBFrance (Next.js) | En ligne |
| `apps/hub` | Le hub de connexion unique (Better Auth, OIDC), [ADR-0003](docs/adr/0003-hub-better-auth-oidc.md) | Prêt, pas encore en ligne |
| `packages/ui` | Composants d'interface partagés (shadcn/ui) | Utilisé par le site |

Plus tard : `apps/bbscheme` (éditeur BBScheme en application séparée).

**Frontière** : une application n'importe jamais le code d'une autre. Ce qui est partagé passe par `packages/`.

## Où mettre le code dans `apps/site`

| Dossier | Contenu | Règle |
|---|---|---|
| `app/<page>/` | La page (`page.tsx`), son style (`page.css`, `page-mobile.css`), ses composants propres (`component/`) et ses actions serveur (`actions.ts`) | Les requêtes à la base de données vont dans `actions.ts` ou dans `page.tsx`, jamais dans un composant d'affichage |
| `common/components/` | Composants utilisés par au moins 2 pages | Inventaire : skill `.claude/skills/reuse-first` |
| `common/hooks/`, `common/utils/` | Petites fonctions réutilisables côté navigateur | |
| `lib/` | Fonctions côté serveur : base de données, connexion, rôles, BBCode, mail | Jamais importé par un composant navigateur |
| `prisma/` | Structure de la base (`schema.prisma`), migrations, données de base (`firstSetup.ts`) | `firstSetup.ts` : ne pas modifier sans accord ; toujours `upsert` (crée ou met à jour, ne duplique jamais) |
| `tests/e2e/` | Tests de parcours dans un navigateur, sur une base jetable | |

Chaque fonctionnalité a sa fiche dans [docs/features/](docs/features/) : elle dit quels fichiers la composent.

## Règles de code

- **Sécurité** :
  - toute action serveur commence par `getActiveSession()` (`lib/authGuard.ts`), qui refuse les visiteurs non connectés et les bannis ;
  - les droits (modérateur, admin) se vérifient côté serveur avec `lib/roles.ts` ;
  - **toute fonction exportée d'un fichier `"use server"` est appelable depuis le navigateur par n'importe qui** : n'y exporter que de vraies actions, qui vérifient elles-mêmes l'appelant. Une fonction interne (journal, calcul) va dans `lib/` ;
  - une adresse de retour fournie par l'utilisateur passe par `safeCallbackUrl` (`lib/safeRedirect.ts`).
- **Données personnelles** : le client `prisma` par défaut ne renvoie jamais l'email des membres. `prismaWithEmail` est réservé à la connexion et à l'envoi de mails.
- **Erreurs** : pas de `throw` dans le nouveau code, on renvoie `null` et l'appelant gère le cas.
- **Actions serveur plutôt que routes d'API** : une page qui doit modifier des données appelle une action serveur (`actions.ts`), pas une adresse `/api/…`. Les routes d'API sont réservées aux appels venant de l'extérieur du site.
- **Base de données** : requêtes Prisma typées, avec `select` ou `include` pour ne charger que l'utile. Une seule requête pour toute une liste (pas de « N+1 », voir glossaire). Pagination par numéro de page (`skip` / `take`). Toute requête sur le forum passe par `lib/forumAccess.ts`, qui cache aux membres les catégories réservées à certains rôles.
- **Next.js 16** : le fichier `proxy.ts` remplace l'ancien `middleware.ts` (code exécuté avant chaque page).
- **Types** : TypeScript strict, jamais de `any`.
- **Langue** : commentaires d'en-tête de fichier en français, noms de variables et de fonctions en anglais.
- **Interface** :
  - utiliser les composants existants (boutons, sélecteurs, fenêtres, notifications de `@bbfrance/ui`) ;
  - couleurs uniquement via les variables CSS des thèmes (jamais de code couleur en dur) ;
  - icônes Lucide uniquement ;
  - chaque écran testé en taille téléphone ;
  - un seul seuil entre l'affichage téléphone et l'affichage ordinateur : 1024 pixels de large. En CSS, `@media (max-width: 1024px)` (et `min-width: 1025px` pour l'ordinateur seul) ; en JavaScript, `useIsMobile()` sans argument ou la constante `MOBILE_BREAKPOINT` (`common/hooks/useIsMobile.ts`). Une autre largeur ne sert qu'à ajuster une grille, jamais à masquer ou déplacer une colonne, un onglet ou des filtres (détails dans le skill `mobile-ux`).

## Réutiliser avant de créer

1. Chercher dans le skill `reuse-first`, puis dans le code.
2. Étendre ce qui existe plutôt que dupliquer : un deuxième système de notifications ou une cinquième recherche de membres seront refusés.
3. Un nouveau composant partagé est ajouté à `reuse-first` dans le même commit.

## Bibliothèques (dépendances)

- Aucune nouvelle bibliothèque sans accord du responsable du projet. L'IA doit demander confirmation (hook `block-deps`).
- Si une bibliothèque déjà présente fait le travail, on l'utilise :

  | Besoin | Bibliothèque |
  |---|---|
  | Dates | `date-fns` |
  | Glisser-déposer | `@dnd-kit` |
  | Carte | `leaflet` |
  | Icônes | `lucide-react` |
  | Notifications | `sonner`, via `@bbfrance/ui` |

- Bibliothèque majeure (cadre, connexion, interface, base de données) : passage par le conseil (`/council`) et un ADR.
- Versions exactes, figées dans `pnpm-lock.yaml`.

## Données

- Base **Postgres** : Neon en production, `prisma dev` en local (`scripts/local-postgres.mjs`, sans Docker). Le site et le hub ont chacun leur base ([ADR-0004](docs/adr/0004-reorganisation-et-postgres.md)).
- Changement de structure de la base : uniquement par une migration Prisma (`pnpm db:migrate`), jamais à la main. Les migrations sont appliquées automatiquement à chaque déploiement (`vercel-build`).
- Aucune donnée de membre ne doit être supprimée sans accord exprès.
