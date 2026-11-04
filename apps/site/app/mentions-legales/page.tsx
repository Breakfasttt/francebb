import React from 'react';
import { Metadata } from 'next';
import PageHeader from '@/common/components/PageHeader/PageHeader';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import './page.css';
import './page-mobile.css';

/**
 * Mentions légales et politique de confidentialité du site BBFrance (carte 126).
 * Le texte suit le registre des traitements (docs/rgpd/registre.md) : toute nouvelle donnée collectée, ou toute
 * durée de conservation modifiée, se reporte dans les deux. L’adresse de contact vient de la variable CONTACT_EMAIL.
 */

export const metadata: Metadata = {
  title: 'Mentions légales et confidentialité - BBFrance',
  description: 'Éditeur, hébergement, données personnelles et droits des membres de BBFrance.',
};

/** Date de la dernière modification du texte, à changer à chaque mise à jour. */
const LAST_UPDATE = '31 octobre 2026';

export default function MentionsLegalesPage() {
  const contact = process.env.CONTACT_EMAIL;
  const contactLink = contact ? <a href={`mailto:${contact}`}>{contact}</a> : <strong>adresse de contact non configurée</strong>;

  return (
    <div className="mentions-page-wrapper">
      <PageHeader
        title="Mentions légales"
        subtitle="Qui publie le site, et ce que nous faisons de tes données"
      />

      <main className="container mentions-container">
        <div className="mentions-grid">
          <PremiumCard className="mentions-section">
            <h2>1. Éditeur du site</h2>
            <p>
              BBFrance est un site communautaire consacré au jeu Blood Bowl, édité <strong>à titre non professionnel et bénévole</strong> par
              <strong> breakyt</strong>. Conformément à la loi pour la confiance dans l’économie numérique, l’identité de l’éditeur a été
              communiquée à l’hébergeur.
            </p>
            <p><strong>Directeur de la publication :</strong> breakyt.</p>
            <p><strong>Contact :</strong> {contactLink}</p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>2. Hébergement</h2>
            <p>
              Le site et le passeport Blood Bowl sont hébergés par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina,
              CA 91723, États-Unis (<a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>).
            </p>
            <p>Les bases de données sont hébergées par <strong>Neon</strong>, sur des serveurs situés à Francfort (Allemagne).</p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>3. Code source et propriété intellectuelle</h2>
            <p>
              Le code du site est ouvert et publié sur <a href="https://github.com/Breakfasttt/francebb" target="_blank" rel="noopener noreferrer">GitHub</a> sous
              licence <strong>MIT</strong>.
            </p>
            <p>
              <strong>Blood Bowl</strong> est une marque déposée de <strong>Games Workshop Limited</strong>. Les noms, logos et termes propres au
              jeu appartiennent à Games Workshop. BBFrance est un site de fans, à but non lucratif, sans lien officiel avec Games Workshop.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>4. Contenus publiés par les membres</h2>
            <p>
              Les messages, articles et ressources publiés par les membres restent sous la responsabilité de leurs auteurs. Pour
              signaler un contenu illicite, utilise le bouton de signalement du forum ou écris à {contactLink}. L’équipe de
              modération retire un contenu manifestement illicite dès qu’elle en a connaissance.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section" id="confidentialite">
            <h2>5. Tes données : qui en est responsable</h2>
            <p>
              Le responsable de tes données est <strong>breakyt</strong>, éditeur bénévole de BBFrance. Pour toute question ou demande
              sur tes données : {contactLink}.
            </p>
            <p>
              Ton compte BBFrance s’appelle le <strong>passeport Blood Bowl</strong>. Tu te connectes une seule fois, avec Discord,
              Google ou un lien envoyé par email, et le passeport te reconnaît dans toutes les applications BBFrance. Il garde ton
              profil de coach commun : pseudo, avatar, numéro NAF (déclaré par toi, jamais vérifié), région, langue et fuseau horaire.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>6. Quelles données, pourquoi, combien de temps</h2>
            <ul>
              <li>
                <strong>Email, pseudo, avatar, profil de coach, moyens de connexion</strong> : pour te connecter et t’identifier dans
                les applications BBFrance. Base légale : le service que tu demandes en t’inscrivant. Gardés tant que ton compte existe.
              </li>
              <li>
                <strong>Sessions de connexion</strong> (adresse IP, navigateur) : pour te garder connecté et te montrer tes appareils.
                Base légale : le service demandé. Gardées jusqu’à l’expiration de la session.
              </li>
              <li>
                <strong>Journal de sécurité</strong> (actions, avec une empreinte de l’identifiant et de l’adresse IP, jamais en clair) :
                pour repérer une attaque ou un abus. Base légale : intérêt légitime, la sécurité du service. Gardé 1 an.
              </li>
              <li>
                <strong>Contributions et activité sur le site</strong> (messages, sujets, articles, messages privés, inscriptions et
                résultats de tournoi, réglages) : pour faire fonctionner le forum, les tournois et les autres services.
                Base légale : le service demandé. Gardées tant que ton compte existe.
              </li>
              <li>
                <strong>Journal des emails envoyés</strong> (adresse, date, objet) : pour vérifier qu’un email est bien parti. Base
                légale : intérêt légitime, le bon fonctionnement du service. Gardé 6 mois.
              </li>
            </ul>
            <p>
              <strong>Quand tu supprimes ton compte</strong>, tes données personnelles sont effacées dans toutes les applications
              BBFrance, 30 jours après ta demande (tu peux changer d’avis d’ici là). Tes contributions publiques restent visibles sous
              un nom anonyme (« Coach Inconnu », ou « Coach anonyme » dans les résultats de tournoi), pour ne pas casser les
              discussions et l’historique sportif de la communauté. Ton pseudo est réservé pour ne pas être repris : seule son
              empreinte est gardée, et elle ne permet pas de le retrouver.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>7. Qui reçoit tes données</h2>
            <ul>
              <li>Les applications BBFrance auxquelles tu te connectes.</li>
              <li>
                Une application d’un autre éditeur, seulement si tu l’as autorisée sur l’écran de consentement. Elle ne reçoit jamais
                ton email, et tu peux lui retirer l’accès à tout moment depuis ton passeport.
              </li>
              <li>
                Nos prestataires techniques, qui ne les utilisent que pour nous rendre service : Vercel (hébergement), Neon (bases
                de données, en Allemagne), Resend (envoi des emails), et Discord ou Google seulement si tu choisis de te connecter
                avec eux.
              </li>
            </ul>
            <p>Aucune donnée n’est vendue ni utilisée pour de la publicité.</p>
            <p>
              <strong>Transfert hors de l’Union européenne :</strong> Vercel et Resend sont des sociétés américaines, et tes données
              peuvent passer par leurs serveurs aux États-Unis. Ces transferts sont encadrés par les clauses contractuelles types de
              la Commission européenne, intégrées à leurs contrats de traitement des données, et ces deux sociétés adhèrent au cadre
              de protection des données UE–États-Unis (Data Privacy Framework).
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>8. Tes droits</h2>
            <ul>
              <li><strong>Recevoir une copie de tes données</strong> : bouton « Télécharger mes données » de ton passeport.</li>
              <li><strong>Les corriger</strong> : section « Profil » de ton passeport, ou ton profil sur le site.</li>
              <li><strong>Les effacer</strong> : bouton « Supprimer mon compte » de ton passeport.</li>
              <li><strong>Retirer l’accès d’une application</strong> : section « Applications liées » de ton passeport.</li>
              <li><strong>T’opposer à un traitement ou en demander la limitation</strong> : écris à {contactLink}.</li>
            </ul>
            <p>
              Nous répondons dans un délai d’un mois. Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une
              réclamation à la CNIL : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">cnil.fr/plaintes</a>.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>9. Cookies</h2>
            <p>
              Le site et le passeport n’utilisent que des cookies nécessaires à leur fonctionnement : garder ta session ouverte,
              protéger les formulaires, retenir ton thème. Ces cookies sont dispensés de consentement. Aucun cookie de mesure
              d’audience ni de publicité.
            </p>
          </PremiumCard>

          <PremiumCard className="mentions-section">
            <h2>10. Limitation de responsabilité</h2>
            <p>
              L’équipe BBFrance s’efforce de publier des informations exactes, mais ne peut être tenue pour responsable des erreurs
              ou omissions, ni des dommages résultant de l’utilisation du site.
            </p>
          </PremiumCard>
        </div>

        <div className="mentions-footer">
          <p>Dernière mise à jour : {LAST_UPDATE}</p>
          <p><em>« Sur le terrain, tout est permis. Dans la loi, on suit les règles de Nuffle. »</em></p>
        </div>
      </main>
    </div>
  );
}
