---
description: Boucle de relecture d'un écran - captures téléphone et ordinateur, critique par l'agent critique-ui et le détecteur impeccable, liste de corrections
argument-hint: <chemin de la page, ex. /forum> [fichiers de la page]
---

Relire l'écran `$ARGUMENTS` de BBFrance.

1. Vérifier que le serveur répond (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`). Sinon, lancer `corepack pnpm dev` en arrière-plan et attendre (la première compilation peut prendre 5 minutes sur ce poste).
2. Capturer la page : `.claude/skills/impeccable/scripts/impeccable shot http://localhost:3000<chemin> --viewport 390x844,1440x900 --full --out docs/design/captures/<nom-court>`. Si une capture expire, recharger la page avec `curl` puis recommencer.
3. Lancer le détecteur sur les fichiers de la page : `npx impeccable detect <fichiers ou dossier>`.
4. Lancer l'agent `critique-ui` avec les chemins des captures, les fichiers de la page et la sortie du détecteur.
5. Rendre au user la liste fusionnée des corrections (sans doublon), de la plus grave à la moins grave. Corriger ensuite si le user l'a demandé ou si le chantier est en autonomie, puis recapturer pour vérifier.
