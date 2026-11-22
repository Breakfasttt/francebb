# Éditeur de messages et BBCode

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Le coach met en forme ses textes avec le BBCode : des balises entre crochets comme `[b]gras[/b]`. Le même éditeur sert au forum, aux articles, à la messagerie, aux ligues, au profil (signature) et à l'administration. Il gère aussi les mentions, les citations, les photos et les brouillons. Sortie de la fiche du forum par la carte 221.

## Ce que voit le coach

- **La barre d'outils** (carte 087) : seuls les outils les plus utilisés sont visibles (gras, italique, lien, image, spoiler sur ordinateur, smileys). Le bouton « + » (« Plus d'outils de mise en forme ») range les autres par rubrique (Texte, Blocs, Liens et médias, Aide). « Aperçu » montre le rendu. Sur ordinateur, « + » ouvre un petit panneau sous le bouton ; sur téléphone, un panneau qui monte du bas. Échap ferme l'outil ouvert.
- **Les balises** (`lib/bbcode.ts`) :
  - texte : `b`, `i`, `u`, `s`, `sub`, `sup`, `color=`, `size=` ;
  - mise en page : `center`, `right`, `justify`, `hr`, `list`, `list=1` avec `[*]`, `table`, `tr`, `th`, `td` ;
  - liens et médias : `url`, `url=`, `img` (options `align`), `gallery` (`gallery=2` pour deux colonnes), `youtube` (un lien YouTube collé est aussi reconnu) ;
  - blocs : `code`, `quote`, `quote=membre|message|pseudo`, `spoiler`, `spoiler=titre`, `accordion=titre` ;
  - propres au site : `mention=id`, `topic=id` (lien vers un sujet), `bbscheme` (schéma animé), et les smileys (`:)`, `;)`, `:D`, `:p`, `:(`…).
- **Mentions** (carte 112) : le « @ » s'écrit toujours. Tapé en début de mot, il ouvre en plus la recherche d'un membre (`/api/users/search`, par pseudo seulement). On peut donc encore écrire une adresse électronique. 10 mentions au plus comptent par message (`lib/mentionRules.ts`).
- **Brouillons** (carte 181) : dans la réponse rapide, l'écran « Répondre », la modification d'un message et la création d'un sujet, le texte est gardé dans le navigateur (`localStorage`). Il est enregistré une seconde après la dernière frappe, et tout de suite quand le téléphone passe à une autre application. Au retour, même après un rechargement, il revient avec le bandeau « Brouillon restauré · Effacer ». Un brouillon par membre, par écran et par sujet (ou message, ou forum). Un brouillon vide, identique au texte de départ ou vieux de plus de 7 jours n'est pas restauré. Il est effacé après la publication. « Annuler » demande confirmation si le texte a changé. Le titre d'un nouveau sujet n'est pas gardé.
- **Photos** (carte 184) : l'outil Image commence par « Choisir des photos » ; sur téléphone, le clavier ne s'ouvre pas. Plusieurs photos partent une par une (« Envoi 2 sur 4… ») puis forment une galerie `[gallery]` ; une seule photo donne `[img]`. Une photo de plus de 2000 pixels, trop lourde ou en HEIC est réduite dans le navigateur (JPEG 0,85). Les GIF ne sont jamais réduits, ni les PNG sous 4 Mo. L'envoi passe par le serveur (ImgBB), qui garde la clé.
- **Citer** (cartes 169 et 183) : « Citer » recopie le message sans les citations qu'il contenait déjà (pas de pyramide). Pour un passage, le coach le sélectionne : « Citer la sélection » apparaît au-dessus sur ordinateur, en bas de l'écran sur téléphone. La citation s'ajoute à la fin du texte (un brouillon n'est jamais écrasé) et une notification « Citation ajoutée » propose « Voir ma réponse ». L'onglet « Par @… » d'une citation n'apparaît que si le message cité existe et a bien été écrit par le membre nommé. « Voir le message » mène au lien permanent du message.
- **Schémas BBScheme** : `[bbscheme]identifiant[/bbscheme]` affiche le lecteur animé. Le schéma est lu auprès de l'application BBScheme (`BBSCHEME_URL`) ; sinon le message affiche « Schéma indisponible ». L'éditeur n'a plus d'outil « Schéma » tant que l'éditeur de schémas est en attente (voir `../bbscheme/README.md`).
- **Sur téléphone** : la barre d'outils reste collée en haut pendant que le texte grandit. Une image ou une vidéo placée à gauche ou à droite (`[img align=left]`) passe seule sur sa ligne (classe `bb-float`). Les outils mesurent 44 pixels.
- **Essayer toutes les balises** : le profil de base « exemple » contient le sujet « Vitrine BBCode : toutes les balises » (`exemple-topic-bbcode`, forum « Les petites discussions à la buvette »).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/lib/bbcode.ts` | Transforme le BBCode en HTML : `parseBBCode`, `parseInlineBBCode`, `stripBBCode` (texte brut pour les extraits), `smileysMap`. |
| `apps/site/common/components/BBCodeContent/` | Affichage d'un texte BBCode, `bbcode.css` (seule feuille des blocs) et `BBCodeInteractions.tsx` (ouverture des spoilers). |
| `apps/site/common/components/BBCodeEditor/` | `BBCodeEditor.tsx` (barre, formulaires, aperçu, mentions), `editorTools.ts` (liste des outils), `AIAssistantSheet.tsx` et `aiPrompt.ts` (assistant de mise en forme). |
| `apps/site/common/hooks/useDraft.ts`, `common/utils/draftRules.ts`, `common/components/DraftBanner/` | Brouillons. Règles vérifiées par `tests/unit/draftRules.test.mjs`. |
| `apps/site/common/utils/photoUpload.ts`, `app/imageUploadActions.ts` | Photos : galerie, progression, réduction ; envoi par le serveur (`uploadImage`). |
| `apps/site/lib/forumQuote.ts`, `app/forum/component/QuoteSelectionButton.tsx` | Citations : `buildQuote`, `stripNestedQuotes`, `appendQuote` ; bouton « Citer la sélection ». |
| `apps/site/lib/bbschemeBoard.ts` | Lecture d'un schéma auprès de l'application BBScheme. |

## Les pièges

- **Sécurité (carte 159).** Une balise qui recopie une valeur dans un attribut HTML (`[img]`, `[gallery]`, `[url]`, `[quote=…]`, `[bbscheme]`) refuse toute valeur contenant du HTML produit par une autre balise (`isAttributeSafe`, `SAFE_ID`). Aucun code dans le HTML produit (`onclick`…). Chaque nouvelle balise ajoute sa formule piégée dans `tests/unit/bbcode.test.mjs`.
- **Citations d'un message caché.** `getQuoteStatusMap` (`app/forum/actions.ts`) dit si un message cité est supprimé ou masqué, et donne son vrai auteur. Elle reconnaît les mêmes formes que `parseBBCode` : `[quote=membre|message]` et `[quote=membre|message|nom]`. Depuis la carte 221, elle ne répond que pour les messages des forums que le lecteur peut voir.
- **Brancher un brouillon** : un formulaire passe `key={draft.editorKey}`, `defaultValue={draft.value}` et `onChange={draft.onChange}` à l'éditeur, puis appelle `draft.forget()` après une publication. Le texte de départ doit être connu au premier affichage. Tout accès au `localStorage` est protégé (navigation privée).
- La zone de texte garde son attribut `name` (les formulaires la lisent) et écoute l'événement `bbcode-insert-text` (« Citer ») sans y placer le curseur, pour que la page ne défile pas.
- Les noms des outils (`editorTools.ts`) sont cherchés par le test `forum-editeur.spec.ts` : en changer un oblige à changer le test.

## Les mots expliqués

| Mot | Sens |
|---|---|
| BBCode | Mise en forme par balises entre crochets, comme sur les anciens forums. |
| Mention | Balise `[mention=id]` qui prévient le membre par une notification. |
| Brouillon | Texte en cours gardé dans le navigateur, remis en place au retour. |
| Galerie | Plusieurs images côte à côte (`[gallery]`). |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Notifications | `lib/notifications.ts` (`notifyMentions`) | Une mention prévient le membre, s'il peut lire le sujet et ne l'a pas bloqué. |
| Forum, articles, messagerie, ligues, profil | Toutes les pages qui affichent du texte | Même rendu partout par `BBCodeContent`. |
| Recherche | `lib/forumSearch.ts` | Les mots sont cherchés dans le texte sans balises (colonne générée). |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Modération | `getQuoteStatusMap` | Une citation d'un message masqué ou supprimé est remplacée par un encart. |
| BBScheme | `lib/bbschemeBoard.ts` | Sans l'application BBScheme, « Schéma indisponible ». |
| Membres | `/api/users/search` | Recherche des membres à mentionner (connecté seulement). |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Fait : cartes 087, 112, 159, 169, 181, 183, 184. Sujet « Vitrine BBCode » dans le profil exemple (carte 221).
- Manque : l'outil « Schéma BBScheme », qui reviendra avec l'éditeur de schémas (carte 071).
