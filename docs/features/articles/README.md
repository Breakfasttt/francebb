# Articles

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Les coachs publient des textes plus longs qu'un message de forum : guides tactiques, récits de tournoi, analyses. Chaque article a des tags, peut être rattaché à une ligue, reçoit des réactions (émojis) et compte ses vues. Les modérateurs peuvent masquer un article sans le supprimer.

## Ce que voit le coach

Ces écrans ont été refaits par la carte 095 (refonte visuelle, ADR 0006) avec les composants de `packages/ui`. Les adresses, leurs paramètres (`?query&tag&author&sort&view&page`), les champs envoyés et les actions serveur n'ont pas changé.

- `/articles` : titre « Articles » avec le nombre d'articles trouvés et, pour un membre connecté, le bouton « Créer un article ». Au-dessus des résultats : la recherche dans le titre et le texte (appliquée 400 millisecondes après la dernière touche), le tri (récents, anciens, titre A-Z, populaires) et le choix grille (12 par page) ou liste (20 par page). Les tags (avec les suggestions des tags existants) et l'auteur sont dans la colonne « Filtres » à gauche sur ordinateur, et dans le panneau « Filtrer les articles » ouvert par le bouton « Filtres » sur téléphone. Chaque filtre actif est rappelé en pastille, avec une croix pour le retirer ; « Réinitialiser » retire les tags, l'auteur et le tri, et garde la recherche et l'affichage. Chaque carte ou ligne d'article est entièrement cliquable.
- `/articles/[id]` : une seule colonne de lecture, centrée : les tags, le titre, l'auteur (avatar et lien vers son profil), la date de publication et le nombre de vues, puis « Modifier » (auteur et modération) et le menu « ⋯ » (« Actions de l'article ») : « Supprimer l'article » (auteur et modération), « Modérer l'article » ou « Annuler la modération » (modération), « Signaler l'article » (membre connecté qui n'est pas l'auteur). Le texte est limité à environ 70 caractères par ligne, avec un interligne de 1,6. En bas, les réactions : une pastille par émoji avec son nombre, et « Réagir » qui ouvre le choix des dix émojis (petit panneau sur ordinateur, panneau du bas sur téléphone).
- `/articles/create` et `/articles/edit/[id]` : un même formulaire en blocs : l'article (titre), le classement (tags, ligue rattachée), puis le contenu en BBCode. Sur ordinateur, la colonne « Publication » porte les boutons ; sur téléphone, l'écran est plein écran (sans la barre du bas, comme la rédaction d'un message) et « Annuler » et « Publier » ou « Mettre à jour » sont collés en bas.
- Accès : tout le monde lit. Un membre connecté écrit, réagit et signale. L'auteur ou un modérateur modifie et supprime. Seul un modérateur masque (« modère ») ou rétablit un article. Un article masqué reste lisible par son auteur et les modérateurs, avec l'avis de modération ; les autres lecteurs ne voient que l'avis.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/articles/page.tsx` | Liste, filtres lus dans l'adresse, pagination |
| `apps/site/app/articles/component/ArticleFilters.tsx` | Colonne des filtres (ordinateur), barre de recherche, tri et affichage, pastilles, panneau des filtres (téléphone) |
| `apps/site/app/articles/component/ArticleCard.tsx` | Carte d'un article (grille, aussi dans l'onglet « Articles » du profil) ou ligne de la liste |
| `apps/site/app/articles/[id]/page.tsx` | Lecture d'un article, droits d'affichage, avis de modération |
| `apps/site/app/articles/[id]/component/ArticleActions.tsx` | « Modifier », menu « ⋯ » : supprimer, modérer, annuler la modération, signaler |
| `apps/site/app/articles/[id]/component/ArticleReactions.tsx`, `ViewCounter.tsx` | Réactions émoji ; compteur de vues |
| `apps/site/app/articles/create/page.tsx`, `edit/[id]/page.tsx` | Pages du formulaire (droits, redirection vers la connexion) |
| `apps/site/app/articles/component/ArticleForm.tsx` | Formulaire (BBCodeEditor, TagSelector, LigueSearch) |
| `apps/site/common/components/TagSelector/TagSelector.tsx` | Saisie des tags avec suggestions, refaite avec `packages/ui` (seuls les articles l'utilisent) |
| `apps/site/app/articles/actions.ts` | Actions serveur |
| `apps/site/app/api/articles/route.ts` | API : articles d'un auteur, utilisée par l'onglet articles du profil (`ProfileArticles.tsx`) |
| `apps/site/app/api/articles/tags/route.ts` | API : tous les tags, pour les suggestions du formulaire |
| `apps/site/tests/e2e/inventaire/articles.spec.ts` | Test d'inventaire de la section 10 (carte 095), en taille ordinateur et téléphone |

Actions serveur (`app/articles/actions.ts`) : `createArticle`, `updateArticle`, `deleteArticle`, `toggleArticleReaction`, `moderateArticle`, `unmoderateArticle`, `incrementArticleViews`. Toutes passent par `getActiveSession()` sauf `incrementArticleViews`.

## Les pièges

- `/api/articles` ne renvoie de l'auteur que ce que la carte affiche (nom, avatar, cadre, rôle), cache les articles masqués sauf à leur auteur et aux modérateurs, et limite la page à 24 articles (carte 050, testé).
- La page `/articles`, elle, ne filtre pas encore les articles masqués : leur titre et leur début apparaissent dans la liste (avec la mention « Modéré ») ; seul leur contenu est caché sur la page de l'article.
- **Modifier un article efface sa ligue** : `edit/[id]/page.tsx` ne transmet pas `ligueId` au formulaire, et `updateArticle` enregistre alors une ligue vide. La page d'un article n'affiche pas non plus la ligue rattachée.
- `incrementArticleViews` n'a aucun contrôle : n'importe qui peut gonfler le compteur. Le composant `ViewCounter` limite à une vue par onglet (`sessionStorage`).
- Un membre n'a qu'une réaction par article : choisir un autre émoji remplace le précédent.
- Le texte est transformé en HTML par `parseBBCode` puis injecté tel quel (`dangerouslySetInnerHTML`) : toute la sécurité repose sur `lib/bbcode`. Les blocs BBCode (spoiler, accordéon, galerie) sont mis en forme par `common/components/BBCodeContent/bbcode.css`, chargé pour tout le site (carte 101). Un schéma BBScheme n'y est pas animé (il faudrait `BBCodeContent`, comme dans le forum).
- La recherche par texte (`contains`) parcourt tout le contenu : lente si les articles deviennent nombreux.
- La fenêtre de modération (`ModerationModal`, commune au forum) a pour titre « Modérer le message de … », même pour un article.
- L'ancienne mention « Membre depuis 2024 », écrite en dur sous le nom de l'auteur, a disparu avec la refonte.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Tag | Mot-clé libre attaché à un article. Un tag inconnu est créé à l'enregistrement (`connectOrCreate`). |
| Modérer un article | Le masquer aux autres membres en gardant une raison et le nom du modérateur, sans le supprimer. |
| Réaction | Émoji laissé sous un article ; la liste proposée est fixe (`COMMON_EMOJIS`). |
| Pastille de filtre actif | Rappel d'un filtre au-dessus des résultats ; sa croix retire ce filtre (voir `docs/GLOSSAIRE.md`). |

## État

- Marche : liste, filtres, pagination, lecture, écriture, réactions, signalement, modération, vues.
- Manque : masquage des articles modérés dans la liste, conservation de la ligue à l'édition, affichage de la ligue rattachée.
- Sur téléphone (carte 095) : une seule colonne, filtres dans le panneau du bouton « Filtres », actions dans le menu « ⋯ », formulaire plein écran. Audit mobile à 360 et 390 pixels : aucun champ sous 16 pixels ni contenu coupé ; les seules cibles sous 44 pixels sont le logo de la barre du haut (commun à tout le site) et les liens à l'intérieur du texte d'un article.
- Vérifié par `tests/e2e/inventaire/articles.spec.ts` (section 10 de l'inventaire de la refonte).
