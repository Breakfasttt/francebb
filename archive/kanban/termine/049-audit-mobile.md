---
id: 049
title: Audit mobile de toutes les pages et tests sur téléphone
epic: E03
app: site
depends_on: [040]
adr: 0004
verify: rapport écrit ; tests en taille téléphone dans la CI
---

# 049 — Audit mobile de toutes les pages et tests sur téléphone

## Pourquoi

La plupart des coachs utilisent leur téléphone : le site doit y être impeccable (règle absolue du projet).

## Action

Pour chaque page, en taille téléphone récent et téléphone d'entrée de gamme : pas de défilement horizontal, textes lisibles sans zoom, boutons d'au moins 44 pixels, menus et fenêtres sans bug, 7 thèmes lisibles. Mesure Lighthouse mobile (vitesse d'affichage, réactivité, absence de saut de page). Rapport `docs/mobile-audit.md` avec les problèmes page par page. Ajouter un projet Playwright « téléphone » qui rejoue les parcours existants. Les corrections sont des cartes à créer à partir du rapport, en commençant par le forum.

## Problèmes déjà repérés (rédaction des fiches, carte 045)

- **Seuils incohérents** : `.mobile-only` bascule à 1024 pixels, mais `useIsMobile` et `MobilePortal` à 768. Entre 769 et 1024 pixels (tablettes), les onglets de la modération sont masqués sans être déplacés dans le menu : inaccessibles.
- **Connexion et inscription** : `/auth/login` n'a aucune règle mobile ; à l'inscription, les champs en 0,9 rem font zoomer l'iPhone, et les boutons d'avatar (36 px) et de thème (24 px) sont sous les 44 px.
- **Fenêtre de signalement** (`ReportModal`) : ni hauteur maximale ni défilement interne sur petit écran.
- **`/membres`** : aucune règle mobile ; le tableau défile dans son cadre et les filtres n'utilisent pas le bouton flottant.
- **CSS mobiles non chargés** : `ressources/page-mobile.css` n'est importé nulle part ; `/ligue/edit/[id]` n'importe pas le CSS mobile du formulaire.
- **Filtres** : sur articles, ressources, ligues et tournois, les filtres sont dans le menu latéral au lieu du bouton flottant `MobileFilterWrapper` prévu par le skill `mobile-ux`.
- **Forum et messagerie** : pas de `page-mobile.css` (règles mobiles en fin de `page.css`, ou dans celui du profil pour la messagerie).
- **BBScheme** : interface mobile réelle mais boutons de 40 px ; le skill `mobile-ux` annonçait à tort un écran « ordinateur seulement » (corrigé dans la fiche).
- **`/banned`** : couleurs en dur, presque illisible dans le thème clair.

## Résultat

- Rapport `docs/mobile-audit.md` : mesure automatique de 23 pages sur deux tailles de téléphone (contenu coupé, cibles sous 44 px, textes trop petits, champs qui font zoomer l'iPhone), complétée par les problèmes relevés dans le code.
- Outil de mesure : `tests/e2e/mobile-audit.spec.ts` (`MOBILE_AUDIT=1`, relevé non bloquant).
- **Les 15 parcours essentiels sont rejoués en taille téléphone** (projet Playwright `telephone`, en CI aussi) : tous verts. Suite complète : 46 tests.
- Corrigé tout de suite : le bouton « Retour », présent sur toutes les pages, passe de 40 à 44 px sur mobile.
- Corrections suivantes : cartes 053 (forum), 054 (listes et filtres), 055 (seuil unique téléphone/ordinateur), 056 (carte et quiz), 057 (BBScheme), 058 (connexion, inscription, bannis), 059 (mesure de fluidité Lighthouse, qui demande ton accord pour ajouter la bibliothèque).
