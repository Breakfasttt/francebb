---
id: 141
title: "Ressources : accès visiteur, lien, clé ImgBB"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un visiteur qui ouvre /ressources/submit est envoyé vers la connexion ; un lien de ressource qui n'est pas en http(s) est refusé par le serveur ; la clé ImgBB n'apparaît plus dans le code envoyé au navigateur ; tests e2e
---

# 141 — Ressources : accès visiteur, lien, clé ImgBB

## Pourquoi

Trois défauts trouvés pendant la refonte (carte 096) :

- `/ressources/submit` et le bouton « Soumettre une ressource » sont ouverts aux visiteurs non connectés : l'envoi n'est refusé qu'à la fin, après avoir rempli tout le formulaire.
- Le lien d'une ressource n'est pas contrôlé côté serveur : on peut enregistrer une adresse qui n'est pas un lien web, par exemple `javascript:…`, qui s'exécuterait au clic (faille d'injection de code).
- La clé du service d'hébergement d'images ImgBB est publique, c'est-à-dire lisible dans le code envoyé au navigateur : n'importe qui peut l'utiliser pour envoyer des images sur le compte du site. Le même envoi sert aux avatars, aux blasons et aux images des articles.

Le deuxième et le troisième point touchent la sécurité : à traiter en premier parmi les cartes de bugs, une fois la refonte (épic E08) terminée.

## Action

- Rediriger les visiteurs de `/ressources/submit` vers la connexion (avec `callbackUrl`) et masquer le bouton pour eux.
- Dans les actions serveur des ressources, n'accepter que les liens `http://` et `https://` (et les adresses internes du site pour les outils officiels).
- Faire passer l'envoi d'images par une route du serveur qui garde la clé ImgBB secrète (variable d'environnement), puis changer la clé chez ImgBB. Mettre à jour `DEPLOY.md`.
- Retirer au passage les 5 types `any` restants de `apps/site/app/ressources/actions.ts`.
- Ajouter les tests dans `apps/site/tests/e2e/security.spec.ts`.

## Résultat

Ce qui a été fait :

- **Accès des visiteurs** : `/ressources/submit` envoie un visiteur non connecté vers `/auth/login?callbackUrl=%2Fressources%2Fsubmit`, avant qu'il remplisse le formulaire. Le bouton « Soumettre une ressource » (en-tête et liste vide) n'est montré qu'aux membres connectés. L'action `submitResource` refuse toujours, elle aussi, l'envoi d'un visiteur.
- **Lien d'une ressource** : `submitResource`, `updateResourceAction` et `moderateResource` (modification par un modérateur) n'acceptent qu'un lien en `http://` ou `https://`, de 2 000 caractères au plus. Une adresse interne du site (qui commence par une seule barre oblique, comme `/bbscheme`) n'est acceptée que pour un outil officiel. L'adresse de l'image est contrôlée de la même façon (vide, `http(s)://` ou image du site). `//autre-site.fr` est refusé, car le navigateur le comprend comme un lien vers un autre site. `updateResourceAction` vérifie aussi la limite de 200 caractères de la description, comme `submitResource`.
- **Clé ImgBB** : tous les envois d'images (avatars de l'inscription et du profil, blasons de ligue, images de l'éditeur BBCode des messages et des articles, images des ressources) passent par l'action serveur `uploadImage` (`apps/site/app/imageUploadActions.ts`), appelée depuis le navigateur par `uploadImageFile` (`apps/site/common/utils/imageUpload.ts`). L'action refuse les visiteurs et les bannis, les fichiers de plus de 4 Mo, et tout fichier qui n'est pas une vraie image PNG, JPEG, GIF ou WebP (le format est reconnu par les premiers octets du fichier, pas par le type annoncé par le navigateur). La clé est lue dans la variable `IMGBB_API_KEY`, sans préfixe `NEXT_PUBLIC_` : elle n'est plus dans le code envoyé au navigateur. `lib/siteConfig.ts` ne contient plus la clé.
- La limite d'envoi des actions serveur passe de 1 Mo à 4,5 Mo (`serverActions.bodySizeLimit` dans `apps/site/next.config.ts`), pour accepter une photo de téléphone ; 4,5 Mo est la limite de Vercel.
- Les 5 types `any` de `apps/site/app/ressources/actions.ts` sont retirés.
- Pour les tests, la variable `E2E_FAKE_IMAGE_UPLOAD=1` (ajoutée à `playwright.config.ts`) fait renvoyer une adresse factice sans appeler ImgBB ; elle n'a d'effet qu'avec `next dev`. Le test `inventaire/forum-editeur.spec.ts` simulait ImgBB dans le navigateur (`page.route`) : il attend maintenant l'adresse factice du serveur.

Fichiers créés : `apps/site/app/imageUploadActions.ts`, `apps/site/common/utils/imageUpload.ts`, `apps/site/common/utils/imageUploadLimits.ts`.
Fichiers modifiés : `apps/site/app/ressources/actions.ts`, `apps/site/app/ressources/page.tsx`, `apps/site/app/ressources/submit/page.tsx`, `apps/site/app/ressources/component/ResourceForm.tsx`, `apps/site/app/ligues/component/LigueBlasonUpload.tsx`, `apps/site/app/profile/component/ProfileEdit.tsx`, `apps/site/app/auth/onboarding/OnboardingForm.tsx`, `apps/site/common/components/BBCodeEditor/BBCodeEditor.tsx`, `apps/site/lib/siteConfig.ts`, `apps/site/next.config.ts`, `apps/site/playwright.config.ts`, `apps/site/.env.example`, `apps/site/tests/e2e/inventaire/forum-editeur.spec.ts`, `apps/site/tests/e2e/security.spec.ts`, `DEPLOY.md`, `docs/features/ressources-media/README.md`, `docs/features/ligues-carte/README.md`, `docs/GLOSSAIRE.md`, `.claude/skills/reuse-first/SKILL.md`.

Tests écrits dans `apps/site/tests/e2e/security.spec.ts` (groupe « Carte 141 ») : visiteur renvoyé vers la connexion et bouton caché ; aucune trace de la clé ni de l'adresse d'ImgBB dans le code et dans les scripts reçus par le navigateur ; fichier déguisé en image refusé, vraie image acceptée, sans appel du navigateur à ImgBB ; lien `javascript:` glissé dans la requête et refusé par le serveur.

**À faire par le responsable** (détails dans `DEPLOY.md`, section « Clé ImgBB gardée par le serveur ») : l'ancienne clé a été publique, il faut **en créer une nouvelle chez ImgBB et supprimer l'ancienne**, renseigner `IMGBB_API_KEY` sur Vercel, supprimer `NEXT_PUBLIC_IMGBB_API_KEY`, redéployer ; en local, renommer la variable dans `apps/site/.env`.

À essayer à la main, sur téléphone : envoyer une photo de la galerie comme avatar (profil), comme blason (ligue), dans un message du forum et comme image d'une ressource ; essayer une photo de plus de 4 Mo (message « L'image est trop lourde ») ; ouvrir `/ressources/submit` déconnecté.
