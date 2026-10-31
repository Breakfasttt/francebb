---
id: 126
title: Dossier RGPD
epic: E09
app: site
depends_on: [124, 125]
adr: 0007
verify: relecture par le user ; les mentions légales en ligne citent les durées de conservation décidées
---

# 126 — Dossier RGPD

## Pourquoi

Le RGPD demande de tenir un registre de ce qu'on fait des données, et d'informer clairement les membres.

## Action

- Rédiger dans `docs/rgpd/` le registre des traitements : quelles données sont gardées, pourquoi et combien de temps.
- Y indiquer les durées de conservation : journal d'audit 1 an, délai de grâce de 30 jours, résultats de tournoi anonymisés.
- Lister les sous-traitants : Neon, Vercel, Discord, Google, service d'envoi de mails.
- Mettre à jour les mentions légales et la politique de confidentialité du site.
- Préparer une annonce pour le forum et Discord.

## Avancement (31/10)

- Brouillon du registre des traitements écrit : `docs/rgpd/registre.md` (droits du coach, quatre traitements, durées, sous-traitants).
- Décisions du user : l'adresse de contact est réglée par la variable `CONTACT_EMAIL` (`.env`) ; l'éditeur est breakyt ; les emails partent par Resend ; on garde la ligne sur les transferts vers les États-Unis telle que Vercel et Resend la décrivent.
- Journal des emails : 6 mois, durée de référence de la CNIL pour les journaux techniques. `apps/site/lib/mail.ts` efface les entrées plus anciennes à chaque envoi.
- Page `/mentions-legales` réécrite : éditeur, hébergement, contenus des membres, puis la politique de confidentialité (responsable, données, finalités, bases légales, durées, destinataires, transferts hors de l'Union européenne, droits, recours auprès de la CNIL, cookies). Seul le texte change : la page garde ses composants et son CSS, que la refonte du site reprendra.
- **Reste à faire** :
  - vérifier la page en taille téléphone, quand le serveur du site est libre (l'autre session l'utilise pour la refonte) ;
  - renseigner `CONTACT_EMAIL` sur Vercel ;
  - publier l'annonce sur le forum et Discord (texte ci-dessous) à la mise en ligne du passeport.

## Annonce proposée (forum et Discord)

> **Nouveau : le passeport Blood Bowl**
>
> Ton compte BBFrance devient ton passeport Blood Bowl : une seule connexion (Discord, Google ou lien par email) pour toutes les applications BBFrance, et un profil de coach commun (pseudo, avatar, NAF, région).
>
> Depuis ton passeport, tu peux :
> - modifier ton profil, qui se met à jour partout ;
> - voir les applications et les appareils qui ont accès à ton compte, et leur retirer cet accès ;
> - télécharger toutes tes données ;
> - supprimer ton compte : tu as 30 jours pour changer d'avis, puis tes données sont effacées dans toutes les applications.
>
> Les mentions légales expliquent ce que nous gardons, pourquoi et combien de temps. Une question sur tes données ? Écris à l'adresse indiquée sur cette page.
