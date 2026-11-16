---
id: 194
title: "Erreurs de saisie affichées sous le champ"
epic: E11
app: site
depends_on: [193]
verify: "en envoyant un article sans titre, un signalement sans raison ou une inscription à un tournoi incomplète, l'erreur apparaît en rouge juste sous le champ concerné, et un lecteur d'écran l'annonce ; les zones de message du forum et de la messagerie ont un nom lu par le lecteur d'écran ; sur téléphone, les champs d'adresse web ouvrent le clavier adapté ; corepack pnpm check passe"
---

# 194 — Erreurs de saisie affichées sous le champ

## Pourquoi

La revue de l'interface du 13 novembre 2026 a montré que toutes les erreurs de saisie passent par une notification flottante (`toast.error`), loin du champ fautif. Sur téléphone, la notification disparaît vite et ne dit pas où corriger.

- Le composant `Field` de `packages/ui/src/field.tsx:31-48` sait déjà afficher une erreur sous le champ (`error`, avec `role="alert"`), mais aucun écran ne l'utilise, et le champ n'est jamais marqué comme invalide pour les lecteurs d'écran (`aria-invalid`, `aria-describedby` : attributs qui disent « ce champ est faux » et « l'explication est ici »).
- Exemples de validations envoyées en notification : `ArticleForm.tsx:82`, `PostMoreMenu.tsx:228`, `TopicTools.tsx:324`, `RegistrationModule.tsx:114`, `ReportModal.tsx:38`, `LigueActions.tsx:61`, `TopicSplitMerge.tsx:59` et `:157`, plusieurs onglets de l'administration.
- La zone de texte de `BBCodeEditor` (`BBCodeEditor.tsx:993`) n'a aucun nom pour les lecteurs d'écran : seul le texte d'exemple (placeholder) l'indique. Écrans concernés : `ReplyForm.tsx:59`, `EditPostForm.tsx:54`, `QuickReply.tsx:73`, `ConversationView.tsx:234`.
- Le lien Discord (`GeneralTab.tsx:61`) et l'adresse YouTube de l'éditeur (`BBCodeEditor.tsx:720`) sont des champs texte simples, et certains champs obligatoires ne le signalent pas (`TournamentForm.tsx:275`).

## Action

- Faire poser à `Field` les attributs `aria-invalid` et `aria-describedby` sur le champ qu'il contient quand `error` est rempli (lire le skill `shadcn` avant de toucher `packages/ui`).
- Pour les erreurs de saisie vérifiables dans le navigateur, afficher l'erreur avec `Field error=` au lieu de la notification ; garder la notification pour les refus du serveur qui ne concernent pas un champ précis.
- Donner à `BBCodeEditor` un `id` et un `aria-label` facultatifs, et les renseigner sur les quatre écrans cités.
- Passer les champs d'adresse web en `type="url"` et signaler « (obligatoire) » de la même façon partout.
- Vérifier en 360 pixels de large et au clavier (touche Tabulation).
- Mettre à jour le skill `ui-components` (règle : erreur de saisie sous le champ).

## Résultat

`Field` (`packages/ui/src/field.tsx`) transmet maintenant au champ qu'il contient, par un contexte React, l'identifiant de son texte d'aide ou d'erreur et son état invalide. `Input`, `Textarea` et `Select` en tirent `aria-describedby` et `aria-invalid` (les attributs passés directement restent prioritaires) et prennent un bord rouge en erreur ; hors d'un `Field`, rien ne change pour les 97 appels existants. Le crochet `useFieldAria` est exporté pour un champ d'un autre type. `BBCodeEditor` utilise déjà le `Textarea` du paquet : placé dans un `Field`, il reçoit ces attributs, et son cadre devient rouge quand sa zone de texte est en erreur. Il accepte aussi `ariaLabel`, un nom lu par les lecteurs d'écran quand aucun libellé visible n'est relié.

Les erreurs de saisie s'affichent sous le champ, au lieu d'une notification, dans : le formulaire d'article (titre, contenu ; le formulaire porte `noValidate` pour que la bulle du navigateur ne passe pas avant), la raison de suppression d'un message et d'un sujet, le nom d'une équipe de tournoi, la scission (titre, forum) et la fusion (sujet d'arrivée) de sujets, l'objet et le message d'une annonce par e-mail, le nom d'une catégorie ou d'un forum dans l'administration, l'année et le nom d'une archive du classement et l'année d'un import. Le curseur va au premier champ en erreur et l'erreur s'efface dès la correction. Pour les contrôles qui ne sont pas des champs, un `<p role="alert">` s'affiche juste dessous : raison d'un signalement (« Choisissez une raison. »), choix du nouveau chef de ligue. Les refus du serveur restent en notification.

Les zones de texte de la réponse, de la réponse rapide, de la modification d'un message et de la messagerie s'appellent « Votre réponse » ou « Votre message » pour les lecteurs d'écran. Le titre, la date de début et la présentation d'un tournoi, ainsi que le nom d'une équipe, portent « (obligatoire) ». Le champ d'adresse YouTube de l'éditeur ouvre le clavier d'adresse web (`inputMode="url"`) ; il reste un champ texte, car il accepte aussi un simple identifiant de vidéo, comme le lien Discord de l'administration, qui avait déjà ce clavier.

Tests modifiés en conséquence, sans être lancés (tests longs regroupés en fin de série, à la demande du user) : `forum-editeur.spec.ts` cherche les zones de message par leur texte d'exemple (leur nom a changé) ; `forum-recherche.spec.ts` et `visual-themes.spec.ts` attendent « Choisissez une raison. ».

Non traité : la raison obligatoire du bannissement (`MembersTable.tsx:133`), qui passe par la fenêtre partagée `BanUserDialog`.

Vérifications : `corepack pnpm check` passe. Le skill `ui-components` (règle « erreur de saisie sous le champ »), le glossaire (`aria-invalid`, `aria-describedby`) et la fiche `forum` sont à jour.

À essayer à la main : publier un article sans titre ni contenu, signaler un message sans raison, supprimer un sujet sans raison ; l'erreur doit apparaître sous le champ, à 360 pixels de large, sans décaler les boutons hors de l'écran ; avec un lecteur d'écran (TalkBack ou VoiceOver), le champ est annoncé « invalide » avec son explication.

Correction après coup (même jour) : `field.tsx` utilisait le contexte React sans être marqué `"use client"`, ce qui faisait planter toutes les pages serveur qui affichent un champ (« createContext only works in Client Components »). `corepack pnpm check` ne le voyait pas ; un contrôle à l'écran l'a révélé. Le fichier commence maintenant par `"use client"`, et les pages publiques (accueil, articles, ligues, tournois, forum, ressources, carte, classement, statistiques) s'affichent de nouveau sans erreur, sans défilement horizontal à 360 pixels. Les écrans connectés n'ont pas pu être revus à l'écran : le test de parcours (`test:parcours`) est à lancer avant tout commit.
