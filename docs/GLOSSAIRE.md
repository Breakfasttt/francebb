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
| **Bouton flottant de filtres** (`MobileFilterWrapper`) | Sur téléphone, bouton rond en forme d'entonnoir, fixé en bas à droite de l'écran. Il ouvre un panneau qui monte du bas de l'écran avec les filtres de la page et un bouton « Appliquer les filtres ». Sur ordinateur, les filtres restent affichés dans la page. |
| **Branche** (git) | Version parallèle du code, sur laquelle on travaille sans toucher la version principale avant de fusionner. |
| **Build** | Préparation du site pour la mise en ligne. S'il échoue, le site ne peut pas être déployé. |
| **Cache** | Résultat gardé en mémoire pour ne pas le recalculer à chaque visite. |
| **Callback `jwt`** | Fonction d'Auth.js appelée chaque fois que la session d'un membre est lue. Sur BBFrance, elle relit en base le rôle, le bannissement, le thème et le pseudo, au plus toutes les 5 minutes, et les range dans le cookie de session. |
| **Carte** (kanban) | Fichier qui décrit une tâche : pourquoi, quoi faire, comment vérifier que c'est fini. Voir `kanban/README.md`. |
| **CI** (*Continuous Integration*, intégration continue) | Vérifications lancées automatiquement par GitHub à chaque envoi de code : types, qualité, tests. Définies dans `.github/workflows/ci.yml`. |
| **Claim** | Une information sur l'utilisateur contenue dans un jeton de connexion (pseudo, email, « email vérifié »). |
| **CLS** (*Cumulative Layout Shift*, décalage cumulé de la mise en page) | Mesure de Lighthouse : à quel point le contenu saute pendant le chargement (une image qui apparaît et pousse le texte vers le bas, par exemple). 0 = rien ne bouge ; bon en dessous de 0,1. |
| **Coach** | Joueur de Blood Bowl, donc membre du site. |
| **Commit** | Enregistrement d'un lot de modifications dans l'historique git, avec un message qui explique pourquoi. |
| **Conseil** (`/council`) | Réunion de 5 agents IA aux rôles différents, qui donnent leur avis avant une décision importante. Voir `.claude/commands/council.md`. |
| **CSS** | Langage qui décrit l'apparence des pages (couleurs, tailles, positions). |
| **Déconnexion globale** (*end_session*) | Quand le coach se déconnecte d'une application, celle-ci l'envoie aussi vers le hub, qui ferme sa propre session. Sans cela, la connexion suivante serait automatique. |
| **Déployer** | Mettre une nouvelle version du site en ligne. |
| **E2E** (*end-to-end*, de bout en bout) | Test qui joue un vrai parcours dans un vrai navigateur, comme un visiteur (ex. ouvrir le forum puis répondre). |
| **Épic** | Grand chantier qui regroupe plusieurs cartes du kanban (`kanban/epics/`). |
| **ESLint** / **lint** | Outil qui repère les erreurs et mauvaises pratiques dans le code. Le **cliquet** (*ratchet*) interdit que le nombre d'erreurs augmente : la dette peut baisser, jamais monter. Le plafond est compté pour le total et pour chaque règle (`apps/site/lint-baseline.json`). |
| **Flag** (drapeau) | Réglage qui active ou désactive une fonctionnalité sans changer le code (ex. `AUTH_MODE=hub`). |
| **Hook** | Script lancé automatiquement à un moment précis : avant un commit (`.githooks/`), ou quand l'IA modifie un fichier (`.claude/hooks/`). |
| **Hotfix** | Petite correction urgente appliquée directement sur la version en ligne. |
| **Hub** (de connexion) | Application séparée (`apps/hub`) qui gère les comptes : on se connecte une fois, et on est reconnu sur toutes les applications BBFrance. |
| **id_token** | Jeton signé que le hub remet au site après une connexion : « voici qui est connecté ». |
| **Import dynamique** (`import()`) | Chargement d'une bibliothèque seulement au moment où l'on s'en sert, au lieu de l'envoyer au navigateur avec la page. Exemple : les bibliothèques d'export GIF de BBScheme ne sont téléchargées que quand le coach clique sur le bouton d'export. La page s'ouvre plus vite. |
| **ITP** (Safari) | Protection de Safari qui bloque les cookies entre sites différents. C'est pourquoi le hub et le site devront partager le même nom de domaine. |
| **JWT** (*JSON Web Token*) | Jeton signé qui contient la session d'un membre (qui il est, son rôle) et voyage dans un cookie. Le site ne garde donc aucune liste des sessions en base : la table `Session` reste vide. |
| **Kanban** | Tableau des tâches rangées par état (à faire, en cours, terminé). Ici, ce sont les dossiers de `kanban/`. |
| **LCP** (*Largest Contentful Paint*, affichage du plus grand élément) | Mesure de Lighthouse : temps qu'il faut pour que le plus gros élément visible de la page (grande image, gros bloc de texte) soit affiché. C'est le moment où le visiteur a l'impression que la page est là. Bon en dessous de 2,5 secondes. |
| **Lighthouse** | Outil de Google qui note une page sur 100 : vitesse d'affichage, accessibilité, bonnes pratiques. Utilisé en mode mobile, qui simule un téléphone de milieu de gamme sur un réseau 4G lent. La note de vitesse se lance avec `pnpm --filter @bbfrance/site lighthouse` (voir `docs/mobile-audit.md`). |
| **localStorage** | Petite mémoire propre au navigateur et à l'appareil, où une page peut ranger des réglages (ex. le thème d'un visiteur). Elle peut être bloquée, par exemple en navigation privée. |
| **Merge** (fusion) | Réunir le travail d'une branche dans une autre. |
| **Migration** (base de données) | Fichier qui décrit un changement de structure de la base (nouvelle table, nouvelle colonne), appliqué de façon contrôlée et enregistrée. Une migration peut aussi corriger des données existantes (« migration de données ») : par exemple remplacer une ancienne valeur par la bonne dans toutes les lignes. |
| **Monorepo** | Un seul dépôt git qui contient plusieurs applications (site, hub) et du code partagé (`packages/`). |
| **N+1** | Défaut classique : une requête à la base par élément d'une liste, au lieu d'une seule requête pour toute la liste. Ralentit les pages. |
| **Neon** | Hébergeur de bases Postgres, gratuit pour un petit site. Choisi pour la production (ADR-0004). |
| **Next.js** | Le cadre (*framework*) avec lequel le site est construit, basé sur React. |
| **next/image** (composant `Image`) | Remplaçant de la balise `<img>` fourni par Next.js. Le serveur réduit l'image à la taille où elle est affichée et la convertit au format WebP, bien plus léger ; le navigateur choisit la bonne version selon l'écran. Il faut lui donner la taille affichée (`width` et `height`, ou `sizes` avec `fill`), sinon il envoie une image trop grande. Réservé aux images du dossier `public/` : les images venues d'autres sites restent en `<img>` (carte 019). |
| **OAuth** | Standard qui permet de se connecter avec un compte existant (Discord, Google) sans donner son mot de passe au site. |
| **OIDC** (*OpenID Connect*) | Extension d'OAuth pour la connexion unique : une application demande au hub « qui est connecté ? ». |
| **Onboarding** | Les étapes qu'un nouveau membre remplit à sa première connexion (pseudo, région…). |
| **ORM** | Outil qui permet au code de parler à la base de données sans écrire de SQL. Ici : Prisma. |
| **PKCE** | Protection du parcours de connexion contre le vol du code d'autorisation. |
| **pnpm** | Outil qui installe les bibliothèques. Strict : une application ne peut utiliser que ce qu'elle déclare dans son `package.json`. |
| **Postgres** (PostgreSQL) | Base de données très répandue, choisie pour remplacer SQLite/Turso (ADR-0004). |
| **Prisma** | ORM du projet. `schema.prisma` décrit les tables ; `prisma migrate` crée les migrations. |
| **prisma dev** | Commande de Prisma qui lance un petit serveur Postgres sur l'ordinateur, sans rien installer (et sans Docker). Utilisée pour les bases locales du projet via `scripts/local-postgres.mjs`. Ce petit serveur ne sert qu'une connexion à la fois : un test qui ouvre sa propre connexion pendant que le site tourne doit attendre que le site lâche la sienne, parfois longtemps (carte 067). Préparer plutôt les données une fois pour toutes dans `globalSetup.ts`. |
| **Production** (prod) | La version en ligne du site, utilisée par les vrais membres. |
| **Proxy** (`proxy.ts`) | Code exécuté par Next.js avant chaque page et chaque action serveur (anciennement appelé *middleware*). Sur BBFrance, il vérifie la session et réécrit le cookie de session quand il a été relu en base. |
| **Push** | Envoi des commits locaux vers GitHub. |
| **RBAC** (*Role-Based Access Control*) | Droits accordés selon le rôle du membre (coach, modérateur, admin…). Voir `apps/site/lib/roles.ts`. |
| **React** | Bibliothèque qui construit l'interface des pages à partir de composants. |
| **Rebase** | Replacer les commits d'une branche au-dessus de la dernière version d'une autre branche. |
| **RGPD** | Loi européenne sur la protection des données personnelles (emails, comptes…). Elle impose notamment de prévenir les membres avant d'effacer leurs données. |
| **Rollback** (retour arrière) | Revenir à la version précédente quand une mise à jour pose problème. |
| **Schéma** (base de données) | La liste des tables, de leurs colonnes et de leurs liens. |
| **Seuil téléphone/ordinateur** (*breakpoint*) | Largeur d'écran à laquelle le site change d'affichage. BBFrance n'en a qu'un : jusqu'à 1024 pixels de large, l'affichage téléphone (menu latéral global, colonnes latérales rangées dans ce menu, filtres derrière le bouton flottant) ; au-delà, l'affichage ordinateur. En CSS, il s'écrit `@media (max-width: 1024px)` (une *media query* : règle appliquée seulement à certaines largeurs) ; en JavaScript, c'est la constante `MOBILE_BREAKPOINT` (carte 055). |
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
| **TBT** (*Total Blocking Time*, temps de blocage total) | Mesure de Lighthouse : pendant le chargement, temps total où le téléphone est trop occupé à exécuter le JavaScript de la page pour réagir à un toucher. Plus il est court, plus la page répond vite. Bon en dessous de 200 millisecondes. |
| **Thème** | Jeu de couleurs du site. Il y en a 7, au choix du coach (`apps/site/app/theme/`). |
| **Token** (jeton) | Mot de passe technique qui donne accès à un service (GitHub, base de données). S'il fuite, il faut le révoquer. |
| **Tokens de thème** | Noms de couleurs (`primary`, `card`…) qui pointent vers les couleurs du thème actif. |
| **Turbo** (Turborepo) | Outil qui lance les commandes (build, tests) sur toutes les applications du monorepo. |
| **Turso** | Hébergeur de bases SQLite utilisé jusqu'ici, abandonné pour Postgres (ADR-0004). |
| **TypeScript** / **typecheck** | TypeScript ajoute des types au code JavaScript ; le *typecheck* vérifie qu'il n'y a pas d'incohérence avant d'exécuter. |
| **UX** (*User eXperience*) | Le confort d'utilisation : clarté, fluidité, facilité à faire ce qu'on veut. |
| **Vercel** | Hébergeur du site : il le met en ligne automatiquement quand le code est envoyé sur GitHub. |
| **Worktree** | Deuxième copie de travail du même dépôt git, dans un autre dossier. |
