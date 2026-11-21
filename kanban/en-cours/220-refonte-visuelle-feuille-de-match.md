---
id: 220
title: "Refonte visuelle « feuille de match » et outillage IA de l'interface"
app: site
verify: "DESIGN.md dirige l'apparence ; forum, sujet, accueils, tournois, articles et ressources suivent la coquille SiteLayout (panneau gauche, largeur utilisée) ; aucune page n'affiche l'écusson ; pnpm check vert ; captures avant/après dans docs/design/captures"
---

# 220 — Refonte visuelle « feuille de match »

## Pourquoi

Le 21 novembre 2026, le responsable a fixé la priorité : un site beau, simple, cohérent partout, sur téléphone et sur ordinateur, qui ne ressemble pas à un site fait par IA. L'ancien rendu ressemblait à un modèle sombre tout fait : soupe de cartes, police Inter partout, une icône devant chaque libellé, plusieurs boutons rouges par écran, une colonne étroite centrée sur ordinateur. Le responsable a confié le nouveau rendu en autonomie, avec ses goûts : panneau d'actions à gauche, largeur utilisée, dans un sujet l'auteur à gauche du texte, chaque réponse délimitée, date et heure exactes (références dans `docs/design/refs/`).

## Fait (session du 21/11/2026)

- **Outillage IA** :
  - outils hors sujet coupés pour ce projet (MCP ArtCraft, Figma, Coda… ; plugins ui-ux-pro-max, imagegen, Ludicius Haxe) ;
  - impeccable 4.10 (appel manuel, détecteur en hook) ;
  - skills ajoutés : web-design-guidelines, humaniseur-fr, animations d'Emil Kowalski, `ecriture-fr` ;
  - agent `critique-ui` et commande `/boucle-ui` ;
  - MCP next-devtools ;
  - plugin security-guidance (relecture au commit et au push seulement) ;
  - CLAUDE.md réécrit, `prisma-orm-v7` fusionné dans `database-ops`, `nextjs16` réduit ;
  - hooks : ESLint aussi sur `packages/*`, dépendances surveillées aussi dans `package.json`, écriture interdite dans `.env`.
- **Identité** :
  - `DESIGN.md` réécrit (« la feuille de match ») ;
  - police Archivo variable (titres condensés en capitales, texte normal), angles presque droits ;
  - nom BBFRANCE composé en typographie, écusson supprimé ;
  - mention « Conçu avec l'aide de l'IA » retirée ;
  - badges sans rouge plein, `CardTitle` en voix Heading.
- **Coquille** :
  - `SiteLayout` (panneau gauche, contenu, contexte à droite, bornée à 1760 px), `PanelTitle` et `PanelLink` ;
  - barre du haut sur toute la largeur ;
  - « Connexion » en bouton secondaire ;
  - panneau « Plus » en lignes au lieu de tuiles.
- **Écrans** :
  - accueils visiteur et membre en tableau de bord (flux et contexte, plus de camps ni de terrain décoratif) ;
  - forum en tableaux avec dernières discussions à droite ;
  - liste des sujets ;
  - sujet avec colonne auteur à gauche, date et heure exactes et outils à gauche ;
  - tournois, articles et ressources : action principale en haut du panneau gauche, filtres masqués sur une liste vide, liste par défaut ;
  - classement élargi.
- **Bug corrigé** : l'édition par défaut d'un tournoi s'affichait « BB20 », « BB25 » ou « BB2025 » selon l'écran ; une seule constante maintenant (`DEFAULT_GAME_EDITION`).

## À faire (relecture critique-ui du 21/11)

- [ ] Ligues : `SiteLayout`, « Créer une ligue » en haut du panneau gauche, liste en lignes par défaut.
- [ ] Classement : onglets en `PanelLink` dans le panneau gauche, aide dessous, points en couleur du texte, or réservé au rang.
- [ ] Articles, ressources, tournois : retirer la bascule grille/liste ; ressources en lignes (titre, description, étiquette, domaine).
- [ ] Fiche de tournoi (`TournamentSummary.tsx`) : retirer les icônes des informations et le trophée ; nom du tournoi une seule fois ; « 2 (p:1) » écrit en clair ; pour un visiteur, une action « S'inscrire » qui mène à la connexion ; options absentes écrites (« Repas non inclus ») plutôt que barrées.
- [ ] Filtres des tournois : Région et Format visibles, le reste derrière « Plus de filtres ».
- [ ] Forum : colonne « Messages » (il faut compter les messages par forum) ; date relative dans les listes, date complète au survol.
- [ ] Sujet : panneau gauche avec l'action principale (Répondre ou Se connecter) ; icône des outils sur téléphone explicite.
- [ ] Pied de page sur ordinateur dans le flux plutôt que fixé ; fondu au bord des onglets qui défilent.
- [ ] Revue de cohérence finale de toutes les pages (profil, messagerie, membres, statistiques, médias, administration, modération), puis déclinaison des 4 autres thèmes et test de contraste.
- [ ] Parcours téléphone et ordinateur (`test:parcours`) ; les tests e2e qui cherchent l'ancien logo ou « Se connecter / S'inscrire » peuvent devoir être mis à jour.

## Résultat

À remplir à la fin.
