# Conseil : Sortir le quiz (bbquizz) et l'éditeur BBScheme du site BBFrance vers deux applications séparées, chacune avec sa propre base de données, mises en attente pour l'instant. Est-ce le bon découpage, et quels sont les pièges ?

_2026-11-04 · Médiateur, Pragmatique, Pessimiste, Coach joueur de quiz, Développeur seul, Gardien des données des membres (RGPD), Coach organisateur_

## Décision proposée

Je propose de **ne rien déplacer pour l'instant**. Quiz et BBScheme restent dans `apps/site`, leurs tables restent dans la base du site, et on ne crée ni app, ni base, ni copie de code. La création de schémas est coupée par flag, sauf pour une courte liste de coachs. Le quiz reste actif derrière un flag de coupure. Cette option s'écarte de plusieurs décisions du responsable (apps séparées, transfert, suppression des tables, création coupée pour tous). C'est à toi de trancher.

## Pourquoi

- **Widget :** une app « en attente » afficherait « Schéma indisponible » sur tous les schémas publiés (Coach organisateur). Lire la table en local supprime cette régression (Pragmatique).
- **Code copié :** une copie non branchée crée deux sources de vérité (Pessimiste) et du code mort à maintenir le soir (Développeur seul). Ne pas copier neutralise le risque bloquant d'écriture accidentelle.
- **RGPD :** tant que les données restent dans la base du site, l'export et l'effacement prévus par la session RGPD les couvrent déjà (Gardien).
- **Fait vérifié :** l'ADR-0001 juge le quiz « soudé au forum », et rien n'a changé depuis.
- **Joueurs :** une pause du quiz casse les séries quotidiennes (Coach joueur).

## Ce qu'on ne fait pas

- Pas d'`apps/bbquizz` ni d'`apps/bbscheme`, et pas de base Neon supplémentaire.
- Pas de transfert, pas de DROP, pas de migration des colonnes User.
- Pas de dépendance à `BBSCHEME_URL` pour l'instant.
- Pas de rôle Postgres en lecture seule : sans copie, il est inutile, et il gênerait l'effacement de compte (Gardien).

## Désaccords restants

- **Création de schémas :** Coach organisateur veut une exception pour les coachs, la décision initiale coupait la création pour tous. Je retiens l'exception : elle coûte peu et fournit un usage mesurable pour décider d'une relance.
- **Copie du code :** Pragmatique voulait copier le code dans `apps/`, Développeur seul s'y oppose. Je retiens l'absence de copie.

## Actions

1. Créer un flag de création BBScheme par rôle, avec la liste des coachs autorisés.
2. Mettre le quiz derrière un flag de coupure, activé par défaut.
3. Ajouter une tolérance d'un jour au calcul des séries et une restauration manuelle.
4. Tester le rendu `[bbscheme]` sur trois messages existants avant le déploiement.
5. Avec la session RGPD : intégrer les tables quiz, les 4 colonnes User et `BBSchemeState` à l'export, à l'effacement et au registre des traitements, avec une durée de conservation.
6. Ajouter à l'ADR-0001 une date de revue et un critère de relance (joueurs actifs par semaine, schémas créés).
7. Écrire la procédure d'une future extraction : dump restauré hors Neon, comptages et checksums, puis DROP dans une migration séparée.

## Questions ouvertes

- Quelle date de revue, et quels seuils de relance ou d'abandon ?
- Qui figure sur la liste des coachs ?
- Quelle durée de conservation pour les scores et les schémas ?
- Dans quel fuseau horaire les séries sont-elles calculées ?

## Positions des membres

| Membre | Position |
|---|---|
| Pragmatique | Copier le code BBScheme dans apps/ mais garder la table et le rendu dans le site, quiz sous flag. Ne rien supprimer ni migrer avant le RGPD et le hub. |
| Pessimiste | Se rallie au maintien dans le site, à condition qu'aucune écriture parasite ne soit possible et que l'ADR fixe une date de revue. |
| Coach joueur de quiz | Quiz actif dans le site, séries protégées par une tolérance d'un jour. Critère de relance fondé sur les joueurs actifs. |
| Développeur seul | Ne rien déplacer tant qu'il n'y a pas de relance, couper seulement la création par flag. |
| Gardien des données des membres (RGPD) | Ne rien déplacer, intégrer quiz et schémas à l'export, à l'effacement et au registre. Dump restauré avant tout futur DROP. |
| Coach organisateur | Ne rien déplacer, garder la création pour les coachs et le rendu des schémas existants intact. |

---

## Débat

### Contexte

Site Next.js 16 + Prisma/Postgres (Neon), monorepo pnpm (apps/site, apps/hub = connexion unique OIDC pas encore en ligne). Forum = cœur. Quiz : 3 900 lignes, 5 tables + 4 colonnes quiz sur User, importe des composants du forum ; ADR-0001 avait refusé de l'extraire (« soudé au forum »). BBScheme : éditeur de schémas tactiques 2 000 lignes, table BBSchemeState ; le forum affiche les schémas via le paquet bbscheme-player (balise [bbscheme]). Décisions du responsable : les deux apps vont dans apps/, chacune sa base ; données transférées puis tables supprimées du site ; widget forum lit les schémas via GET /api/boards/:id de l'app BBScheme (variable BBSCHEME_URL), sinon « Schéma indisponible » ; plus de création de schéma tant que l'app n'est pas relancée ; éditeur et quiz copiés tels quels, non branchés. Session RGPD parallèle touche suppression/export de compte. Développeur seul, pas de Docker.

**Pragmatique** _(tour 1)_ : Pour BBScheme, le découpage tient : le contrat est une seule route GET, avec repli « Schéma indisponible ». Pour le quiz, c'est plus fragile : 4 colonnes sur User, des composants du forum importés, et l'ADR-0001 qui disait « soudé ». Un quiz copié « tel quel » ne compilera pas seul.

Pièges :
- Supprimer les tables du site est irréversible. Attends une vérification du transfert (comptages) et garde un dump Neon.
- Sans le hub OIDC, les userId deviennent orphelins, et la session RGPD (export/suppression) ne couvre plus ces bases.
- Deux copies du code dérivent vite.
- Mets un timeout et un cache sur le widget.

Reportable : le drop des tables, les migrations de User et le branchement.

Position : extraire BBScheme maintenant, geler le quiz par feature flag, et ne supprimer aucune table avant la fin du RGPD et du hub.

**Pessimiste** _(tour 1)_ : **Bloquant :**
- Suppression des tables avant vérification. Mesure : dump `pg_dump` conservé, comptage des lignes comparé, et DROP dans une migration séparée, après une semaine.
- RGPD : les données quiz et schémas, hors de la base du site, échappent à l'export et à la suppression de compte. Mesure : geler le DROP tant que la session RGPD n'a pas listé ces données.

**À atténuer :**
- Sans hub OIDC, l'identité utilisateur entre bases est orpheline. Mesure : conserver l'ID du site comme clé externe.
- Si l'app BBScheme est en attente, tous les schémas du forum sont indisponibles. Mesure : l'app doit tourner en lecture seule, ou le forum garde un snapshot.
- Les composants du forum copiés dans le quiz divergent. Mesure : liste figée des imports.

**Accepté :** pas de création de schéma.

Position : découpage plausible, mais l'ordre est dangereux ; on ne supprime rien avant sauvegarde vérifiée et couverture RGPD.

**Coach joueur de quiz** _(tour 1)_ : Pour BBScheme, le découpage est sain : 2 000 lignes autonomes et une seule table. Pour le quiz, je suis réservé : l'ADR-0001 disait « soudé au forum », et rien n'a changé. Mon angle, c'est le joueur. Si le quiz reste en pause des semaines, chaque série quotidienne saute et les scores perdent leur sens. Avant de supprimer quoi que ce soit :

- Figer les séries (date de gel, reprise sans perte) et garder le classement lisible.
- Conserver un dump vérifié (comptage de lignes, sommes de scores) avant de supprimer les tables.
- Mapper les userId stables : sans OIDC, la nouvelle base est orpheline.
- Intégrer les nouvelles tables au périmètre export/suppression RGPD.

Position : BBScheme à extraire, mais le quiz seulement après gel des séries, dump contrôlé et identité OIDC prête.

**Développeur seul** _(tour 1)_ : Le découpage est discutable, et le piège principal est de payer maintenant le coût de trois déploiements pour du code qui dort. BBScheme s'extrait proprement : 2 000 lignes, une table, une frontière claire (le player reste un paquet). Le quiz, lui, est « soudé au forum » (ADR-0001) et touche 4 colonnes de User : l'extraire, c'est dupliquer ou publier des composants partagés, donc plus de code à surveiller, pas moins.

Pièges : supprimer les tables avant d'avoir vérifié le transfert (garde un dump Neon) ; le widget qui dépend d'une app en attente (le forum affiche « indisponible » en permanence) ; export/suppression RGPD qui doit couvrir trois bases ; deux bases Neon supplémentaires à migrer sans Docker.

Plus simple : mets le quiz en feature flag dans le site, extrais seulement BBScheme.

Position : extraire BBScheme seul, laisser le quiz dans le site derrière un flag tant qu'il n'est pas relancé.

**Gardien des données des membres (RGPD)** _(tour 1)_ : Le découpage est défendable, mais l'ordre « transférer puis supprimer les tables » est le piège majeur. Aucune suppression sans trois garde-fous : (1) dump complet vérifié (restauration testée, comptages et checksums) des 5 tables quiz, des 4 colonnes User et de BBSchemeState, conservé hors Neon ; (2) migration Prisma en deux temps : copier maintenant, supprimer seulement après une période de validation ; (3) export et effacement de compte à étendre aux deux nouvelles bases (scores, réponses, schémas = données personnelles). Sinon l'effacement d'un membre laisse des résidus orphelins dans des apps « en attente », et l'export devient incomplet. Les apps dormantes gardent pourtant des données : il faut un registre des traitements et une durée de conservation. Coordonner avec la session RGPD parallèle avant de toucher au schéma User.

Position : ne supprimer aucune table du site avant sauvegarde restaurée, et prévoir l'export/effacement inter-bases.

**Coach organisateur** _(tour 1)_ : Le découpage se défend, mais pour mon usage il y a un piège majeur : mes messages de tactique dépendent du widget. Si l'app BBScheme est « en attente » et que BBSCHEME_URL pointe dans le vide, tous les schémas déjà publiés affichent « Schéma indisponible ». Ce serait une régression visible sur le cœur du forum.

Pièges :
- Ne pas supprimer la table BBSchemeState avant qu'une app tourne réellement et que la lecture soit vérifiée.
- Prévoir un cache ou un instantané JSON côté forum.
- Interdire la création coupe ma pratique : garder au moins un éditeur minimal.
- Schémas liés à un auteur : suppression et export RGPD à prévoir.

Position : séparer le quiz maintenant, mais garder le rendu des schémas autonome tant que BBScheme n'est pas relancé.

**Médiateur** _(tour 2)_ : Tous s'accordent : aucune suppression de table avant un dump restauré et une couverture RGPD. Le vrai désaccord porte sur BBScheme : une app « en attente » est incompatible avec un widget forum qui en dépend, car tous les schémas publiés casseraient.

**Question :** l'app BBScheme tourne-t-elle en lecture seule dès l'extraction, ou le forum garde-t-il un instantané ?

**Pragmatique** _(tour 2)_ : Le Médiateur pose la bonne question, et ma réponse est : ni l'un ni l'autre. Une app en lecture seule, c'est un déploiement et une base Neon à maintenir pour du code qui dort, Pessimiste. Le plus petit changement est de laisser `BBSchemeState` dans le site, en lecture seule, et de faire lire le widget en local. On garde `BBSCHEME_URL` en option pour plus tard. Coût : une demi-journée, et la régression de Coach organisateur disparaît.

Je concède aussi un point : en gelant le quiz derrière un flag dans le site, Coach joueur, les séries continuent et le problème du gel disparaît. Le DROP, les migrations de User et le branchement restent reportés.

Position : extraire le code BBScheme dans apps/, garder la table et le rendu dans le site, ne supprimer ni migrer rien avant le RGPD et le hub.

**Pessimiste** _(tour 2)_ : Pragmatique, ta version me convient mieux que mon snapshot, mais elle crée un piège. « Table gardée, code déplacé » donne deux sources de vérité dès qu'un éditeur copié reste branchable.

**Bloquant :** une écriture accidentelle sur `BBSchemeState` depuis l'app copiée. Mesure : retirer les routes d'écriture du site et révoquer l'écriture côté rôle Postgres, ou au minimum un test qui échoue sur tout POST.

**À atténuer :** « en attente » devient définitif, et le flag quiz pourrit. Mesure : une date de revue dans l'ADR-0001, avec un critère d'abandon ou de relance.

**Accepté :** `BBSCHEME_URL` inutilisé pour l'instant.

Position : je me rallie au plan de Pragmatique, à condition que la table soit verrouillée en lecture seule et que l'ADR fixe une date de revue.

**Coach joueur de quiz** _(tour 2)_ : Pragmatique, je prends ta concession : quiz derrière un flag dans le site, les séries continuent et mon gros souci disparaît. Mais « flag » ne doit pas vouloir dire « pas touché ». Le quiz se joue chaque jour, donc le flag doit rester activé, sinon on retombe dans la pause.

Piège concret que personne n'a nommé : le calcul de la série repose sur la date. Pendant une migration ou un déploiement, un fuseau mal géré ou un quiz indisponible une journée, et des séries de plusieurs mois sautent. Prévoir une tolérance d'un jour et une restauration manuelle.

Pessimiste, ta date de revue dans l'ADR me convient : je demande que le critère de relance mentionne l'usage réel (joueurs actifs par semaine).

Position : extraire BBScheme seul, laisser le quiz actif dans le site avec séries protégées, et ne rien supprimer avant dump restauré et RGPD.

**Développeur seul** _(tour 2)_ : Pragmatique, je me rallie en grande partie, et c'est même plus léger que ma position du tour 1 : si la table et le rendu restent dans le site, on n'ajoute aucune base Neon ni aucun déploiement. Mais je vais plus loin : « extraire le code dans apps/ » sans le brancher, c'est du code mort à surveiller le soir. Pessimiste a raison sur les deux sources de vérité. Je propose de ne pas copier l'éditeur tant que personne ne le relance : on le garde dans le site, route de création coupée par un flag, et on extrait le jour où il y a un besoin réel. Coach joueur, ta tolérance d'un jour sur les séries est simple à coder et je la prends. Le critère de relance dans l'ADR doit rester court, avec une date de revue.

Position : ne rien déplacer physiquement tant qu'il n'y a pas de relance, couper seulement la création par flag, garder tables et rendu dans le site.

**Gardien des données des membres (RGPD)** _(tour 2)_ : Développeur seul, ton plan est celui que je préfère : tant que tables et données restent dans la base du site, l'export et l'effacement de compte de la session RGPD les couvrent déjà, sans chantier inter-bases. C'est le meilleur argument pour ne rien déplacer. Je concède donc que mes trois garde-fous passent au second plan : le dump et la migration en deux temps ne servent qu'au jour de l'extraction.

Piège à retenir : le flag quiz et la création coupée ne doivent pas exclure ces données du périmètre RGPD. Un quiz « gelé » conserve scores et réponses ; il faut garder l'effacement actif, ajouter les 4 colonnes User et BBSchemeState au registre des traitements, avec durée de conservation. Pessimiste, ton rôle Postgres en lecture seule ne doit pas bloquer la suppression de compte : prévoir une exception pour l'effacement.

Position : ne rien déplacer, mais intégrer quiz et schémas à l'export/effacement et au registre, avec dump restauré avant tout futur DROP.

**Coach organisateur** _(tour 2)_ : Développeur seul, Gardien, je me rallie : si rien ne bouge, le rendu de mes messages de tactique reste intact et le problème « Schéma indisponible » disparaît. Pessimiste, ton verrou Postgres devient inutile : sans copie branchée, il n'y a plus de deuxième source de vérité. Un flag de création suffit.

Deux points concrets que personne n'a posés :
- Couper la création pour tous me pénalise en pleine saison. Je propose un flag par rôle : création coupée pour les membres, gardée pour les coachs (liste courte). Le critère de relance de l'ADR s'appuie alors sur un usage réel.
- Les identifiants de schéma et la balise [bbscheme] ne changent pas. Un test de rendu sur trois messages existants suffit avant déploiement.

Position : ne rien déplacer, couper la création par flag sauf pour les coachs, garder le rendu des schémas existants intact.
