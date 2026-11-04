# Quiz BBQuizz en attente

Ce dossier contient le quiz BBQuizz tel qu'il tournait dans le site jusqu'à la carte 180, déplacé ici sans modification (`git mv`, l'historique de chaque fichier est gardé). Il n'est **pas servi** : il est hors du dossier `app/` de l'application, et exclu de la vérification des types (`tsconfig.json`). Sa relance sera une carte à part, qui le branchera aussi sur le hub de connexion.

## Ce qu'il y a ici

| Fichier | Ancien emplacement (dans `apps/site`) | Rôle |
|---|---|---|
| `page.tsx` | `app/bbquizz/page.tsx` | Page du jeu (`/bbquizz`), réservée aux membres connectés |
| `actions.ts` | `app/bbquizz/actions.ts` | Actions serveur : une partie (début, question, réponse, jokers), classement, propositions, validation et édition des questions |
| `lib/quizGame.ts` | `lib/quizGame.ts` | Règles côté serveur : tirage équilibré des questions, temps restant, points |
| `utils.ts` | `app/bbquizz/utils.ts` | Nom français des catégories, durées, début du jour et de la semaine à l'heure de Paris |
| `data/questions.ts` | `app/bbquizz/data/questions.ts` | Les questions de départ (environ 300), utilisées quand la base n'a aucune question |
| `component/` | `app/bbquizz/component/` | Écran du jeu (`QuizEngine`), classement (`QuizLeaderboard`), formulaire de question (`QuizForm`) |
| `proposer/`, `valider/`, `editer/` | `app/bbquizz/proposer/` etc. | Proposer une question (membres), valider les propositions et éditer les questions (modérateurs) |
| `tests/bbquizz.spec.ts` | `tests/e2e/inventaire/bbquizz.spec.ts` | Test d'inventaire de la refonte (carte 098), en taille ordinateur et téléphone |
| `tests/quiz-security.spec.ts` | partie quiz de `tests/e2e/security.spec.ts` | Tests de sécurité des cartes 051 (score tenu par le serveur) et 143 (contrôles des propositions et modifications, classements à l'heure de Paris), copiés tels quels |

Les questions de départ ne sont plus chargées par `apps/site/prisma/firstSetup.ts` : elles sont déjà dans la base de l'application, reprises de l'ancienne production par `scripts/import-beta-backup.ts`.

## Ce que le quiz empruntait au site

Une application n'a pas le droit d'importer le code du site. À la relance, chaque emprunt est à remplacer :

| Emprunt (chemin `@/` du site) | Utilisé par | À remplacer par |
|---|---|---|
| `@/lib/prisma` | `actions.ts`, `lib/quizGame.ts` | `lib/prisma.ts` de l'application (même nom d'export, `prisma`) |
| `@/lib/authGuard` (`getActiveSession`) | `page.tsx`, `actions.ts`, `proposer/`, `valider/`, `editer/` | La session donnée par le hub de connexion (comme le site le fait aujourd'hui) |
| `@/lib/roles` (`isModerator`) | `actions.ts`, `QuizEngine.tsx`, `valider/`, `editer/` | Le rôle du membre transmis par le hub, ou une petite fonction propre à l'application |
| `@/lib/actionResult` (type `ActionResult`) | `actions.ts` | Un type `{ success: boolean; error?: string }` écrit dans l'application |
| `@/app/forum/component/ComposeScreen` (`ComposeScreen`, `ComposeActionBar`) | `proposer/`, `editer/`, `QuizForm.tsx` | Écran plein écran de saisie : le déplacer dans `packages/ui` s'il sert aux deux, ou en écrire un petit dans l'application |
| `@/app/forum/component/ForumListHeader` | `QuizEngine.tsx`, `valider/` | Un titre de page propre à l'application, ou un composant de `packages/ui` |
| `@/app/bbquizz/…` (chemins internes) | `lib/quizGame.ts`, tests | Les nouveaux chemins dans `app/` de l'application |

Il faut aussi ajouter au `package.json` de l'application `@bbfrance/ui`, `lucide-react` et Tailwind (comme le hub), et le cadre de la page : la barre haute, la barre basse du téléphone et les thèmes étaient fournis par la coquille du site (`AppShell`).

## Ce qui a changé dans la base

- La table `User` n'existe pas dans cette base. Les actions qui lisaient ou modifiaient la fiche des membres doivent être reprises :
  - la fin d'une partie (`actions.ts`, vers la ligne 100) mettait à jour `quizTotalScore`, `quizAttemptsCount` et `quizBestScore` du membre : écrire désormais dans `QuizPlayerStats` (création de la ligne à la première partie) ;
  - le classement « Panthéon » (`getQuizLeaderboard`, vers la ligne 257) lisait `prisma.user` : lire `QuizPlayerStats` ;
  - le classement du jour et de la semaine et la liste des propositions incluaient le nom et l'avatar du membre (`include: { user … }`, `include: { author … }`) : il n'y a plus de relation, le nom et l'avatar viendront du hub (ou d'une copie gardée dans l'application).
- La série (`quizStreak`, devenue `QuizPlayerStats.streak`) était affichée mais jamais calculée : la calculer ou la retirer reste à décider.
- `revalidatePath("/bbquizz")` vise l'ancienne adresse : à remplacer par la nouvelle adresse du jeu.

## Relancer le quiz

1. Déplacer `page.tsx` et ses voisins dans `app/` de l'application, retirer `quiz-en-attente` de l'exclusion de `tsconfig.json`.
2. Remplacer les emprunts au site (tableau ci-dessus) et adapter le code à la base (section précédente).
3. Brancher la connexion par le hub, puis écouter l'événement de suppression de compte envoyé par le hub pour effacer les parties, propositions et scores du membre : depuis la carte 180, le site ne peut plus le faire. Fournir aussi au hub les données de quiz du membre pour l'export RGPD.
4. Rebrancher les tests de `tests/` dans une configuration Playwright de l'application : ils visent encore l'adresse `/bbquizz` du site, ses outils de test (`fixtures`) et, pour `quiz-security.spec.ts`, le fichier `app/bbquizz/actions.ts`.
5. Vérifier l'affichage sur téléphone (fiche `docs/features/bbquizz/README.md`), puis remettre un lien vers l'application dans le menu du site si le responsable le souhaite.
