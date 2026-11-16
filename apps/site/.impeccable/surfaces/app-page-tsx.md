---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/component/VisitorHome.tsx","app/component/MemberHome.tsx"]
---

# Accueil (`/`)

Scope : la page d'accueil, en deux versions. Visiteur : mode Persuade. Membre connecté : mode Operate.
Audience : le coach qui revient chaque jour (membre), le joueur ou le curieux qui découvre (visiteur). Téléphone d'abord, mais l'affichage ordinateur doit être soigné.
Action : aller au forum, avant tout. Pour le nouveau venu : « Découvrir le jeu » (`/jouer`) et « S'inscrire » ; pour le joueur : « Se connecter ». Discord facile d'accès, moins que le forum (seulement si l'invitation est réglée).
Contraintes du responsable : pas de classement sur l'accueil ; pas de « Créer mon compte » au centre ; ordre du membre fixé (forum et 3 derniers non-lus, tournois + Créer, ligues de la région + Créer + carte, articles + Écrire, autres rubriques) ; le visiteur garde tournois, derniers messages, article au hasard, rubriques.

## Direction contract

THESIS: l'accueil est un terrain de Blood Bowl vu du dessus. Il refuse la suite de cartes de même forme : l'en-but, la ligne de mêlée et les deux camps donnent l'ordre de lecture.
OWN-WORLD: thème actif (Vestiaire par défaut) ; quadrillage de cases en filet d'un pixel (couleur de bordure à 45 %), cases de 26 px sur téléphone et 32 px sur ordinateur ; en-but en voile d'accent fermé d'un trait d'accent de 2 px ; couloirs en pointillés ; ligne de mêlée en trait clair de 2 px ; blocs en surfaces pleines posées sur le terrain, jamais de texte sur le quadrillage nu.
STORY: le visiteur comprend « la scène française de Blood Bowl », choisit son camp (je joue déjà / je découvre) et part au forum ou sur `/jouer`. Le membre voit ce qui l'attend au forum, puis les tournois, les ligues de sa région et les articles, et part au forum.
FIRST VIEWPORT: téléphone visiteur (revu le 17 novembre 2026) : « France Blood Bowl » centré dans l'en-but, « Nouveau coach ? » (Découvrir le jeu et S'inscrire en rouge, Trouver une ligue), ligne de mêlée sans texte, « Tu joues déjà » (Aller au forum + Discord, Se connecter) ; puis les blocs du membre sur une colonne de 760 px. Ordinateur visiteur : terrain couché, en-buts sur les côtés, deux camps côte à côte (« Tu découvres » à gauche), ligne de mêlée verticale, puis la colonne des blocs et les repères. Membre (revu le 16 novembre 2026) : plus de terrain ni d'en-but ; une colonne centrée (760 px) de blocs pleins, du forum (bouton « Forum » dans l'en-tête du bloc) aux médias ; sur ordinateur, repères de défilement à droite (points reliés, trait d'accent qui se remplit).
FORM: visiteur : la feuille de match, tête de la relance n° 1 du tirage visiteur (position 6 de ma liste relancée), fusionnée à la demande du responsable avec le fond de « le terrain », tête du tirage initial ; seed: f75bd4a0dc728bda. Membre : structure fixée par le responsable, seed: none (pinned) — « le plus important c'est le lien avec le forum, donc le bouton pour accèder au forum, et les 3 derniers post non lu du forum, puis après c'est les prochains tournois/créé tournoi, puis les ligues prêt de chez toi/créer une ligue, puis les divers articles/Créer un article, puis les autres trucs ».
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
