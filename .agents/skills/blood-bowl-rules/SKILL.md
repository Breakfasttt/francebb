---
name: blood-bowl-rules
description: Guide pour consulter les règles de Blood Bowl (LRB/Saison 3) et les ressources communautaires.
---

# 🏈 Blood Bowl Rules & Reference Skill

Ce skill est une aide à la décision et à la recherche pour tout ce qui concerne les règles du jeu Blood Bowl, son historique en France et ses ressources communautaires.

## 📚 Ressources Internes (Règles Locales)

Le projet contient une copie texte des règles en cours (LRB Saison 3) :
- **Chemin** : `public/data/docs/lrb_s3.txt`
- **Méthode de recherche** : Utiliser `grep_search` ou `view_file` sur ce fichier pour répondre aux questions techniques sur les compétences, les rosters ou les séquences de jeu.

## 🌐 Ressources Externes Officielles & Communautaires

Pour des informations à jour sur les tournois, les classements mondiaux ou les archives :

### 1. NAF (Nuffle Amateurs Federation)
- **URL** : [https://www.thenaf.net/](https://www.thenaf.net/)
- **Usage** : Classement mondial, numéros NAF, règles de tournois officiels, variantes de jeu.

### 2. Archives FranceBB (Team France BB)
- **Forum Historique** : [https://teamfrancebb.1fr1.net/](https://teamfrancebb.1fr1.net/) (Source majeure pour l'historique de la communauté française).
- **Ancien Site** : [https://www.teamfrancebb.fr/](https://www.teamfrancebb.fr/)

### 3. Mordorbihan
- **URL** : [https://mordorbihan.fr/](https://mordorbihan.fr/)
- **Usage** : Un des sites de référence francophones pour les guides stratégiques, les aides de jeu et les résumés de règles.

## 🧠 Instructions pour l'Agent

1. **Priorité aux règles locales** : Si l'utilisateur pose une question technique sur une règle, commence par chercher dans `public/data/docs/lrb_s3.txt`.
2. **Recherche Sémantique** : Si la règle n'est pas claire dans le fichier texte, utilise `search_web` sur Mordorbihan ou la NAF en priorité.
3. **Rédaction de guides** : Lors de la rédaction de tutoriels (ex: pour la page `/jouer`), utilise ces sources pour garantir l'exactitude des termes techniques (Poussée, Esquive, Turnover, etc.).
4. **Correction de bugs** : Si une logique métier (ex: simulateur de jets) semble incorrecte, vérifie les probabilités et les règles dans ces ressources.
