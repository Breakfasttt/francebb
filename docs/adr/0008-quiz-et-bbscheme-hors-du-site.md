# ADR-0008 — Sortir le quiz et l'éditeur BBScheme du site

- **Statut** : accepté
- **Date** : 2026-11-04
- **Conseil** : oui (outil `conseil`, compte rendu dans `.claude/council/sessions/2026-11-04-1254-sortir-le-quiz-bbquizz-et-l-editeur-bbsc.md`), décision finale prise par le responsable

> Un ADR (Architecture Decision Record) est une fiche qui garde la trace d'une décision importante : le problème, le choix fait, et pourquoi. Voir `docs/GLOSSAIRE.md`.

## Le problème

Le site contient deux outils qui n'ont rien à voir avec son cœur, le forum :
- le **quiz** (BBQuizz) : environ 3 900 lignes de code, cinq tables et quatre colonnes sur la fiche des membres ;
- l'**éditeur de schémas tactiques BBScheme** : environ 2 000 lignes, une table, et deux bibliothèques qui ne servent qu'à lui (`html2canvas`, `gifshot`).

Ils alourdissent le site et sa maintenance. L'ADR-0001 avait prévu de sortir BBScheme dans sa propre application (épopée E07, carte 071), mais avait refusé d'extraire le quiz, jugé « soudé au forum ».

Le forum, lui, doit continuer à **afficher** les schémas déjà publiés dans les messages (balise `[bbscheme]`, paquet `packages/bbscheme-player`).

## La décision

1. Le quiz et l'éditeur BBScheme deviennent deux applications du dépôt, `apps/bbquizz` et `apps/bbscheme`. Leur code y est **déplacé** (pas copié), et ils sont mis en attente : ils seront relancés plus tard.
2. Chaque application a **sa propre base de données**. Les tables du quiz, la table des schémas et les colonnes du quiz sur la fiche des membres sont retirées de la base du site. Les données y sont transférées avant, et rien n'est supprimé sans sauvegarde.
3. Le widget du forum lit un schéma par une petite adresse publique, en lecture seule, de l'application BBScheme (`GET /api/boards/:id`), dont l'adresse est donnée au site par le réglage `BBSCHEME_URL`. Si l'application ne répond pas, le widget affiche « Schéma indisponible », sans casser la page.
4. En attendant la relance de l'éditeur, on ne peut plus créer de nouveau schéma : l'outil d'insertion de l'éditeur de messages et le bouton « Ouvrir dans l'éditeur » sont masqués.

Cette décision remplace, pour le quiz, la ligne de l'ADR-0001 qui refusait son extraction.

## Pourquoi

- Le quiz n'est pas soudé au forum : il n'emprunte au forum que deux composants de mise en page et les droits des membres, faciles à remplacer.
- Une base par application suit le modèle du hub (ADR-0003) : chaque outil reste indépendant et peut être relancé, mis à jour ou abandonné sans toucher au site.
- **Option écartée : tout garder dans le site** (proposition du conseil). Elle ne répond pas à l'objectif, qui est d'alléger le site.
- Trois précautions viennent du débat du conseil : l'application BBScheme et sa base doivent être en ligne avant que la table quitte la base du site en production ; le code est déplacé, jamais copié, pour qu'il n'en existe qu'une version ; aucune table n'est supprimée sans sauvegarde et comparaison du nombre de lignes.

## Ce qu'on ne fait pas

- Relancer le quiz ou l'éditeur : ce sera un chantier à part, qui branchera aussi la connexion par le hub.
- Supprimer `packages/bbscheme-player` : il reste partagé entre le site (affichage) et l'éditeur.

## Risques

- Tant que l'application BBScheme n'est pas en ligne, les schémas publiés affichent « Schéma indisponible ». C'est la raison de l'ordre de mise en ligne imposé, écrit dans `DEPLOY.md`.
- Les données de l'ancienne production (backup du 4 novembre 2026) sont reprises directement dans les bases des deux applications.

## Cartes

179 (sortie de BBScheme), 180 (sortie du quiz), 178 (reprise des données de la bêta). Remplace en partie la carte 071.
