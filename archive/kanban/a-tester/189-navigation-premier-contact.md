---
id: 189
title: "Navigation et premier contact"
epic: E10
app: site
depends_on: []
verify: "le visiteur voit « Se connecter / S'inscrire » ; l'onglet « Plus » s'allume sur les pages qu'il contient, et un seul onglet est allumé à la fois ; l'annuaire des membres est dans « Plus » ; le panneau « Plus » range ses rubriques comme l'accueil, le thème en bas ; les boutons Discord n'apparaissent que si l'invitation est réglée ; l'accueil explique le site sur téléphone"
---

# 189 — Navigation et premier contact

## Pourquoi

Audit, section 4.7 : le visiteur ne voit que « Connexion » ; l'onglet « Plus » ne s'allume jamais sur ses neuf pages, et deux onglets s'allument quand le panneau est ouvert sur l'accueil ; l'annuaire des membres n'est que dans la colonne du forum ; le panneau « Plus » met le thème avant les rubriques et les range autrement que l'accueil ; les boutons Discord mènent nulle part si l'invitation n'est pas réglée ; la phrase qui explique le site est cachée sur téléphone ; « Déconnexion » est collé aux liens de bas de page.

## Action

Corriger chacun de ces points dans la coquille (`common/components/AppShell/`), `navItems.ts` (un champ de groupe partagé par l'accueil et « Plus ») et l'accueil ; ajouter un lien « Aller au contenu » pour la navigation au clavier ; vérifier sur téléphone et dans les 8 thèmes.

## Résultat

Le visiteur voit « Se connecter / S'inscrire » dans la barre du haut (sans icône sur téléphone, pour tenir à côté du logo dès 360 pixels de large), dans le panneau « Plus » et dans la barre d'ordinateur ; la page de connexion crée le compte à la première connexion.

Dans la barre basse, un seul onglet est allumé à la fois : la fonction `activeBottomTab` de `navItems.ts` allume « Plus » quand son panneau est ouvert (l'onglet de la page s'éteint alors) ou quand la page courante y est rangée (rubriques de `MORE_NAV`, profil, modération, administration, mentions légales) ; dans ce dernier cas, « Plus » porte `aria-current="page"`.

`navItems.ts` a maintenant une liste `NAV_GROUPS` (Débuter, Jouer en compétition, La communauté, avec leur phrase) et un champ `group` sur chaque rubrique. L'accueil en tire les titres de ses trois blocs, et le panneau « Plus » range ses rubriques dans les mêmes groupes, dans le même ordre. Le panneau suit maintenant cet ordre : profil ou connexion, rubriques par groupe, gestion pour l'équipe, thème, « Déconnexion » dans un bloc à part, puis le pied de page séparé par un filet. La rubrique en cours y est mise en évidence.

L'annuaire des membres (`/membres`) est dans « Plus » (groupe « La communauté ») et dans le menu « Plus » de l'ordinateur, mais seulement pour un membre connecté : la page leur est réservée, et un visiteur n'aurait été que renvoyé vers la connexion. Ce choix passe par le champ `membersOnly` et la fonction `moreNavFor`.

Sur l'accueil, les boutons et le lien Discord n'apparaissent que si l'invitation est réglée (sinon « Jouer à Blood Bowl ! » prend toute la ligne), et la phrase qui explique le site est visible sur téléphone, en deux lignes à 360 pixels. Un lien « Aller au contenu », premier élément de chaque page, apparaît au premier appui sur Tabulation et mène à `<main id="contenu">`.

Vérifié à l'écran en 360 pixels (accueil, panneau « Plus », page des ligues, lien au clavier) : pas de défilement horizontal, bouton de connexion de 44 pixels. La vue d'un membre connecté n'a pas pu être capturée (compte de test absent de la base de développement). La skill `mobile-ux`, la fiche `pages-diverses` et le glossaire sont à jour ; `corepack pnpm check` passe. Les tests e2e modifiés restent à lancer.
