# ADR-0006 — Refonte visuelle du site et du forum

- **Statut** : accepté
- **Date** : 2026-10-30
- **Conseil** : oui (`/council`, sur la carte 075)

> Rédigé pour quelqu'un qui découvre le projet. Les termes techniques sont expliqués sur place ou dans `docs/GLOSSAIRE.md`.

## Le problème

L'épic E08 refait la mise en page et l'ergonomie du site et du forum, en pensant d'abord au téléphone. **Aucune fonctionnalité ne doit disparaître.** La liste de contrôle qui le garantit est `docs/refonte/inventaire.md`.

Le responsable du projet a déjà fait plusieurs choix :
- sur téléphone, une barre de navigation en bas de l'écran avec cinq onglets : Accueil, Forum, Tournois, Messages et Plus. L'onglet Plus ouvre un panneau qui contient tout le reste ;
- un nouveau thème par défaut, sombre et sobre, nommé « Vestiaire » ;
- le chantier commence par le socle (couleurs, composants, navigation), puis refait les écrans un par un ;
- les bugs repérés pendant l'inventaire sont traités dans des cartes séparées.

**Faits vérifiés** :
- **Couleurs.** Les 7 thèmes actuels utilisent 98 variables de couleur différentes, déclarées 642 fois dans 8 fichiers de `apps/site/app/theme/`.
- **Radix.** La bibliothèque Radix est déjà installée sous la forme d'un paquet unique, `radix-ui` 1.7.0 (`packages/ui/package.json:16`). Il contient les menus déroulants, les bulles, les onglets et les interrupteurs.
- **Tailwind.** Aujourd'hui, Tailwind ne génère aucune classe pour le site, seulement pour `packages/ui` (`apps/site/app/tailwind.css:15,17`). La remise à zéro des styles du navigateur (le *preflight*) n'est pas activée.
- **Classes en conflit.** Quatre classes de l'ancien CSS portent le même nom qu'une classe Tailwind :
  - `.container` : 11 règles ;
  - `.hidden`, `.invisible` et `.grid` : une règle chacune.
- **Police.** Aucune police n'est chargée : `globals.css:58` demande « Inter » sans la fournir, et le navigateur prend sa police par défaut.
- **Règle à remplacer.** L'ADR 0001 demandait que les pages restent « indiscernables dans les 7 thèmes ». Une refonte ne peut pas respecter cette règle.

## La décision

1. **Couleurs.** Une liste unique d'environ 30 variables, nommées selon leur usage (par exemple « fond », « surface », « texte discret », « accent », « danger »). On les appelle les variables v2. Elles vivent dans `packages/ui` (`tokens.css` et un dossier `themes/`), sans rien qui dépende de Next.js. Le hub, la future application BBScheme et le widget de compte pourront ainsi les réutiliser. Les 98 anciennes variables (v1) deviennent des *alias*, c'est-à-dire d'autres noms qui pointent vers une variable v2, puis elles sont supprimées à la fin du chantier.
2. **Thèmes.** Huit thèmes dessinés à la main : « Vestiaire », plus les 7 thèmes actuels réécrits en variables v2. Chacun garde son esprit : Saison 3 reste parchemin et bleu marine, NAF reste bleu marine et jaune, etc. Un test automatique vérifie, dans chaque thème, que chaque paire texte et fond atteint le contraste AA, la norme d'accessibilité WCAG. Le verre dépoli (fond flou et transparent) est désactivé par défaut, parce qu'il ralentit les téléphones modestes. Un thème peut l'activer.
3. **Thème des membres.** « Vestiaire » devient le thème de tout le monde : visiteurs, nouveaux inscrits **et membres existants**.
   - Une migration de données remplace le thème enregistré de chaque membre par « vestiaire », et la valeur par défaut de la colonne devient « vestiaire ».
   - Avant la migration, on fait une sauvegarde de la base et une copie de l'ancien thème de chaque membre.
   - Un bandeau, affiché une seule fois, annonce le nouveau look et propose de revenir à l'ancien thème en un clic.
   - Les 7 anciens identifiants de thème restent valides.
4. **Police.** Une seule police, dont le fichier est rangé dans le dépôt et servi par le site lui-même (`next/font/local`). Le build fonctionne sans réseau, et aucune donnée de visiteur n'est envoyée à Google.
5. **Bibliothèques.** Aucune nouvelle. Le site utilise Radix uniquement à travers les composants de `packages/ui`.
6. **Ancien CSS.** Pendant la transition, l'ancien CSS est rangé dans une couche CSS (`@layer`) de faible priorité. Les quatre classes en conflit sont renommées en premier. Ensuite, Tailwind génère ses classes pour tout le site. Chaque écran refait supprime ses fichiers `page.css` et `page-mobile.css`. Le preflight n'est activé qu'à la dernière carte, quand l'ancien CSS a disparu.
7. **ADR 0001.** Sa règle « pages indiscernables dans les 7 thèmes » est remplacée par celle-ci : chaque thème garde ses couleurs et son esprit, mais la mise en page change.
8. **Tests d'inventaire.** Pour chaque écran, un test Playwright est écrit à la main **avant** la refonte de cet écran. Playwright est l'outil qui pilote un vrai navigateur. Le test vérifie que chaque action de l'inventaire est présente et utilisable, en la repérant par son rôle et son nom accessible (jamais par une classe CSS). Il tourne en taille ordinateur et en taille téléphone. Après la refonte, il doit passer sans avoir été modifié. Tant que la CI (les vérifications automatiques de GitHub, carte 074) est cassée, ces tests sont lancés sur le poste du développeur.
9. **Retour arrière.** Une variable d'environnement `REFONTE` choisit entre l'ancienne et la nouvelle coquille. La coquille est ce qui entoure chaque page : en-tête, navigation et pied de page. Chaque carte tient en un seul commit, qu'on peut annuler seul. La variable disparaît à la fin du chantier.

## Pourquoi

- Une seule liste de variables, avec des alias provisoires, évite d'avoir trois systèmes en parallèle et permet de migrer écran par écran.
- Ranger les variables v2 dans `packages/ui` prépare leur réutilisation par le hub, l'application BBScheme et le widget de compte, sans créer de paquet de plus.
- Le contraste vérifié automatiquement empêche qu'un des 8 thèmes devienne illisible sans que personne le remarque.
- La variable `REFONTE` et les commits qu'on peut annuler un par un permettent de revenir en arrière en quelques minutes.
- Imposer « Vestiaire » à tous donne la même expérience à toute la communauté, dès le premier jour. C'est le choix du responsable du projet, contre l'avis prudent de la voix des utilisateurs. Le bandeau de retour en un clic et la copie de l'ancien thème limitent la gêne.

**Options écartées** :
- **Générer les thèmes par un script** à partir de 3 ou 4 couleurs : le résultat serait moins soigné que des thèmes dessinés à la main.
- **Préfixer les classes Tailwind** : il faudrait retirer ce préfixe partout à la fin du chantier.
- **`next/font/google`** : le build aurait besoin du réseau, et des données de visiteurs seraient envoyées à Google.
- **Garder l'ancien thème des membres** avec un bandeau d'essai : écarté par le responsable du projet.
- **Ajouter `vaul`** pour les panneaux qui montent du bas : la fenêtre `Dialog` déjà présente suffit.

## Ce qu'on ne fait pas

- Les cartes de refonte n'ajoutent pas de fonctionnalité et ne corrigent pas de bug. Elles ne font que la mise en page et l'ergonomie. Les bugs vont dans les cartes 103 à 108.
- Les adresses, les paramètres d'adresse et les ancres ne changent pas.
- Pas de paquet séparé pour les thèmes.
- Ce qui est listé dans la section « Ce qui n'existe pas aujourd'hui » de l'inventaire n'est pas inventé.

## Risques

- **Barre basse et clavier.** La barre basse peut gêner le clavier virtuel, l'éditeur de message, BBScheme ou le bandeau cookies.
  - La carte 076 fait d'abord un essai sur un vrai téléphone.
  - La barre se cache quand un champ de saisie est actif.
  - Elle respecte la zone protégée de l'iPhone (*safe area*).
  - L'ordre de superposition des éléments est écrit dans `globals.css`.
- **Migration des thèmes.** Elle écrit dans la base.
  - La sauvegarde est faite et vérifiée avant.
  - L'ancien thème de chaque membre est copié.
  - Le skill `database-ops` est suivi.
  - La migration est essayée d'abord sur une base locale.
- **Deux styles à l'écran.** Pendant le chantier, l'ancien et le nouveau style cohabitent.
  - La nouvelle coquille arrive en premier, puis les écrans les plus utilisés (le forum).
  - Le responsable du projet annonce le chantier sur le forum et sur Discord.
- **Captures d'écran instables.** Les captures des tests peuvent varier d'un passage à l'autre. On fige la police, on coupe les animations et on utilise des données de test fixes.
- **Bus factor 1.** Le chantier repose sur une seule personne. Chaque carte décrit son état et son résultat ; un changement de mise en ligne est noté dans `DEPLOY.md`.

## Cartes

- 075 : cadrage.
- 076 à 084 : socle.
- 085 à 100 : écrans.
- 101 et 102 : fin du chantier.
- 103 à 108 : bugs repérés pendant l'inventaire, rattachés à l'épic E01.
