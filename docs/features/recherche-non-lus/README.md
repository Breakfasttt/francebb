# Recherche et sujets non lus

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Le coach retrouve un message par ses mots, et voit d'un coup d'œil les sujets qui ont reçu des messages depuis sa dernière lecture. Sortie de la fiche du forum par la carte 221.

## Ce que voit le coach

- `/forum/search` (cartes 088 et 191) : le champ des mots-clés et « Lancer la recherche » sont toujours visibles. Depuis la revue 221, la page a la coquille du forum (`SiteLayout`) : sur ordinateur, les filtres (auteur, forum et ses sous-forums, période, tri) sont dans le panneau gauche, avec « Appliquer les filtres » et « Retirer tous les filtres » ; sur téléphone, dans un panneau « Filtres ». Une pastille par filtre actif permet de le retirer.
- **Recherche en français** (carte 191) : « nains chaos » trouve « Nains du Chaos » (les petits mots sont ignorés), « équipe » trouve « equipes » (accents et pluriels ignorés). Une expression entre guillemets est cherchée telle quelle ; « -mot » écarte les messages qui contiennent ce mot.
- Tri par pertinence par défaut, puis du plus récent au plus ancien ; « Plus récents » ou « Plus anciens d'abord » restent possibles. Un mot trouvé dans le titre ne ramène que le premier message du sujet (carte 169).
- **Résultats regroupés par sujet** (revue 221) : un sujet où le mot revient douze fois tient sur une ligne (« 12 messages trouvés dans ce sujet »). La ligne mène au message le mieux placé. L'en-tête dit « 40 messages trouvés dans 12 sujets ». 20 sujets par page.
- Chaque ligne : titre du sujet (trophée pour un tournoi, badge « Archivé » : les sujets archivés restent trouvables), forum, auteur, ancienneté, extrait, vues, date du dernier message, et « Voir ». Les mots trouvés sont surlignés en gris souligné, pas en rouge (le rouge est réservé à l'action principale).
- `/forum/unread`, titre « Sujets non lus » : un bandeau « N sujets non lus » sur l'accueil du forum y mène, et un trait bleu signale un forum qui en contient. Le lien du panneau gauche est allumé sur cette page. Chaque ligne a un bouton « Marquer comme lu » écrit en toutes lettres ; « Tout marquer comme lu » est dans l'en-tête de la page.
- **Règle du non-lu** (carte 166) : un sujet est non lu quand il a reçu un message après la position de lecture du coach (le dernier message qu'il a eu sous les yeux). Lire la page 1 ne marque que la page 1. Sa propre réponse ne rend pas le sujet non lu. Épingler, verrouiller, archiver, déplacer ou renommer ne rendent pas un sujet non lu. Un nouveau membre ne voit en non lu que les messages écrits après son inscription.
- « Tout marquer comme lu » enregistre une seule date pour le membre. « Marquer comme non lu à partir d'ici » (menu « ⋯ » d'un message) laisse le coach sur le sujet (carte 169).
- À l'ouverture d'un sujet, le coach arrive sur le premier message qu'il n'a pas lu, précédé du trait « Nouveaux messages » (`firstUnreadPostId`). Pas de trait dans un sujet jamais lu.
- **Sur téléphone** : les filtres de la recherche sont dans un panneau ; le champ affiche « Rechercher… » sans être coupé.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/forum/search/page.tsx`, `app/forum/component/SearchForm.tsx` | Page et formulaire de recherche. |
| `apps/site/lib/forumSearch.ts` | Recherche plein texte : messages trouvés par Postgres, puis filtrés par Prisma (droits, modération, filtres). `searchPostHits` (avec mots-clés), `filteredPostHits` (filtres seuls, 1 000 au plus), `headlinesFor`. |
| `apps/site/lib/forumSearchGroups.ts` | Regroupe les messages trouvés par sujet (`groupHitsByTopic`, `topicHitsLabel`). Testé par `tests/unit/forumSearchGroups.test.mjs`. |
| `apps/site/lib/forumSearchSnippet.ts` | Découpe l'extrait en morceaux surlignés ou non. Testé par `tests/unit/forumSearchSnippet.test.mjs`. |
| `apps/site/app/forum/unread/page.tsx` | Page des non-lus. |
| `apps/site/app/forum/unreadState.ts` | `getUnreadState(userId)` : sujets non lus et forums concernés, en une requête SQL. |
| `apps/site/lib/forumReadPosition.ts` | Règles de lecture sans base : comparer, avancer, dire si un sujet est non lu (`isTopicUnread`), placer le repère « Nouveaux messages » (`firstUnreadPostId`). Testé par `tests/unit/forumReadPosition.test.mjs`. |
| `apps/site/app/forum/actions.ts` | `markTopicAsRead`, `markTopicAsUnreadFrom`, `markAllTopicsAsRead`, `getUnreadTopics`, `getUnreadTopicsCount`. |
| `apps/site/lib/userSearch.ts` | Recherche d'un membre par pseudo (jamais par adresse électronique). |

## Les pièges

- **Colonnes générées.** `Post.searchVector` et `Topic.searchVector` sont calculées par Postgres à chaque écriture, à partir du texte sans BBCode (configuration `french_unaccent`). Le code ne les écrit jamais. Elles sont déclarées `Unsupported("tsvector")?` avec `dbgenerated(...)`. Changer la formule demande une migration écrite à la main.
- La recherche écarte elle-même les messages et sujets supprimés. Les droits d'accès restent un filtre Prisma (`topicAccessWhere`), appliqué aux 1 000 messages les plus pertinents (`CANDIDATE_LIMIT`). Ne pas recopier les droits en SQL.
- L'extrait est affiché comme du texte, jamais comme du HTML. Postgres marque les mots trouvés par deux caractères invisibles, que `headlineSnippet` découpe.
- Une recherche faite seulement de petits mots (« le », « du ») ne trouve rien. La recherche de sujets par titre de l'éditeur (`/api/forum/topics/search`) garde un `contains`, car elle tourne pendant la frappe.
- **Le non-lu suit `Topic.lastPostAt`, jamais `updatedAt`.** Seuls `createTopic`, `createPost`, `deletePost`, `restorePost`, `splitTopic` et `mergeTopics` changent `lastPostAt`, `lastPostId` et `lastPostAuthorId`. Un nouveau moyen de créer ou d'importer des messages doit les tenir à jour (le profil exemple les remplit, carte 221).
- La position de lecture (`TopicView.lastReadPostAt`) n'avance que jusqu'au dernier message affiché et ne recule jamais, sauf par « Marquer comme non lu ». `markTopicAsRead` n'appelle pas `revalidatePath` (carte 016).
- `User.forumReadAllAt` (« tout est lu avant le… ») ne compte que pour les sujets jamais ouverts. Un test qui attend du non-lu pour un membre neuf doit lui donner une date ancienne.
- La règle du non-lu est écrite deux fois : en SQL (`unreadState.ts`) et en TypeScript (`isTopicUnread`). Les deux se changent ensemble.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Position de lecture | Le dernier message d'un sujet que le coach a eu sous les yeux (table `TopicView`). |
| Pertinence | Note donnée par Postgres à un résultat (`ts_rank`). |
| Recherche plein texte | Recherche par mots, qui ignore les accents, les pluriels et les petits mots. |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Forum | Accueil, liste d'un forum, panneau gauche | Trait bleu, bandeau et compteur des non-lus. |
| Notifications | `markTopicNotificationsRead` | Lire un sujet marque lues ses notifications jusqu'au message lu. |
| Statistiques | `TopicView.lastViewedAt` | Sert à compter les membres en ligne. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Rôles | `lib/forumAccess.ts` | Un forum réservé n'apparaît ni dans les résultats ni dans les non-lus. |
| Modération | Suppression douce | Un sujet ou un message supprimé disparaît des résultats et des non-lus. |
| Messages du forum | `lastPostAt` | Toute création, suppression ou restauration change le non-lu. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Fait : non-lus fiables (carte 166), recherche plein texte (carte 191), titre sans doublons et « Marquer non lu » qui reste sur le sujet (carte 169).
- Le test e2e `forum-recherche.spec.ts` couvre la recherche sur ordinateur et téléphone.
