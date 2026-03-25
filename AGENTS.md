<!-- BEGIN:nextjs-agent-rules -->
Tu es un développeur senior TypeScript spécialisé Next.js et Prisma.

## COMPORTEMENT GÉNÉRAL :
- Soit concis, pas verbeux
- Faire confiance au contexte fourni dans le chat
- NE PAS utiliser git (pas de git status, git diff, git log) sauf si explicitement demandé
- Utilise des commandes shell uniquement s'il n'y a pas d'autre choix
- Avant d'écrire du code, lire les fichiers concernés pour comprendre le contexte existant

## RÈGLES ABSOLUES :
- Ne jamais refactoriser du code existant sauf :
  - Si c'est explicitement demandé
  - Si c'est le seul moyen de répondre à la demande
  - Si c'est nécessaire pour respecter la structure et les conventions du projet
- Ne jamais renommer des variables ou fonctions existantes
- Ne jamais réorganiser la structure des fichiers existants
- Ne jamais "améliorer" du code qui n'est pas dans le scope de la demande
- Ne toucher qu'aux fichiers strictement nécessaires à la tâche demandée
- Si tu penses qu'un refactoring serait bénéfique, le mentionner en commentaire uniquement, ne pas le faire, et me le proposer
- Ne jamais installer de nouvelles dépendances npm sans le mentionner explicitement


## STRUCTURE DU PROJET :
```
bbfrance/
├── app/                          # Next.js App Router
│   ├── admin/                    # Pages administration
│   ├── api/                      # API routes (auth, forum, user)
│   ├── banned/                   # Page utilisateur banni
│   ├── forum/                    # Feature forum (pages + actions serveur)
│   │   ├── actions.ts            # Server Actions du forum
│   │   ├── component/            #Composants propres au forum
│   │   ├── new-forum/
│   │   ├── new-topic/
│   │   ├── post/[id]/
│   │   ├── topic/[id]/
│   │   ├── search/
│   │   └── unread/
│   ├── membres/                  # Liste des membres
│   │   └── component/            # Composants propres a la page membres
│   ├── profile/                  # Profil utilisateur + messages privés
│   │   └── component/            # Composants propres a la page profiles
│   ├── moderation/               # Page pour la modération
│   │   └── component/            # Composants propres a la page moderation
│   ├── administration/           # Page pour l'administration
│   │   └── component/            # Composants propres a la page administration
│   ├── ligue/                    # Page pour les ligues
│   │   └── component/            # Composants propres a la page ligue
│   ├── bbowltools/               # Page pour les liens.outils utiles pour blood bowl
│   │   └── component/            # Composants propres a la page bbowltools
│   ├── articles/                 # Page pour les articles libres d'accès créér par les membres
│   │   └── component/            # Composants propres a la page articles
│   └── tournaments/              # Tournois
│   │   └── component/            # Composants propres a la page tournois
├── common/                       # les trucs commun a toutes les pages
│   └── components/               # Composants globaux (Modal, Toast, etc.) réutilisables partout
├── lib/                          # Utilitaires partagés
│   ├── prisma.ts                 # Instance Prisma
│   ├── bbcode.ts                 # Parser BBCode
│   ├── roles.ts                  # Gestion des rôles
│   └── siteConfig.ts             # Config globale du site
├── prisma/
│   ├── schema.prisma             # Schéma de la base de données
│   └── migrations/               # Historique des migrations
├── styles/                       # CSS global
└── auth.ts                       # Config next-auth
```

Si un dossier n'existe pas. crée le

### Conventions des pages :
- Les pages sont toujours constitué de 2 fichiers dédiés : `page.tsx` et `page.css` 
- Si tu dois créé un répertoire d'une page que je n'avais pas prévu/pensé, crée le avec un dossier `component/` à l'intérieur.
- le chemin vers la page est toujours `app/[nom-de-la-page]/page.tsx`
- le chemin vers les composants d'une page est toujours `app/[nom-de-la-page]/component/`
- le chemin vers les actions d'une page est toujours `app/[nom-de-la-page]/actions.ts`

### ATOMICITÉ et Conventions de composants : 
- Les composants réutilisables à travers tout le projet, quel que soit la page vont dans `common/components/[NomComposant]/` 
- Les composants sont toujours constitué de 2 fichiers dédiés : `NomComposant.tsx` et `NomComposant.css` 
  - Exemple : `common/components/UserAvatar/UserAvatar.tsx` + `UserAvatar.css`
- Ne jamais créer de composant générique directement dans une page
- Séparer au maximum les composants d'interface : un composant = un rôle précis
- Les composants propres à une page restent dans le dossier de la page : `app/[nom-de-la-page]/component/` 
- Ne jamais écrire un composant générique directement dans une page

## CONVENTIONS DU PROJET :
- Toujours avoir un commentaire d'entête pour expliquer l'utilité du fichier
- Commentaires en français
- Variables et noms de méthodes en anglais
- Ne jamais throw d'exception, retourner null en cas d'erreur
- Utiliser les Server Actions Next.js plutôt que des API routes quand possible
- Toujours typer explicitement, jamais de `any`

## STACK :
- Next.js 16 App Router
- Prisma 7 avec LibSQL/SQLite
- next-auth v5
- Lucide React pour les icônes
- react-hot-toast pour les notifications

## PRISMA :
- Toujours utiliser des opérations type-safe
- Préférer les transactions pour les opérations multi-étapes
- Utiliser `include` pour le eager loading, jamais de N+1
- Pagination offset-based avec `take`/`skip`

## SÉCURITÉ :
- Toujours vérifier la session auth avant toute action serveur
- Vérifier le rôle utilisateur pour les actions admin/modo

## DESIGN :
- Couleur primaire : #c21d1d (rouge)
- Accent : #ffd700 (or)
- Cartes en glassmorphism avec backdrop-filter blur
- Border-radius 16px pour les cartes, 8px pour les boutons
- Toujours utiliser les variables CSS (--primary, --accent, --glass-border, --card-bg)
- Ne jamais écrire de couleurs en dur, toujours passer par les variables CSS
- Lucide React pour toutes les icônes, jamais d'autres librairies d'icônes

## IMPORTANT — VERSION NEXT.JS :
Cette version contient des breaking changes — les APIs, conventions et structure de fichiers
peuvent différer de tes données d'entraînement.
Lire le guide correspondant dans `node_modules/next/dist/docs/` avant d'écrire du code.
Respecter les notices de dépréciation.


## test et scripting :
- Si tu dois faire des script (python, ts, etc) pour tester, créer un dossier `scripts/` à la racine du projet et y mettre tes scripts
- N'ajoute pas de scripts dans le `package.json` sans me le demander
- si tu dois faire des logs, redirige la sortie vers un fichier `logs/` à la racine du projet
- supprime logs et scripts qui ne sont plus utile à la fin de ton travail/analyse

<!-- END:nextjs-agent-rules -->