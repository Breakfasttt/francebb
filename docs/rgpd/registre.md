# Registre des traitements de données personnelles

> Ce document tient le registre demandé par le RGPD (règlement européen sur la protection des données) : quelles données BBFrance garde sur les coachs, pourquoi, combien de temps, et qui y a accès. Il est à relire par le responsable du projet et à tenir à jour à chaque nouvelle donnée collectée. Décision d'origine : ADR-0007 (passeport Blood Bowl). Brouillon de la carte 126.

## Responsable du traitement

BBFrance, site communautaire de Blood Bowl, édité à titre non professionnel et bénévole par **breakyt**. Contact pour exercer ses droits : l'adresse de la variable d'environnement `CONTACT_EMAIL` du site, affichée dans les mentions légales (`apps/site/app/mentions-legales/page.tsx`).

## Les droits du coach et où les exercer

| Droit | Où | Comment ça marche |
|---|---|---|
| Accès et portabilité (recevoir ses données) | Passeport Blood Bowl, « Télécharger mes données » | Un fichier JSON avec les données du hub et celles de chaque application BBFrance (carte 125). |
| Rectification | Passeport, section « Profil », ou profil du site | Le pseudo, l'avatar, le NAF et la région se modifient au passeport ; le site les reçoit. |
| Effacement | Passeport, « Supprimer mon compte » | 30 jours pour changer d'avis, puis effacement dans toutes les applications (carte 123). |
| Retrait d'un accès donné à une application | Passeport, « Applications liées » | L'application perd ses jetons et doit redemander la connexion. |

## Traitement 1 : le passeport Blood Bowl (hub de connexion)

| Point | Contenu |
|---|---|
| But | Permettre au coach de se connecter une fois à toutes les applications BBFrance, et garder son profil commun. |
| Base légale | Exécution du service demandé par le coach (inscription). |
| Données | Email, pseudo, avatar, numéro NAF (déclaré par le coach, jamais vérifié), région, langue, fuseau horaire, date d'inscription ; moyens de connexion (Discord, Google, email), avec leurs jetons chiffrés ; sessions (adresse IP, navigateur). |
| Durée | Tant que le compte existe. Sessions et liens de connexion : effacés à leur expiration (purge chaque nuit). |
| Après suppression | Rien, sauf l'empreinte du pseudo (pour qu'il ne soit pas repris) et, pour un compte banni, l'empreinte de son email (pour qu'il ne revienne pas). Une empreinte ne permet pas de retrouver le pseudo ni l'email. |
| Destinataires | Les applications BBFrance auxquelles le coach se connecte ; une application tierce seulement après son accord, et jamais son email. |

## Traitement 2 : sécurité du hub

| Point | Contenu |
|---|---|
| But | Repérer et comprendre une attaque ou un abus (connexions, modifications, bannissements, suppressions, exports). |
| Base légale | Intérêt légitime (sécurité du service). |
| Données | Action, date, empreinte de l'identifiant et de l'adresse IP (jamais en clair). Compteurs de la limite de requêtes. |
| Durée | Journal d'audit : 1 an. Compteurs : 1 jour sans activité. |

## Traitement 3 : le site BBFrance

| Point | Contenu |
|---|---|
| But | Forum, tournois, articles, ligues, messagerie, BBScheme. |
| Base légale | Exécution du service demandé par le coach. |
| Données | Copie du profil du passeport ; réglages propres au site (thème, signature, notifications, équipe, ligues) ; contributions (sujets, messages, articles, ressources) ; messages privés ; inscriptions et résultats de tournoi. Depuis la carte 180, les parties et les scores du quiz BBQuizz ne sont plus dans la base du site mais dans celle de l'application BBQuizz, en attente : leur effacement à la suppression du compte et leur export seront branchés à sa relance. |
| Durée | Tant que le compte existe. |
| Après suppression | Données privées effacées. Contributions publiques gardées sous le nom « Coach Inconnu » ; résultats et matchs de tournoi gardés sous le nom « Coach anonyme », sans NAF (intérêt légitime : l'historique sportif de la communauté). |

## Traitement 4 : emails envoyés

| Point | Contenu |
|---|---|
| But | Liens de connexion, notifications, messages sur la suppression du compte. |
| Données | Adresse email, date, objet du message (journal des envois du site). |
| Base légale | Intérêt légitime : vérifier qu'un email est bien parti, éviter les envois en double. |
| Durée | 6 mois, et effacé plus tôt si le compte est supprimé. C'est la durée de référence recommandée par la CNIL pour les journaux techniques (recommandation sur la journalisation de 2021). Il n'existe pas de durée légale minimale. |

## Sous-traitants

| Service | Rôle | Données concernées |
|---|---|---|
| Neon | Hébergement des bases Postgres du hub et du site | Toutes |
| Vercel | Hébergement des applications | Toutes, en transit ; journaux techniques |
| Discord, Google | Connexion avec un compte existant, au choix du coach | Identifiant, pseudo, email, avatar transmis par le fournisseur |
| Resend | Envoi des emails | Adresse email, contenu du message |

**Transferts hors de l'Union européenne** : Vercel et Resend sont des sociétés américaines. Leurs contrats de traitement des données intègrent les clauses contractuelles types de la Commission européenne, et les deux adhèrent au cadre de protection des données UE–États-Unis (Data Privacy Framework). Neon héberge les bases à Francfort (Allemagne).

## Décisions (31/10/2026)

1. L'adresse de contact est réglée par la variable `CONTACT_EMAIL`, pour pouvoir la changer sans toucher au code.
2. Le journal des envois d'emails est gardé 6 mois, la durée de référence de la CNIL pour les journaux techniques (il n'existe pas de durée légale minimale). Chaque envoi efface les entrées plus anciennes (`apps/site/lib/mail.ts`).
3. Les mentions légales et la politique de confidentialité sont réunies sur la page `/mentions-legales` du site.

## Reste à faire

- L'annonce aux membres (forum, Discord) au moment de la mise en ligne du passeport.
