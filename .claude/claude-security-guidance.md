# Règles de sécurité propres à BBFrance

Lu par le plugin `security-guidance` à chaque revue (commit et push). Pas de secret ici.

- **Toute action serveur (`"use server"`) et toute route `app/api/**/route.ts`** qui lit des données privées ou écrit en base commence par `getActiveSession()` (`apps/site/lib/authGuard.ts`), qui refuse aussi les membres bannis. Une lecture publique doit être explicitement publique et ne renvoyer que des champs publics.
- **Droits** : par `apps/site/lib/roles.ts` (puissance des rôles), `forumRights.ts`, `forumAccess.ts` (toute requête du forum passe par `forumAccessWhere` / `topicAccessWhere`), `tournamentRights.ts`. Jamais de rôle lu depuis le navigateur.
- **Entrées** : vérifier type, longueur et bornes de chaque champ reçu côté serveur (pas de bibliothèque de schémas pour l'instant). Un nombre négatif, une liste incomplète ou un identifiant d'un autre membre sont des attaques classiques ici (audit du 04/11/2026).
- **HTML** : le contenu des membres ne devient du HTML que par `apps/site/lib/bbcode.ts` (échappement puis BBCode) ou `lib/htmlEscape.ts`. Tout nouveau `dangerouslySetInnerHTML` hors de ces sorties est un défaut.
- **Emails** : le client `prisma` par défaut ne renvoie jamais les emails ; `prismaWithEmail` est réservé à la connexion et aux mails.
- **Envoi d'images** : passer par `app/imageUploadActions.ts` (type réel vérifié, 4 Mo au plus).
- **Pas de limite de débit** aujourd'hui : signaler toute nouvelle action qui envoie un email ou crée du contenu en masse.
- **Développement** : `debugActions.ts`, `dev-login` et la création de SUPERADMIN ne doivent fonctionner qu'avec `NODE_ENV=development`.
