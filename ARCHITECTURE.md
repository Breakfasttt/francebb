# Architecture et règles de code

Ce document dit **comment le code est organisé et quelles règles respecter** quand on le modifie. Les règles générales du projet sont dans le [README](README.md), les mots techniques dans le [glossaire](docs/GLOSSAIRE.md), les décisions et leurs raisons dans [docs/adr/](docs/adr/).

## Les applications

| Application | Rôle | État |
|---|---|---|
| `apps/site` | Le site BBFrance (Next.js) | En ligne |
| `apps/hub` | Le hub de connexion unique (Better Auth, OIDC), [ADR-0003](docs/adr/0003-hub-better-auth-oidc.md) | Prêt, pas encore en ligne |
| `packages/ui` | Composants d'interface partagés (shadcn/ui) | Utilisé par le site |
| `packages/bbscheme-player` | Lecteur des plateaux BBScheme, avec le terrain, les pions et leurs types (carte 024) | Utilisé par le site (messages du forum et éditeur `/bbscheme`) |

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
  - le rôle, le bannissement, le thème et le pseudo d'un membre voyagent dans son cookie de session, relu en base au plus toutes les 5 minutes (callback `jwt` d'`auth.ts`, carte 017). Un changement fait par un modérateur sur un autre membre prend donc effet en 5 minutes au plus. Quand un membre modifie son propre profil, le composant appelle `update()` de `useSession()` après l'action serveur : la session est alors relue tout de suite. `update()` ne peut pas servir à se donner des droits, car la base écrase toujours ce que le navigateur envoie ;
  - **toute fonction exportée d'un fichier `"use server"` est appelable depuis le navigateur par n'importe qui** : n'y exporter que de vraies actions, qui vérifient elles-mêmes l'appelant. Une fonction interne (journal, calcul) va dans `lib/` ;
  - une adresse de retour fournie par l'utilisateur passe par `safeCallbackUrl` (`lib/safeRedirect.ts`).
- **Données personnelles** : le client `prisma` par défaut ne renvoie jamais l'email des membres. `prismaWithEmail` est réservé à la connexion et à l'envoi de mails.
- **Erreurs** : pas de `throw` dans le nouveau code. Une action qui lit des données renvoie `null` (ou une liste vide) et l'appelant gère le cas ; une action qui modifie des données renvoie `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) et le composant affiche `error` dans une notification. En production, Next.js remplace le message d'une erreur levée par un texte générique : le membre ne saurait pas pourquoi son action a échoué. Le lien vers la page de connexion porte l'adresse de retour dans `?callbackUrl=`.
- **Actions serveur plutôt que routes d'API** : une page qui doit modifier des données appelle une action serveur (`actions.ts`), pas une adresse `/api/…`. Les routes d'API sont réservées aux appels venant de l'extérieur du site.
- **Base de données** : requêtes Prisma typées, avec `select` ou `include` pour ne charger que l'utile. Une seule requête pour toute une liste (pas de « N+1 », voir glossaire). Pagination par numéro de page (`skip` / `take`). Toute requête sur le forum passe par `lib/forumAccess.ts`, qui cache aux membres les catégories réservées à certains rôles.
- **Next.js 16** : le fichier `proxy.ts` remplace l'ancien `middleware.ts` (code exécuté avant chaque page). Il utilise la configuration complète d'Auth.js (`auth.ts`) : c'est lui qui enregistre dans le cookie la session relue en base.
- **Types** : TypeScript strict, jamais de `any`.
- **Langue** : commentaires d'en-tête de fichier en français, noms de variables et de fonctions en anglais.
- **Interface** :
  - utiliser les composants existants (boutons, sélecteurs, fenêtres, notifications de `@bbfrance/ui`) ;
  - couleurs uniquement via les variables CSS des thèmes (jamais de code couleur en dur) ;
  - icônes Lucide uniquement ;
  - chaque écran testé en taille téléphone ;
  - un seul seuil entre l'affichage téléphone et l'affichage ordinateur : 1024 pixels de large. En CSS, `@media (max-width: 1024px)` (et `min-width: 1025px` pour l'ordinateur seul) ; en JavaScript, `useIsMobile()` sans argument ou la constante `MOBILE_BREAKPOINT` (`common/hooks/useIsMobile.ts`). Une autre largeur ne sert qu'à ajuster une grille, jamais à masquer ou déplacer une colonne, un onglet ou des filtres (détails dans le skill `mobile-ux`).

## Règles vérifiées automatiquement

ESLint (l'outil qui relit le code, voir le glossaire) refuse dans `apps/site` trois écarts aux règles ci-dessus. Ces contrôles sont réglés dans `apps/site/eslint.config.mjs` :

| Règle du projet | Ce qui est refusé | Règle ESLint |
|---|---|---|
| Frontière entre applications | Un import du code d'une autre application : par son nom de paquet (`@bbfrance/hub`), par un chemin qui passe par `apps/`, ou par un chemin relatif qui remonte jusqu'au dossier du hub | `no-restricted-imports` |
| Couleurs via les variables des thèmes | Un code couleur hexadécimal (`#fff`, `#2E7D32`) écrit dans un fichier `.tsx` | `no-restricted-syntax` |
| Composants existants | Un `<button>` ou un `<select>` natif dans un fichier `.tsx`. Seuls les composants de base (`common/components/Button/`, `ClassicSelect`) ont le droit de les utiliser | `react/forbid-elements` |

Le code écrit avant ces règles contient encore des écarts. Le cliquet (`apps/site/scripts/lint-ratchet.mjs`) les tolère, mais il garde un plafond **pour chaque règle** dans `apps/site/lint-baseline.json` : une nouvelle erreur est refusée même si une autre a été corrigée ailleurs. Quand on corrige des écarts, on abaisse les plafonds avec `node scripts/lint-ratchet.mjs --update`.

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
