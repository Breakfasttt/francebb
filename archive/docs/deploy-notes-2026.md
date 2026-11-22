# Notes de déploiement d'avant la remise à zéro (2026)

> Archive. Ces étapes concernaient l'ancienne production (bêta, puis première version sur Vercel et Neon), arrêtée depuis. Le déploiement repart de zéro : le guide à jour est [DEPLOY.md](../../DEPLOY.md). À relire seulement pour retrouver l'histoire d'une migration ou reprendre un ancien réglage.

---

## Étape 5 ter : l'application BBScheme (carte 179)

Les schémas tactiques BBScheme, affichés dans les messages par la balise `[bbscheme]`, ne sont plus dans la base du site : ils sont rangés dans la base de l'application `apps/bbscheme`, qui les donne au site par l'adresse `GET /api/boards/<identifiant>`. Décision : [ADR-0008](docs/adr/0008-quiz-et-bbscheme-hors-du-site.md). L'éditeur est en attente : l'application ne sert qu'une page « BBScheme revient bientôt » et cette adresse de lecture.

**Ordre obligatoire** : l'application BBScheme et sa base doivent être en ligne, avec les schémas, **avant** que le site reçoive la migration `20261105100000_bbscheme_hors_du_site`, qui supprime la table `BBSchemeState` de la base du site. Cette migration est appliquée automatiquement par le déploiement du site (`vercel-build`) : ne pas déployer cette version du site avant la fin des points 1 à 5.

1. **Une base Neon de plus**, pour l'application BBScheme (jamais celle du site ni celle du hub).
2. **Un projet Vercel de plus**, *Root Directory* = `apps/bbscheme`, avec la seule variable `BBSCHEME_DATABASE_URL` (adresse de cette base). Le premier déploiement crée la table (`vercel-build` lance `prisma migrate deploy`). Noter l'adresse publique de l'application, par exemple `https://bbscheme.bbfrance.fr`.
3. **Reprendre les schémas de la bêta**, depuis le dossier `apps/bbscheme` (une seule fois, par le responsable) :
   ```bash
   BBSCHEME_DATABASE_URL="postgresql://…(base BBScheme)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
   Le résumé doit annoncer 13 schémas lus et 13 créés (ou inchangés si le script a déjà tourné) ; le relancer ne crée rien de plus. Une fois la reprise vérifiée, supprimer le script du dépôt.
4. **Schémas déjà dans la base du site** : si la base Neon du site existait déjà avec des schémas, créer une branche de sauvegarde Neon du site (`avant-bbscheme-hors-du-site`), compter ses lignes (`SELECT COUNT(*) FROM "BBSchemeState";` dans l'éditeur SQL de Neon), les copier dans la base BBScheme (même identifiant, même empreinte) et vérifier que la base BBScheme en compte au moins autant. Une base du site neuve n'en contient aucun.
5. **Vérifier** : `https://<adresse de l'application>/api/boards/<identifiant d'un schéma>` répond par `{"data": …}`.
6. **Site** : ajouter sur le projet Vercel du site la variable `BBSCHEME_URL` = l'adresse de l'application, sans `/` final, puis déployer la nouvelle version du site. Un message qui contient `[bbscheme]` doit afficher le schéma. Si l'application est arrêtée ou si `BBSCHEME_URL` manque, il affiche « Schéma indisponible », sans gêner le reste du site.

Les bibliothèques `html2canvas` et `gifshot` (export GIF de l'éditeur) ont quitté le site pour l'application BBScheme.

---

## Étape 5 quater : l'application BBQuizz (carte 180)

Le quiz BBQuizz n'est plus dans le site : ses questions, ses parties et les scores des joueurs sont rangés dans la base de l'application `apps/bbquizz`. Décision : [ADR-0008](docs/adr/0008-quiz-et-bbscheme-hors-du-site.md). Le quiz est en attente : l'application ne sert qu'une page « Le quiz revient bientôt », et le site n'a plus aucun lien vers elle. Les questions de départ ne sont plus chargées par `firstSetup.ts` du site.

**Ordre obligatoire** : la base de l'application BBQuizz doit exister et avoir reçu les données du quiz **avant** que le site reçoive la migration `20261105120000_quiz_hors_du_site`, qui supprime de la base du site les cinq tables du quiz et les quatre colonnes de scores de la fiche des membres (`quizTotalScore`, `quizBestScore`, `quizStreak`, `quizAttemptsCount`). Cette migration est appliquée automatiquement par le déploiement du site (`vercel-build`) : ne pas déployer cette version du site avant la fin des points 1 à 4.

1. **Une base Neon de plus**, pour l'application BBQuizz (jamais celle du site, du hub ni de BBScheme).
2. **Un projet Vercel de plus**, *Root Directory* = `apps/bbquizz`, avec la seule variable `BBQUIZZ_DATABASE_URL` (adresse de cette base). Le premier déploiement crée les tables (`vercel-build` lance `prisma migrate deploy`). L'application peut aussi attendre la relance du quiz pour être mise en ligne : seule sa base est indispensable avant la migration du site (créer alors les tables depuis `apps/bbquizz` avec `BBQUIZZ_DATABASE_URL="…" npx prisma migrate deploy`).
3. **Reprendre les données du quiz de la bêta**, depuis le dossier `apps/bbquizz` (une seule fois, par le responsable) :
   ```bash
   BBQUIZZ_DATABASE_URL="postgresql://…(base BBQuizz)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
   Le résumé doit annoncer 340 questions lues, dont 339 créées et 1 ignorée (un texte en double dans la sauvegarde), 7 parties terminées et les scores de 4 joueurs (ou « inchangées » si le script a déjà tourné) ; le relancer ne crée rien de plus. Une fois la reprise vérifiée, supprimer le script du dépôt.
4. **Données du quiz déjà dans la base du site** : si la base Neon du site existait déjà, créer une branche de sauvegarde Neon du site (`avant-quiz-hors-du-site`) et compter ses lignes dans l'éditeur SQL de Neon (`SELECT COUNT(*) FROM "QuizQuestion";`, de même pour `QuizAttempt`, `QuizGame`, `QuizDailyWinner`, `QuizQuestionSuggestion`, et `SELECT COUNT(*) FROM "User" WHERE "quizAttemptsCount" > 0;`). Les questions créées par l'ancien `firstSetup.ts` sont déjà dans la base BBQuizz (même texte) ; toute autre ligne doit y être copiée (même identifiant ; les scores des membres dans `QuizPlayerStats`) avant de continuer. Une base du site neuve, préparée par le nouveau `firstSetup.ts`, n'en contient aucune.
5. **Site** : déployer la nouvelle version du site. Le menu et l'accueil n'ont plus d'entrée « Quizz », et `/bbquizz` donne la page introuvable.

---
## Clé ImgBB gardée par le serveur (carte 141)

Jusqu'à la carte 141, la clé du service d'hébergement d'images ImgBB s'appelait `NEXT_PUBLIC_IMGBB_API_KEY`. Le préfixe `NEXT_PUBLIC_` la recopiait dans le code envoyé au navigateur : n'importe qui pouvait la lire et envoyer des images sur le compte du site. Désormais, les images passent par une action serveur (`apps/site/app/imageUploadActions.ts`), qui est seule à connaître la clé. L'ancienne clé a été publique : il faut la remplacer.

1. **Sur imgbb.com**, avec le compte du site : créer une nouvelle clé (page « API »), puis supprimer l'ancienne.
2. **Sur Vercel** (**Settings** > **Environment Variables**) : ajouter `IMGBB_API_KEY` avec la nouvelle clé, puis supprimer `NEXT_PUBLIC_IMGBB_API_KEY`.
3. Redéployer. Vérifier ensuite un envoi d'image, par exemple « Envoyer une image » dans son profil.
4. **En local**, dans `apps/site/.env` : renommer `NEXT_PUBLIC_IMGBB_API_KEY` en `IMGBB_API_KEY` (avec la nouvelle clé).

Sans cette variable, le site fonctionne, mais tout envoi d'image affiche « L'envoi d'images n'est pas configuré sur le site ».

Une image envoyée est limitée à 4 Mo et doit être un vrai fichier PNG, JPEG, GIF ou WebP. La limite des actions serveur est relevée à 4,5 Mo dans `apps/site/next.config.ts` (`serverActions.bodySizeLimit`), la taille maximale d'une requête acceptée par Vercel.

---

## Refonte visuelle : fin de la variable `REFONTE` (carte 101)

La variable d'environnement `REFONTE`, qui permettait de revenir à l'ancienne navigation pendant la refonte, n'existe plus : l'ancienne navigation et l'ancien CSS ont été supprimés. Si elle est encore déclarée sur Vercel (**Settings** > **Environment Variables**), la supprimer ; elle n'a plus aucun effet. Pour revenir en arrière en cas de problème, annuler le commit de la carte 101 (`git revert`), puis redéployer.

---

## Refonte visuelle : passage de tous les membres au thème Vestiaire (carte 078)

La migration `20261030180000_theme_vestiaire` écrit dans la table des membres : elle copie le thème de chacun dans la nouvelle colonne `previousTheme`, puis donne à tous le thème « vestiaire » (ADR 0006). Elle s'applique d'elle-même au déploiement, comme les autres migrations.

1. **Avant de déployer** : sur Neon, créer une branche de sauvegarde de la base de production (**Branches** > **Create branch**, nom `avant-vestiaire`).
2. Déployer comme d'habitude.
3. **Pour annuler** la bascule, lancer sur la base, dans l'éditeur SQL de Neon :
   ```sql
   UPDATE "User" SET "theme" = "previousTheme" WHERE "previousTheme" IS NOT NULL;
   ```
   Chaque membre présent au moment de la bascule retrouve son ancien thème, même s'il en a choisi un autre depuis. Les membres inscrits après gardent le leur.

