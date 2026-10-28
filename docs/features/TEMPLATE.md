# Nom de la fonctionnalité

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Ce que la fonctionnalité apporte aux coachs, en 2 ou 3 phrases.

## Ce que voit le coach

- Les pages concernées, avec leur adresse (ex. `/forum`), et ce qu'on peut y faire.
- Qui y a accès : visiteur, membre connecté, modérateur, admin.
- **Sur téléphone** : ce qui change par rapport à l'ordinateur (menu latéral, bouton de filtres, version simplifiée…), et les problèmes connus.

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

## État

Ce qui marche, ce qui manque, cartes du kanban en cours.
