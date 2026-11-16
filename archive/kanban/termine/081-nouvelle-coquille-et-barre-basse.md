---
id: 081
title: "Nouvelle coquille et barre basse"
epic: E08
app: site
depends_on: [076, 077, 079, 080]
adr: 0006
verify: section 1 de l'inventaire cochée ; à 375 px : barre basse visible, cachée pendant la saisie, zone protégée respectée, boutons d'au moins 44 px ; REFONTE=0 rend l'ancienne coquille
---

# 081 — Nouvelle coquille et barre basse

## Pourquoi

La navigation actuelle est cachée sur téléphone dans un menu hamburger. L'ADR 0006 la remplace par une barre basse toujours visible et un panneau « Plus ». C'est la première chose que les coachs verront changer.

## Action

- Ajouter la variable d'environnement `REFONTE` : elle choisit l'ancienne ou la nouvelle coquille dans `app/layout.tsx`. La noter dans `DEPLOY.md`.
- Téléphone : barre basse à cinq onglets (Accueil, Forum, Tournois, Messages avec pastille, Plus). Le panneau « Plus » contient le profil, le thème, Ligues, Carte, Articles, Ressources, BBScheme, Quizz, Classement, Jouer, Statistiques, Médias, Modération et Administration avec leurs pastilles, les liens du pied de page, Déconnexion, et une rubrique « Cette page » qui reçoit le contenu de `#mobile-page-sidebar-slot`.
- Ordinateur : barre haute avec les mêmes destinations et un menu de compte.
- Nouveau `PageHeader` avec le bouton retour. Repositionner le bandeau cookies et les notifications au-dessus de la barre basse.
- Appliquer les conclusions de la carte 076 : barre cachée pendant la saisie, zone protégée de l'iPhone, ordre de superposition.

## Résultat

- **Nouvelle coquille** : `apps/site/common/components/AppShell/`.
  - `AppShell.tsx` : barre haute et barre basse.
  - `MorePanel.tsx` : panneau « Plus ».
  - `ThemePicker.tsx` : choix rapide du thème.
  - `navItems.ts` : une seule liste des destinations du site.
- **Téléphone.**
  - La barre basse a cinq onglets : Accueil, Forum, Tournois, Messages avec sa pastille, et Plus. Plus porte la pastille de modération pour un modérateur.
  - La barre haute est petite : bouton retour de la page, logo, et bouton Connexion pour un visiteur.
  - Le panneau « Plus » contient le profil ou la connexion, le thème (les 8), les 10 autres rubriques, la rubrique « Cette page », Modération et Administration avec leur pastille, les liens du pied de page et la déconnexion.
- **Ordinateur.**
  - La barre haute contient Accueil, Forum, Tournois, Ligues, Articles et Ressources, plus un menu « Plus » pour le reste.
  - Messagerie et modération ont leur pastille, Administration a son icône.
  - Le menu du compte propose : Mon profil, Réglages, Changer de thème, Déconnexion. Un visiteur a un bouton Thème et le bouton Connexion.
  - Le pied de page est inchangé.
- **« Cette page »** : le panneau « Plus » reste toujours monté (inerte quand il est fermé), parce que les pages y envoient leur colonne latérale par un portail vers `#mobile-page-sidebar-slot`. La rubrique se masque quand elle est vide.
- **Barre basse.**
  - Elle se cache pendant la saisie dans un champ, pour laisser la place au clavier, et sur BBScheme, qui occupe tout l'écran.
  - Elle respecte la zone protégée de l'iPhone.
  - La variable `--app-bottom-nav-space` remonte au-dessus d'elle le bandeau cookies, le bouton de filtres, les notifications et les widgets de développement.
- **Retour arrière** : `REFONTE=0` remet l'ancienne barre et son menu latéral. La procédure est dans `DEPLOY.md`.
- **Corrections annexes.**
  - Seuil `lg:` de Tailwind et `DESKTOP_QUERY` alignés sur celui du site (ordinateur à partir de 1025 px).
  - `Button` et `ActionMenu` neutralisent l'apparence native des boutons, puisque le reset (preflight) est encore absent.
  - Déconnexion partagée (`common/utils/signOutUser.ts`) et compteurs partagés (`Navbar/useNavCounts.ts`), copiés à l'identique.
  - Le grand logo de l'accueil descend sous la barre (provisoire, jusqu'à la carte 090).
- **Tests.**
  - `tests/e2e/inventaire/coquille.spec.ts` (visiteur et modérateur) passe en taille ordinateur et en taille téléphone. Le projet `telephone` rejoue désormais tout le dossier `inventaire/`.
  - Les tests de signalement de `visual-themes.spec.ts` visent le bouton visible.
  - Les captures des thèmes ont été régénérées.
  - Suite complète : 95 tests réussis avant la régénération des captures, puis `visual-themes` et `inventaire` verts (33 tests).
