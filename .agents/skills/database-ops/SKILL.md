# Skill : Opérations Base de Données (Turso + Prisma 7)

Ce skill définit la procédure **validée et sécurisée** pour maintenir la base de données de production sur Turso sans risque de corruption ou de doublons.

## 🛡️ RÈGLES DE SÉCURITÉ ABSOLUES
1. **PAS DE `migrate dev`** : Turso ne supporte pas la "Shadow DB". Ne jamais utiliser cette commande.
2. **PAS DE `migrate reset`** : Ne jamais réinitialiser la base de production.
3. **PROTOCOLE** : Toujours utiliser `libsql://` dans le `.env`. Ne pas essayer de convertir en `https://`.

## 🚀 PROCÉDURES VALIDÉES

### 1. Mise à jour de la Structure (Schéma)
Pour ajouter des tables ou modifier des colonnes :
```powershell
npx prisma db push
```
*Note : Si le client Prisma n'est pas à jour après le push, lance `npx prisma generate`.*

### 2. Synchronisation de Données (Massive/Automatisée)
Pour injecter ou mettre à jour des données depuis des fichiers `.ts` (ex: Quizz, Références) :
- **Méthode** : Utiliser un script basé sur `@libsql/client` pour une connexion SQL directe.
- **Scripts existants** :
  - `scripts/seed-turso-final.ts` : Données de référence (Régions, Départements).
  - `scripts/sync-quiz-final.ts` : Synchronisation intelligente du Quizz (évite les doublons).

**Modèle de code pour nouveau script (Smart Sync) :**
Toujours récupérer les IDs existants par une clé unique (ex: le texte ou un slug) avant d'insérer, pour faire un `UPDATE` au lieu d'un `INSERT` si la donnée existe déjà.

### 3. Modifications Manuelles Ponctuelle
Pour corriger une donnée rapidement via une interface :
```powershell
npx prisma studio
```

## 🛠️ DÉPANNAGE
- **Erreur "URL invalid"** : Vérifie que `loadEnvConfig(process.cwd())` est bien appelé au début du script `.ts`.
- **Délai de réponse** : Vérifie que la région Vercel est bien réglée sur **Paris (cdg1)** pour être proche de Turso.

---
*Validé le 23 Avril 2026 suite au succès de la synchronisation Quizz (299 questions).*
