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

- [x] Ligues : `SiteLayout`, « Créer une ligue » et les zones dans le panneau gauche, liste en lignes.
- [x] Classement : vues dans le panneau gauche (`panelItemClass`), aide dessous ; onglets gardés sur téléphone. Reste : couleur des points et or du rang.
- [x] Articles, ressources, tournois : bascule grille/liste retirée, une seule présentation en lignes ; image de ressource seulement si elle existe.
- [x] Fiche de tournoi : sans icônes ni trophée, nom une seule fois, inscrits en clair, logistique écrite, badges neutres ; « Se connecter pour s'inscrire » pour un visiteur ; « Inscrits (N) » hors gestion.
- [x] Filtres des tournois : localisation et format visibles, le reste derrière « Plus de filtres » (ordinateur).
- [x] Date relative dans les listes (`RelativeTime`), date complète au survol.
- [x] Forum : colonne « Messages » (une requête groupée en cache 60 s), unités masquées sur ordinateur.
- [x] Sujet : « Se connecter pour répondre » pour un visiteur dans le panneau gauche.
- [x] Sujet : bouton « Outils » avec libellé sur téléphone.
- [x] Pied de page sur ordinateur dans le flux.
- [x] Fondu au bord des onglets qui défilent : déjà assuré par `TabsList` (`useScrollableRow`).
- [x] Passe 2 (relecture critique-ui) : « Jouer » sans illustrations générées (page de lecture avec sommaire à gauche) ; statistiques en tableau de score ; médias sans états vides passe-partout ; fiche de ligue en page de détail (fil d'Ariane, rôles réunis, contexte à droite) ; écusson de remplacement supprimé (blason seulement s'il existe) ; chargement des ressources en lignes ; un seul bouton rouge sur un sujet de tournoi ; panneau gauche à 240 px partout ; mois des dates en discret ; « Palmarès » ; classement sans rouge sur les points.
- [ ] Texte de « Jouer » : il est saisi dans l'administration (base de données), à reprendre là (tutoiement, sous-titre en casse normale).
- [x] « Réinitialiser » des filtres seulement quand un filtre est actif ; colonne NAF du classement masquée si vide.
- [x] Passe 3 (pages membres) : profil avec fiche et rubriques dans le panneau gauche ; administration et modération (`StaffPageLayout`) en liens de panneau sans icônes ; icônes retirées devant les titres de panneau ; journal de modération (purge discrète, cachée si vide) ; messagerie, notifications et non-lus tutoyés, sans icône géante ; non-lus dans la coquille du forum ; annuaire des membres en lignes sur téléphone, « Message privé » en lien texte ; `EmptyState` partagé aligné à gauche, sans icône ; bandeau visiteur du forum corrigé sur téléphone.
- [x] Tutoiement de tout le site (environ 235 textes : erreurs, notifications, formulaires, e-mails, impératifs) ; 11 fichiers de tests adaptés.
- [x] Annuaire des membres : filtres dans le panneau gauche sur ordinateur.
- [x] Annuaire des membres : « Changer le rôle » dans le menu « … » (panneau de choix), colonnes allégées.
- [x] Thèmes : captures dans les 5 thèmes (`THEME=… node apps/site/scripts/captures-membre.mjs visiteur`) ; nom du site aux couleurs de la barre (illisible sur les barres rouges de Saison 3 et NAF), boutons du panneau du sujet qui passent à la ligne.
- [x] Sécurité : le nombre de messages par forum n'est envoyé au navigateur que pour les forums visibles (revue security-guidance).
- [x] Accueil : le user garde les blocs actuels (décision du 21/11).
- [ ] CI GitHub désactivée à la main (décision du user de la laisser coupée) : les tests e2e adaptés ne sont pas vérifiés.
- [x] Revue de cohérence de toutes les pages (trois passes critique-ui) et captures dans les 5 thèmes. Le test automatique de contraste reste à lancer avec la suite e2e.
- [ ] Parcours et suite e2e : tests adaptés au nouveau rendu, mais non lancés (le poste manque de mémoire pour le serveur de test, la CI est coupée). À lancer sur une machine qui le permet ou en réactivant la CI.

## Résultat

Le site suit une seule grammaire, décrite dans `DESIGN.md` : coquille `SiteLayout` (panneau gauche avec l'action principale, contenu sur toute la largeur, colonne de contexte), lignes séparées par des filets plutôt que des cartes, titres en capitales condensées (Archivo), un seul bouton rouge par écran, texte tutoyé, nom du site en typographie sans écusson. Le forum suit les goûts du responsable : auteur à gauche du texte, chaque réponse délimitée, date et heure exactes. Trois passes de relecture par l'agent `critique-ui` et des captures dans les 5 thèmes ont servi de contrôle (`docs/design/captures/`).

L'outillage IA est en place pour la suite : `DESIGN.md` qui dirige, skills `ui`, `ecriture-fr`, `humaniseur-fr`, `web-design-guidelines`, agent `critique-ui`, commande `/boucle-ui`, script `apps/site/scripts/captures-membre.mjs`, plugin security-guidance (il a relevé et fait corriger une fuite pendant le chantier).

Restent hors de ce chantier : le texte de « Jouer » en base (à reprendre dans l'administration) et la vérification des tests e2e, adaptés mais non lancés (voir `TESTS-MANUELS.md`, section 23).
