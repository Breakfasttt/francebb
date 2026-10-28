# Glossaire

Les mots techniques et acronymes utilisés dans le projet, expliqués simplement. Un mot manque ? Ajoute-le ici, dans l'ordre alphabétique.

| Terme | Explication |
|---|---|
| **Action serveur** (*server action*) | Fonction exécutée sur le serveur, appelée depuis une page (ex. « publier un message »). C'est une porte d'entrée publique : elle doit toujours vérifier qui l'appelle et ses droits. |
| **ADR** (*Architecture Decision Record*) | Fiche qui garde la trace d'une décision importante : le problème, le choix, pourquoi, ce qu'on écarte. Rangées dans `docs/adr/`. |
| **API** | Adresse que le site expose pour échanger des données avec un programme (ex. `/api/articles`). |
| **App Router** | Façon dont Next.js organise les pages : chaque dossier de `app/` correspond à une adresse du site (`app/forum/` → `/forum`). |
| **Auth.js** | Bibliothèque qui gère la connexion des membres sur le site aujourd'hui. |
| **Backup** | Copie de sauvegarde d'une base de données. |
| **BBCode** | Petit langage de mise en forme des messages du forum (`[b]gras[/b]`, `[url]…[/url]`). |
| **Better Auth** | Bibliothèque de connexion utilisée par le hub. |
| **Bibliothèque** (ou dépendance, paquet) | Code écrit par d'autres et utilisé par le projet (ex. Prisma, Next.js). Installée par pnpm. |
| **Branche** (git) | Version parallèle du code, sur laquelle on travaille sans toucher la version principale avant de fusionner. |
| **Build** | Préparation du site pour la mise en ligne. S'il échoue, le site ne peut pas être déployé. |
| **Cache** | Résultat gardé en mémoire pour ne pas le recalculer à chaque visite. |
| **Carte** (kanban) | Fichier qui décrit une tâche : pourquoi, quoi faire, comment vérifier que c'est fini. Voir `kanban/README.md`. |
| **CI** (*Continuous Integration*, intégration continue) | Vérifications lancées automatiquement par GitHub à chaque envoi de code : types, qualité, tests. Définies dans `.github/workflows/ci.yml`. |
| **Claim** | Une information sur l'utilisateur contenue dans un jeton de connexion (pseudo, email, « email vérifié »). |
| **Coach** | Joueur de Blood Bowl, donc membre du site. |
| **Commit** | Enregistrement d'un lot de modifications dans l'historique git, avec un message qui explique pourquoi. |
| **Conseil** (`/council`) | Réunion de 5 agents IA aux rôles différents, qui donnent leur avis avant une décision importante. Voir `.claude/commands/council.md`. |
| **CSS** | Langage qui décrit l'apparence des pages (couleurs, tailles, positions). |
| **Déployer** | Mettre une nouvelle version du site en ligne. |
| **E2E** (*end-to-end*, de bout en bout) | Test qui joue un vrai parcours dans un vrai navigateur, comme un visiteur (ex. ouvrir le forum puis répondre). |
| **Épic** | Grand chantier qui regroupe plusieurs cartes du kanban (`kanban/epics/`). |
| **ESLint** / **lint** | Outil qui repère les erreurs et mauvaises pratiques dans le code. Le **cliquet** (*ratchet*) interdit que le nombre d'erreurs augmente : la dette peut baisser, jamais monter. |
| **Flag** (drapeau) | Réglage qui active ou désactive une fonctionnalité sans changer le code (ex. `AUTH_MODE=hub`). |
| **Hook** | Script lancé automatiquement à un moment précis : avant un commit (`.githooks/`), ou quand l'IA modifie un fichier (`.claude/hooks/`). |
| **Hotfix** | Petite correction urgente appliquée directement sur la version en ligne. |
| **Hub** (de connexion) | Application séparée (`apps/hub`) qui gère les comptes : on se connecte une fois, et on est reconnu sur toutes les applications BBFrance. |
| **id_token** | Jeton signé que le hub remet au site après une connexion : « voici qui est connecté ». |
| **ITP** (Safari) | Protection de Safari qui bloque les cookies entre sites différents. C'est pourquoi le hub et le site devront partager le même nom de domaine. |
| **Kanban** | Tableau des tâches rangées par état (à faire, en cours, terminé). Ici, ce sont les dossiers de `kanban/`. |
| **Lighthouse** | Outil de Google qui note une page sur 100 : vitesse d'affichage, accessibilité, bonnes pratiques. Utilisé en mode mobile. |
| **Merge** (fusion) | Réunir le travail d'une branche dans une autre. |
| **Migration** (base de données) | Fichier qui décrit un changement de structure de la base (nouvelle table, nouvelle colonne), appliqué de façon contrôlée et enregistrée. |
| **Monorepo** | Un seul dépôt git qui contient plusieurs applications (site, hub) et du code partagé (`packages/`). |
| **N+1** | Défaut classique : une requête à la base par élément d'une liste, au lieu d'une seule requête pour toute la liste. Ralentit les pages. |
| **Neon** | Hébergeur de bases Postgres, gratuit pour un petit site. Choisi pour la production (ADR-0004). |
| **Next.js** | Le cadre (*framework*) avec lequel le site est construit, basé sur React. |
| **OAuth** | Standard qui permet de se connecter avec un compte existant (Discord, Google) sans donner son mot de passe au site. |
| **OIDC** (*OpenID Connect*) | Extension d'OAuth pour la connexion unique : une application demande au hub « qui est connecté ? ». |
| **Onboarding** | Les étapes qu'un nouveau membre remplit à sa première connexion (pseudo, région…). |
| **ORM** | Outil qui permet au code de parler à la base de données sans écrire de SQL. Ici : Prisma. |
| **PKCE** | Protection du parcours de connexion contre le vol du code d'autorisation. |
| **pnpm** | Outil qui installe les bibliothèques. Strict : une application ne peut utiliser que ce qu'elle déclare dans son `package.json`. |
| **Postgres** (PostgreSQL) | Base de données très répandue, choisie pour remplacer SQLite/Turso (ADR-0004). |
| **Prisma** | ORM du projet. `schema.prisma` décrit les tables ; `prisma migrate` crée les migrations. |
| **prisma dev** | Commande de Prisma qui lance un petit serveur Postgres sur l'ordinateur, sans rien installer (et sans Docker). Utilisée pour les bases locales du projet via `scripts/local-postgres.mjs`. |
| **Production** (prod) | La version en ligne du site, utilisée par les vrais membres. |
| **Push** | Envoi des commits locaux vers GitHub. |
| **RBAC** (*Role-Based Access Control*) | Droits accordés selon le rôle du membre (coach, modérateur, admin…). Voir `apps/site/lib/roles.ts`. |
| **React** | Bibliothèque qui construit l'interface des pages à partir de composants. |
| **Rebase** | Replacer les commits d'une branche au-dessus de la dernière version d'une autre branche. |
| **RGPD** | Loi européenne sur la protection des données personnelles (emails, comptes…). Elle impose notamment de prévenir les membres avant d'effacer leurs données. |
| **Rollback** (retour arrière) | Revenir à la version précédente quand une mise à jour pose problème. |
| **Schéma** (base de données) | La liste des tables, de leurs colonnes et de leurs liens. |
| **Seed** / **firstSetup** | Script qui remplit une base neuve avec les données de base (rôles, catégories du forum, listes de référence). |
| **shadcn/ui** | Collection de composants d'interface copiés dans le projet (`packages/ui`) et adaptés à nos 7 thèmes. |
| **Skill** | Fiche de consignes que l'IA lit avant une tâche précise (ex. règles d'interface). Rangées dans `.claude/skills/`. |
| **Smoke test** | Test rapide qui vérifie que les parcours essentiels marchent encore. |
| **sonner** | Bibliothèque des petites notifications en bas à droite (« Message envoyé »). |
| **Spike** | Essai court et limité dans le temps pour prouver qu'une solution fonctionne avant de s'y engager. |
| **SQL** | Langage pour interroger une base de données. |
| **SQLite** | Base de données qui tient dans un seul fichier. Pratique en local, mais limitée pour un site en ligne. |
| **SSO** (*Single Sign-On*) | Connexion unique : un seul compte et une seule connexion pour plusieurs applications. |
| **Tailwind** | Système de mise en forme par petites classes (`p-4` = marge intérieure de 16 pixels). Utilisé dans `packages/ui`. |
| **Thème** | Jeu de couleurs du site. Il y en a 7, au choix du coach (`apps/site/app/theme/`). |
| **Token** (jeton) | Mot de passe technique qui donne accès à un service (GitHub, base de données). S'il fuite, il faut le révoquer. |
| **Tokens de thème** | Noms de couleurs (`primary`, `card`…) qui pointent vers les couleurs du thème actif. |
| **Turbo** (Turborepo) | Outil qui lance les commandes (build, tests) sur toutes les applications du monorepo. |
| **Turso** | Hébergeur de bases SQLite utilisé jusqu'ici, abandonné pour Postgres (ADR-0004). |
| **TypeScript** / **typecheck** | TypeScript ajoute des types au code JavaScript ; le *typecheck* vérifie qu'il n'y a pas d'incohérence avant d'exécuter. |
| **UX** (*User eXperience*) | Le confort d'utilisation : clarté, fluidité, facilité à faire ce qu'on veut. |
| **Vercel** | Hébergeur du site : il le met en ligne automatiquement quand le code est envoyé sur GitHub. |
| **Worktree** | Deuxième copie de travail du même dépôt git, dans un autre dossier. |
