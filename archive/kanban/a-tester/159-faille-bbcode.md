---
id: 159
title: "Fermer la faille d'injection de script du BBCode"
epic: E10
app: site
depends_on: []
verify: "les formules piégées de l'audit (balise de couleur dans une image, une galerie, un lien ou une citation) ne produisent plus aucun attribut actif ; un test automatique le vérifie ; une politique de sécurité du contenu est envoyée par le site ; le script de recherche des messages piégés tourne sur la base locale"
---

# 159 — Fermer la faille d'injection de script du BBCode

## Pourquoi

En plaçant une balise `[color]` à l'intérieur d'une balise `[img]`, `[gallery]`, `[url]` ou `[quote=…]`, un membre peut cacher un programme qui s'exécute chez chaque lecteur, avec ses droits (audit, section 2.1). La faille a été reproduite.

## Action

1. Dans `lib/bbcode.ts` : les valeurs recopiées dans un attribut (adresse d'image, de galerie, de lien, identifiants de citation et de schéma) ne peuvent plus contenir de balise HTML, de guillemet ni de chevron ; la galerie passe par `sanitizeUrl` ; la couleur n'accepte que des noms, des codes `#` et des `rgb()` composés de chiffres.
2. Les spoilers n'utilisent plus d'attribut `onclick` écrit dans le HTML, mais un écouteur unique dans `BBCodeContent`.
3. Ajouter une politique de sécurité du contenu (en-tête `Content-Security-Policy`) dans `next.config.ts`, compatible avec les images externes, YouTube, Twitch et le mode développement.
4. Un test unitaire (sans navigateur) qui passe les formules piégées dans `parseBBCode` et vérifie qu'aucun attribut `on…` ni `javascript:` n'apparaît.
5. Un script ponctuel `apps/site/scripts/find-trapped-bbcode.ts` qui cherche les messages, signatures, messages privés, ligues et articles piégés. Décision du responsable : les messages trouvés sont supprimés de la base. Le script les liste par défaut et ne les supprime qu'avec l'option `--apply`. En production, il est lancé par le responsable ou avec son accord, après une sauvegarde.

## Résultat

- `lib/bbcode.ts` : les balises qui recopient une valeur dans un attribut (image, galerie, lien, citation, schéma) refusent toute valeur contenant du HTML produit par une autre balise ; `rgb()` et `hsl()` n'acceptent plus que des chiffres ; plus aucun `onclick` dans le HTML produit.
- `common/components/BBCodeContent/BBCodeInteractions.tsx` : un seul écouteur pour ouvrir et refermer les spoilers, monté dans `app/layout.tsx`.
- `proxy.ts` : politique de sécurité du contenu avec une clé à usage unique par visite (nonce). Vérifié dans un navigateur : six pages sans erreur, panneau « Plus » fonctionnel, spoilers fonctionnels, et un `<img onerror>` inséré dans la page est bloqué.
- `tests/unit/bbcode.test.mjs` : 16 tests (formules piégées de l'audit et variantes) ; ils échouent sur l'ancien code (7 échecs) et passent sur le nouveau. Lancés par `pnpm test:unit` et par `pnpm check`.
- `scripts/find-trapped-bbcode.mjs` : liste les textes piégés en base, les supprime avec `--apply`. Base locale : aucun texte trouvé. **À lancer en production par le responsable**, après une branche Neon de sauvegarde, puis à supprimer du dépôt.
- Pas d'outil de nettoyage HTML ajouté (DOMPurify) : la correction à la source et la politique de sécurité suffisent, sans nouvelle bibliothèque.
- Découvert au passage : `prisma/generated-client/` contient encore d'anciens fichiers `.ts` générés pour SQLite, suivis par git. L'outil `tsx` les prend à la place des bons fichiers `.js`, ce qui casse les scripts lancés avec `tsx` qui importent le client. À nettoyer dans une carte à part.
