# Articles

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Les coachs publient des textes plus longs qu'un message de forum : guides tactiques, récits de tournoi, analyses. Chaque article a des tags, peut être rattaché à une ligue, reçoit des réactions (émojis) et compte ses vues. Les modérateurs peuvent masquer un article sans le supprimer.

## Ce que voit le coach

- `/articles` : la liste, en grille (12 par page) ou en liste (20 par page). Une colonne de filtres permet de chercher dans le titre et le texte, de filtrer par tags ou par auteur, de trier (récents, anciens, titre, popularité) et de changer d'affichage. Les filtres sont écrits dans l'adresse (`?tag=…&sort=…`), on peut donc partager une recherche.
- `/articles/[id]` : l'article, mis en forme en BBCode, avec à gauche l'auteur, la date, les vues, les tags et les boutons d'action ; en bas, les réactions.
- `/articles/create` et `/articles/edit/[id]` : le formulaire (titre, tags, ligue, éditeur BBCode).
- Accès : tout le monde lit. Un membre connecté écrit, réagit et signale. L'auteur ou un modérateur modifie et supprime. Seul un modérateur masque (« modère ») ou rétablit un article. Un article masqué reste lisible par son auteur et les modérateurs, avec un bandeau.
- **Sur téléphone** (en dessous de 1024 pixels) : la colonne de filtres est masquée (classe `desktop-only`) et son contenu (bouton « Créer un article », recherche, tags, auteur, tri, choix grille ou liste) s'ouvre avec le bouton flottant de filtres en forme d'entonnoir (`MobileFilterWrapper`, carte 054). Dans ce panneau, les boutons grille/liste (`mini-view-btn`) et « Réinitialiser » mesurent 44 pixels. En mode liste, chaque ligne ne garde que le titre (tronqué), l'avatar et le nombre de vues ; le nom de l'auteur, les tags et la date sont cachés. Sur la page d'un article, la colonne de gauche passe au-dessus du texte.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/articles/page.tsx` | Liste, filtres lus dans l'adresse, pagination |
| `apps/site/app/articles/[id]/page.tsx` | Lecture d'un article, droits d'affichage, bandeau de modération |
| `apps/site/app/articles/create/page.tsx`, `edit/[id]/page.tsx` | Création et modification (redirige vers la connexion si besoin) |
| `apps/site/app/articles/component/ArticleFilterSidebar.tsx` | Filtres : colonne sur ordinateur, panneau du bouton flottant de filtres sur téléphone |
| `apps/site/app/articles/component/ArticleCard.tsx` | Carte d'un article, en grille ou en ligne |
| `apps/site/app/articles/component/ArticleForm.tsx` | Formulaire (BBCodeEditor, TagSelector, LigueSearch) |
| `apps/site/app/articles/[id]/component/` | Réactions, compteur de vues, boutons supprimer, modérer, signaler |
| `apps/site/app/articles/actions.ts` | Actions serveur |
| `apps/site/app/api/articles/route.ts` | API : articles d'un auteur, utilisée par l'onglet articles du profil (`ProfileArticles.tsx`) |
| `apps/site/app/api/articles/tags/route.ts` | API : tous les tags, pour les suggestions du formulaire |

Actions serveur (`app/articles/actions.ts`) : `createArticle`, `updateArticle`, `deleteArticle`, `toggleArticleReaction`, `moderateArticle`, `unmoderateArticle`, `incrementArticleViews`. Toutes passent par `getActiveSession()` sauf `incrementArticleViews`.

## Les pièges

- `/api/articles` ne renvoie de l'auteur que ce que la carte affiche (nom, avatar, cadre, rôle), cache les articles masqués sauf à leur auteur et aux modérateurs, et limite la page à 24 articles (carte 050, testé).
- La page `/articles`, elle, ne filtre pas encore les articles masqués : seul leur contenu est caché sur la page de détail.
- **Modifier un article efface sa ligue** : `edit/[id]/page.tsx` ne transmet pas `ligueId` au formulaire, et `updateArticle` enregistre alors une ligue vide.
- `incrementArticleViews` n'a aucun contrôle : n'importe qui peut gonfler le compteur. Le composant `ViewCounter` limite à une vue par onglet (`sessionStorage`).
- Un membre n'a qu'une réaction par article : choisir un autre émoji remplace le précédent.
- Le texte est transformé en HTML par `parseBBCode` puis injecté tel quel (`dangerouslySetInnerHTML`) : toute la sécurité repose sur `lib/bbcode`.
- La recherche par texte (`contains`) parcourt tout le contenu : lente si les articles deviennent nombreux.
- Plusieurs `any` subsistent (filtres Prisma, session) ; « Membre depuis 2024 » est écrit en dur.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Tag | Mot-clé libre attaché à un article. Un tag inconnu est créé à l'enregistrement (`connectOrCreate`). |
| Modérer un article | Le masquer aux autres membres en gardant une raison et le nom du modérateur, sans le supprimer. |
| Réaction | Émoji laissé sous un article ; la liste proposée est fixe (`COMMON_EMOJIS`). |
| `MobileFilterWrapper` | Le bouton flottant de filtres du téléphone (voir `docs/GLOSSAIRE.md`). |

## État

- Marche : liste, filtres, pagination, lecture, écriture, réactions, signalement, modération, vues.
- Manque : protection des données de l'auteur dans l'API, masquage des articles modérés dans les listes, conservation de la ligue à l'édition.
- Sur téléphone : filtres derrière le bouton flottant ; aucun contenu coupé ni cible trop petite à 360, 390 et 430 pixels (carte 054).
- Cartes ouvertes : 049 (audit mobile de toutes les pages). Aucune carte dédiée aux articles.
