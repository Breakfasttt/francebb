# Nom de la fonctionnalité

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Ce que la fonctionnalité apporte aux coachs, en 2 ou 3 phrases.

## Ce que voit le coach

- Les pages concernées, avec leur adresse (ex. `/forum`), et ce qu'on peut y faire.
- Qui y a accès : visiteur, membre connecté, modérateur, admin.
- **Sur téléphone** : ce qui change par rapport à l'ordinateur (contenu envoyé dans le panneau « Plus », bouton « Filtres », écran plein écran, version simplifiée…), et les problèmes connus.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/…/page.tsx` | … |

Fonctions que le reste du code peut appeler (actions serveur, composants) : les citer ici, avec leur fichier.

## Les pièges

Règles qui ne doivent jamais casser (sécurité, données, performance) et erreurs déjà commises. Exemple : « toute requête passe par `lib/forumAccess.ts` ».

## Les mots expliqués

| Mot | Sens |
|---|---|
| … | … |

Les termes généraux du projet sont dans `docs/GLOSSAIRE.md` ; ici, seulement ceux propres à cette fonctionnalité.

## Interactions

Ce que cette fonctionnalité change ailleurs sur le site, et ce dont elle dépend (carte 221). Une ligne par lien, vérifiée dans le code. La vue d'ensemble et le tableau des droits par rôle sont dans `docs/features/INTERACTIONS.md`.

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| … | … | … |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| … | … | … |

## État

Ce qui marche, ce qui manque, gros chantiers en cours (kanban).
