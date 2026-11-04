# Éditeur BBScheme en attente

Ce dossier contient l'éditeur de schémas tactiques BBScheme tel qu'il tournait dans le site jusqu'à la carte 179, déplacé ici sans modification (`git mv`, l'historique de chaque fichier est gardé). Il n'est **pas servi** : il est hors du dossier `app/` de l'application, et exclu de la vérification des types (`tsconfig.json`). La relance est prévue par la carte 071 : « relancer l'éditeur et le brancher sur le hub ».

## Ce qu'il y a ici

| Fichier | Ancien emplacement (dans `apps/site`) | Rôle |
|---|---|---|
| `page.tsx` | `app/bbscheme/page.tsx` | L'éditeur entier (environ 1 550 lignes, composant client), y compris `?id=` (recharger un plateau), `&embed=true` (lecteur seul, pour une iframe) et `&layout=vertical` |
| `actions.ts` | `app/bbscheme/actions.ts` | Actions serveur `saveBoardState` (enregistrement, 500 Ko au plus, dédoublonné par empreinte) et `getBoardState` |
| `component/` | `app/bbscheme/component/` | Réserve d'une équipe (`FigurineBox`), bouton d'outil, fenêtres d'aide et d'export GIF |
| `hooks/usePinchZoom.ts` | `common/hooks/usePinchZoom.ts` | Zoom au pincement à deux doigts (carte 068), qui ne servait qu'à l'éditeur |
| `types/gifshot.d.ts` | `types/gifshot.d.ts` | Déclaration de type de la bibliothèque `gifshot` |
| `tests/` | `tests/e2e/inventaire/bbscheme.spec.ts`, `tests/e2e/bbscheme-pinch.spec.ts`, une partie de `tests/e2e/bugs/divers.spec.ts` | Tests de l'éditeur (Playwright) |

## Relancer l'éditeur (carte 071)

1. Déplacer `page.tsx` et ses voisins dans `app/` de l'application (par exemple `app/editeur/`), retirer `editeur-en-attente` de l'exclusion de `tsconfig.json`.
2. Remplacer les imports du site, qu'une application n'a pas le droit d'utiliser :
   - `@/common/components/BackButton/BackButton` : utiliser un lien de `@bbfrance/ui` ou un petit composant propre à l'application ;
   - `@/common/hooks/useIsMobile` : ce hook est resté dans le site (il y est la règle documentée du seuil téléphone de 1024 pixels) ; l'importer depuis un paquet partagé s'il y est déplacé, ou le recopier, en supprimant alors la copie du site si plus rien ne l'y utilise ;
   - `@/common/hooks/usePinchZoom` : il est dans `hooks/` de ce dossier.
3. Ajouter au `package.json` de l'application les dépendances de l'éditeur : `@bbfrance/ui`, `@bbfrance/bbscheme-player`, `lucide-react`, Tailwind (comme le hub). `html2canvas` et `gifshot` y sont déjà.
4. Servir les rosters : le lecteur et l'éditeur lisent `/data/roster/*.json`, aujourd'hui dans `apps/site/public/data/roster/`. Les copier dans `public/` de l'application, ou les déplacer dans un paquet.
5. Brancher la connexion par le hub (le créateur d'un schéma devient l'identifiant du membre dans le hub), puis écouter l'événement de suppression de compte envoyé par le hub pour vider `creatorId` : depuis la carte 179, le site ne peut plus le faire.
6. Le lien de partage devient l'adresse de l'éditeur dans l'application. Le site peut alors donner `editorUrl` au lecteur (`BBSCHEME_URL` + chemin de l'éditeur) pour remettre le bouton « Ouvrir dans l'éditeur », et l'outil d'insertion de l'éditeur de messages peut revenir (il a été retiré par la carte 179 : voir l'historique git de `apps/site/common/components/BBCodeEditor/`).
7. Rebrancher les tests de `tests/` dans une configuration Playwright de l'application (ils visent encore l'adresse `/bbscheme` et l'identifiant de test `E2E.bbschemeBoardId` du site).

## Ce qu'il faut savoir de l'éditeur (repris de l'ancienne fiche)

- **Téléphone** : terrain toujours vertical entre une barre compacte d'outils (avec « Plus d'outils ») et une barre basse (réserves « Bleue » et « Rouge », lecture de l'animation). Boutons de 44 pixels, champs de 16 pixels, bouton retour en tête de la barre d'outils.
- **Cadre fixe** entre la barre haute du site (57 pixels sur téléphone, 65 sur ordinateur) et son pied de page (40 pixels) : classes `top-[57px]`, `lg:top-[65px]`, `lg:bottom-10` de `page.tsx`, à revoir hors du site.
- **Gestes** : les classes `pitch-viewport`, `pitch-resizer` et `pitch-rotator` servent aux gestes, à `handleResize` et à l'export GIF (capture de `.pitch-resizer`) : ne pas les renommer. `touch-action: pan-x pan-y` sur le cadre et `usePinchZoom` empêchent le navigateur de zoomer toute la page ; les bornes du zoom sont `ZOOM_MIN` et `ZOOM_MAX`.
- **Export GIF** : `html2canvas` et `gifshot` sont chargés par un import dynamique, au seul clic sur l'export ; le fond des images est la couleur `--bb-bg` du thème.
- **Fosses** (zones des joueurs sortis) : désactivées, leur code a été supprimé par la carte 146 (lisible dans l'historique git).
- Manque : une limite de fréquence sur `saveBoardState`.
