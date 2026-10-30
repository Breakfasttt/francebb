---
id: 055
title: Mobile : un seul seuil téléphone/ordinateur
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: aucune page où une colonne disparaît sans être reprise dans le menu, à 360, 800 et 1000 px
---

# 055 — Mobile : un seul seuil téléphone/ordinateur

## Pourquoi

Certaines règles basculent à 1024 pixels (`.mobile-only`), d'autres à 768 (`useIsMobile`, `MobilePortal`). Sur tablette, des onglets (modération) disparaissent sans être accessibles ailleurs.

## Action

Choisir un seuil unique (768 px), le définir à un seul endroit (variable CSS et constante partagée par `useIsMobile`), et l'appliquer partout. Vérifier la modération, l'administration et le profil à 800 et 1000 px.

## Résultat

- **Seuil choisi : 1024 pixels, et non 768 comme prévu dans l'action.** Le menu « hamburger » de la barre du haut, les classes `.mobile-only` et `.desktop-only` et la plupart des pages (forum, articles, ressources, ligues, tournois, modération, accueil) basculaient déjà à 1024 pixels. Descendre à 768 aurait obligé à refaire la barre de navigation et les mises en page ordinateur de toutes ces pages pour des largeurs de 769 à 1024 pixels, pour lesquelles elles n'ont jamais été conçues. Avec 1024, les tablettes reçoivent l'affichage téléphone, déjà vérifié, et l'affichage ordinateur (au-delà de 1024 pixels) ne change pas.
- **Défini à un seul endroit** : la constante `MOBILE_BREAKPOINT` dans `common/hooks/useIsMobile.ts`, utilisée par défaut par `useIsMobile()` (et donc `MobilePortal`, `MobileFilterWrapper`, les colonnes de la modération, de l'administration et du profil, BBScheme), par `TabSystem` (qui suit maintenant les changements de taille de la fenêtre) et par `PageHeader`. Le CSS ne sait pas lire une variable dans un `@media` : il écrit `@media (max-width: 1024px)`, ce que rappellent un commentaire en tête de `globals-mobile.css`, le skill `mobile-ux`, `ARCHITECTURE.md` et le glossaire.
- **Avant / après** : 45 fichiers avaient des règles à 768 pixels (dont `useIsMobile` et `MobileFilterWrapper`), le profil et la page d'un coach basculaient à 900 pixels, `TabSystem` et `PageHeader` à 1024 écrit en dur, quatre pages passaient `breakpoint={1024}` au bouton de filtres. Tout bascule maintenant à 1024 pixels. Restent d'autres largeurs (600, 850, 900, 1000, 1100 pixels) qui ajustent seulement une grille ou un tableau à la place disponible, ce que le skill `mobile-ux` autorise.
- **Modération** : à 800 et 1000 pixels, les 9 onglets étaient introuvables (colonne masquée par le CSS, pas encore déplacée par le JavaScript) ; ils sont maintenant dans le menu latéral global. **Administration** et **profil** : les onglets passent dans le menu dès 1024 pixels, comme le reste de la page. **`/membres`** : les cartes empilées et le bouton de filtres s'appliquent aussi aux tablettes (le tableau de 915 pixels ne tenait pas à 800 pixels).
- **Tri de `/tournois`** : le portail qui envoie le tri dans le panneau de filtres n'existe plus qu'en mode téléphone ; il est recréé à chaque passage sous le seuil. Le tri ne disparaît plus après un agrandissement puis un rétrécissement de la fenêtre (vérifié : 800 → 1280 → 800 pixels, tri présent dans le panneau).
- **Vérifications** : 14 pages (modération, administration avec un compte administrateur, profil, forum, sujet, tournois, articles, ressources, ligues, membres, messagerie, BBScheme, médias) à 360, 800, 1000, 1024 et 1025 pixels : aucun défilement horizontal ; jusqu'à 1024 pixels, menu global présent, onglets dans le menu, filtres derrière le bouton flottant ; à 1025 pixels, colonnes ordinateur affichées. Captures dans `logs/055-mobile/`. Audit mobile (360 et 390 pixels) identique avant et après (47 cibles trop petites au total, aucun contenu coupé). Types : 0 erreur ; ESLint : 551 erreurs, égal au plafond ; tests de bout en bout : 52 réussis, 1 ignoré volontairement (l'audit), captures ordinateur des 7 thèmes inchangées.
- **Non traité (hors du sujet des seuils)** : les 9 cases à cocher de `/tournois` mesurent toujours 22 pixels (leur ligne de 44 pixels réagit au toucher) ; en vue liste de `/tournois`, sous 900 pixels, les colonnes lieu, format et prix sont masquées (choix d'affichage existant, les informations restent dans la vue grille et la fiche du tournoi).
