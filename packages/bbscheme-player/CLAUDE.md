# packages/bbscheme-player — lecteur de plateaux BBScheme (@bbfrance/bbscheme-player)

Ce paquet affiche un plateau BBScheme enregistré et rejoue son animation : c'est le lecteur qui apparaît dans un message du forum à la place de la balise `[bbscheme]`. Il contient aussi le terrain (`Pitch`), les pions (`Token`) et les types du plateau (`TokenData`, `BoardFrame`…), que l'éditeur `/bbscheme` du site utilise également. Les règles générales sont dans `.claude/CLAUDE.md` à la racine, la fiche de la fonctionnalité dans `docs/features/bbscheme/README.md`.

- **Pas d'accès à la base de données** : le lecteur reçoit la fonction `loadBoard`, qui lit un plateau par son identifiant. Dans le site, c'est l'action serveur `getBoardState` de `apps/site/app/bbscheme/actions.ts`.
- **Fichiers lus sur le site** : les rosters sont chargés depuis l'adresse `/data/roster/…` (dossier `public/` du site), et le bouton « Ouvrir dans l'éditeur » mène à `/bbscheme?id=…`. Une application qui utilise le lecteur doit donc servir ces adresses.
- **Boutons** : ceux de `@bbfrance/ui`, jamais ceux de `apps/site/common/components/Button` (un paquet n'importe jamais le code d'une application).
- **Téléphone** : les règles sont dans `src/BBSchemePlayer-mobile.css`, sous le seuil unique de 1024 pixels (`@media (max-width: 1024px)`) ; les boutons y font 44 pixels.
- **Couleurs** : celles de l'interface passent par les variables des thèmes (`var(--primary)`, `var(--card-bg)`…). Le terrain et les pions gardent leurs couleurs de jeu, écrites dans `Pitch.css` et `Token.css`.
- Le site utilise directement les fichiers sources TypeScript (`transpilePackages` dans `apps/site/next.config.ts`) : il n'y a pas d'étape de compilation du paquet.
