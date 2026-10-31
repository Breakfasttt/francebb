---
id: 091
title: "Refonte de la connexion et de l'onboarding"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 6 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 091 — Refonte de la connexion et de l'onboarding

## Pourquoi

Refaire la connexion, la vérification de l'email, la page d'erreur et l'onboarding selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 6 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 6 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- L'onboarding reste en une seule page, découpée en blocs lisibles sur téléphone. Le paramètre `callbackUrl` est respecté.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** Les pages de connexion (`/auth/login`), de vérification de l'email (`/auth/verify-request`), d'erreur (`/auth/error`) et d'inscription (`/auth/onboarding`) utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Seule l'interface a changé : les actions serveur, les fournisseurs de connexion, le passage par le hub, les redirections, les cookies, les noms des champs et le paramètre `callbackUrl` sont ceux d'avant (aucun changement dans `auth.ts`, `auth.config.ts`, `proxy.ts` ni dans les fichiers `actions.ts`).
- **Connexion** : une carte centrée sur une colonne, avec une phrase d'explication sous le titre, les boutons Discord et Google en pleine largeur (44 pixels), un séparateur « ou », le champ « Adresse email » avec un vrai libellé et une aide, puis « Recevoir un lien magique » en bouton principal. Les messages d'erreur sont annoncés aux lecteurs d'écran (`role="alert"`). Les « mentions légales » de la dernière phrase deviennent un lien. La section « Mode Développement » (développement seulement) affiche une ligne par compte de test, avec son avatar.
- **Vérification et erreur** : même carte centrée que la page des bannis (carte 090), icône ronde, bouton principal de retour en pleine largeur. Le code de l'erreur reste affiché.
- **Inscription** : une seule page, découpée en cinq blocs empilés (« Votre avatar », « Votre profil de coach », « Vos ligues », « Signature », « Thème du site »), puis le bouton « Valider mon profil et entrer ». Les boutons d'avatar ont un texte au lieu d'une simple icône. Le générateur d'avatar s'ouvre dans un panneau qui monte du bas sur téléphone et dans une fenêtre centrée sur ordinateur, avec un bouton « Annuler ». Le thème se choisit avec le sélecteur déjà utilisé dans le menu du compte (`AppShell/ThemePicker`), qui affiche le nom de chaque thème. Sur ordinateur, NAF et région sont côte à côte.
- **Choix des ligues** (`MultiLigueSearch`, partagé avec l'édition du profil) : refait de la même façon, car il fait partie de l'inscription. Le profil en profite donc aussi.

**Fichiers.**
- Nouveau : `apps/site/tests/e2e/inventaire/connexion.spec.ts`.
- Refaits : `app/auth/login/page.tsx`, `app/auth/login/DevLoginSection.tsx`, `app/auth/verify-request/page.tsx`, `app/auth/error/page.tsx`, `app/auth/onboarding/page.tsx`, `OnboardingForm.tsx`, `OnboardingSuccess.tsx`, `common/components/MultiLigueSearch/MultiLigueSearch.tsx`.
- Modifiés : `common/components/LigueSearch/LigueSearch.css` (sélecteur `.multi-ligue-search-container` devenu inutile retiré), `tests/e2e/mobile-audit.spec.ts` (pages de vérification et d'erreur ajoutées), `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/auth/README.md`, skill `reuse-first`.
- Supprimés (plus importés nulle part) : `app/auth/login/page.css` et `page-mobile.css`, `app/auth/error/page.css`, `app/auth/verify-request/page.css`, `app/auth/onboarding/onboarding.css` et `onboarding-mobile.css`.

**Ce qui est vérifié.**
- Le test d'inventaire `connexion.spec.ts` (8 tests) a été écrit avant la refonte et passait sur l'ancienne version (après l'ajout de noms accessibles aux champs qui n'en avaient pas) ; il passe sur la nouvelle sans changement (16 sur 16, en taille ordinateur et en taille téléphone). Il remplit toute l'inscription d'un nouveau membre et contrôle en base le pseudo, l'avatar généré, le NAF, la région, l'équipe, les ligues (référencée et libre), la signature, le thème et la fin de l'inscription.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse (plafond abaissé) ; `connexion`, `coquille`, `smoke`, `security` et `session-refresh` : 84 réussis, 1 ignoré (test réservé au téléphone, prévu ainsi). Audit mobile des quatre pages à 360 et 390 pixels : aucun élément coupé, aucun champ sous 16 pixels ; les seuls relevés restants viennent de la coquille (petit logo du haut, libellés de la barre du bas). Captures relues à 360 et 1280 pixels en Vestiaire, NAF et Saison 3.

**À essayer à la main sur son téléphone.**
- Se déconnecter, ouvrir une page réservée (par exemple un message privé), se connecter avec Discord, Google, puis avec un lien magique : on doit revenir à la page demandée.
- Avec un nouveau compte : remplir l'inscription, ouvrir le générateur d'avatar (le panneau monte du bas, le clavier ne cache pas le champ « Graine »), envoyer une vraie image, chercher une ligue, en ajouter une libre, changer de thème, valider.
- Ouvrir un lien magique déjà utilisé : la page d'erreur doit s'afficher proprement.

**Remarques (hors carte, non corrigées).**
- L'inscription renvoie toujours à l'accueil à la fin : la redirection vers l'inscription (`auth.config.ts`) ne garde pas la page demandée. Le changer touche la logique de connexion, donc une autre carte.
- L'édition du profil (`ProfileEdit.tsx`) utilise les classes du générateur d'avatar (`avatar-gen-modal`, `style-item`, `upload-btn-icon`…) qui n'étaient définies que dans le CSS de l'inscription : sa fenêtre n'était déjà pas mise en forme quand on ouvrait le profil directement. À refaire avec la carte 092.
- Sur la petite base de test, la liste « Région » de l'inscription est vide : les régions viennent des données de base (`firstSetup.ts`), absentes de la base e2e. Le test ajoute sa propre région.
