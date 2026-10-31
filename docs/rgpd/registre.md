# Registre des traitements de données personnelles

> Ce document tient le registre demandé par le RGPD (règlement européen sur la protection des données) : quelles données BBFrance garde sur les coachs, pourquoi, combien de temps, et qui y a accès. Il est à relire par le responsable du projet et à tenir à jour à chaque nouvelle donnée collectée. Décision d'origine : ADR-0007 (passeport Blood Bowl). Brouillon de la carte 126.

## Responsable du traitement

BBFrance, site communautaire de Blood Bowl. Contact pour exercer ses droits : *(adresse à compléter par le responsable du projet)*.

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
| But | Forum, tournois, articles, ligues, messagerie, BBQuizz, BBScheme. |
| Base légale | Exécution du service demandé par le coach. |
| Données | Copie du profil du passeport ; réglages propres au site (thème, signature, notifications, équipe, ligues) ; contributions (sujets, messages, articles, ressources) ; messages privés ; inscriptions et résultats de tournoi ; scores du quiz. |
| Durée | Tant que le compte existe. |
| Après suppression | Données privées effacées. Contributions publiques gardées sous le nom « Coach Inconnu » ; résultats et matchs de tournoi gardés sous le nom « Coach anonyme », sans NAF (intérêt légitime : l'historique sportif de la communauté). |

## Traitement 4 : emails envoyés

| Point | Contenu |
|---|---|
| But | Liens de connexion, notifications, messages sur la suppression du compte. |
| Données | Adresse email, date, objet du message (journal des envois du site). |
| Durée | Effacé avec le compte. *(Durée maximale du journal des envois à décider.)* |

## Sous-traitants

| Service | Rôle | Données concernées |
|---|---|---|
| Neon | Hébergement des bases Postgres du hub et du site | Toutes |
| Vercel | Hébergement des applications | Toutes, en transit ; journaux techniques |
| Discord, Google | Connexion avec un compte existant, au choix du coach | Identifiant, pseudo, email, avatar transmis par le fournisseur |
| Service d'envoi d'emails (SMTP) | Envoi des emails | Adresse email, contenu du message |

## Points à trancher par le responsable du projet

1. L'adresse de contact pour les demandes RGPD.
2. La durée maximale du journal des envois d'emails du site (proposition : 1 an).
3. Le texte des mentions légales et de la politique de confidentialité du site, à mettre à jour à partir de ce registre (non modifié : texte juridique à valider).
4. L'annonce aux membres (forum, Discord) au moment de la mise en ligne du passeport.
