import React from 'react';
import { Metadata } from 'next';
import PageHeader from '@/common/components/PageHeader/PageHeader';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import './page.css';

/**
 * Page des Mentions Légales du site BBFrance.
 * Conformément à la législation française.
 */

export const metadata: Metadata = {
  title: 'Mentions Légales - BBFrance',
  description: 'Mentions légales et informations réglementaires du site BBFrance.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="mentions-container">
      <PageHeader 
        title="Mentions Légales" 
        subtitle="Informations réglementaires et respect de la vie privée"
        backHref="/"
        backTitle="Accueil"
      />

      <div className="mentions-grid">
        <PremiumCard className="mentions-section">
          <h2>1. Édition du site</h2>
          <p>
            Le site <strong>BBFrance</strong> (ci-après "le Site") est une plateforme communautaire dédiée au jeu de plateau Blood Bowl.
          </p>
          <p>
            Ce site est un projet passionné, conçu pour faciliter l'organisation de tournois et la mise en relation des joueurs en France.
          </p>
          <p>
            Le code source de la plateforme est ouvert et disponible sur <a href="https://github.com/Breakfasttt/francebb" target="_blank" rel="noopener noreferrer">GitHub</a> sous licence **MIT**. Toute réutilisation doit mentionner l'auteur original.
          </p>
          <p>
            <strong>Responsable de la publication :</strong> L'équipe BBFrance.
          </p>
        </PremiumCard>

        <PremiumCard className="mentions-section">
          <h2>2. Hébergement</h2>
          <p>
            Le Site est hébergé par la société <strong>Vercel Inc.</strong>
          </p>
          <p>
            Siège social : 440 N Barranca Ave #4133 Covina, CA 91723.
          </p>
          <p>
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
        </PremiumCard>

        <PremiumCard className="mentions-section">
          <h2>3. Propriété Intellectuelle</h2>
          <p>
            <strong>Blood Bowl</strong> est une marque déposée de <strong>Games Workshop Limited</strong>. 
            Tous les logos, noms de races, personnages et termes spécifiques au jeu sont la propriété exclusive de Games Workshop.
          </p>
          <p>
            Le Site n'est en aucun cas affilié officiellement à Games Workshop. Il s'agit d'un site à but non lucratif créé par des fans pour des fans.
          </p>
          <p>
            Les illustrations générées par intelligence artificielle sur ce site sont utilisées pour enrichir l'expérience utilisateur et demeurent la propriété de leurs créateurs respectifs au sein de la communauté BBFrance.
          </p>
        </PremiumCard>

        <PremiumCard className="mentions-section">
          <h2>4. Données Personnelles (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
          </p>
          <p>
            Les données collectées (pseudonyme, email, ligue, localisation) sont exclusivement utilisées pour le fonctionnement du Site :
          </p>
          <ul>
            <li>Gestion de votre compte coach</li>
            <li>Inscription aux tournois</li>
            <li>Messagerie privée entre membres</li>
            <li>Affichage sur la carte communautaire</li>
          </ul>
          <p>
            Aucune donnée n'est cédée ou vendue à des tiers.
          </p>
        </PremiumCard>

        <PremiumCard className="mentions-section">
          <h2>5. Cookies</h2>
          <p>
            Le Site utilise uniquement des cookies techniques nécessaires à votre authentification et à votre navigation. 
            Aucun cookie de suivi publicitaire n'est utilisé.
          </p>
        </PremiumCard>

        <PremiumCard className="mentions-section">
          <h2>6. Limitation de responsabilité</h2>
          <p>
            L'équipe BBFrance s'efforce d'assurer l'exactitude des informations diffusées sur le Site. 
            Toutefois, elle ne saurait être tenue pour responsable des erreurs ou omissions, ni des dommages directs ou indirects résultant de l'accès ou de l'utilisation du Site.
          </p>
        </PremiumCard>
      </div>
      
      <div className="mentions-footer">
        <p>Dernière mise à jour : 7 Avril 2026</p>
        <p><em>"Sur le terrain, tout est permis. Dans la loi, on suit les règles de Nuffle."</em></p>
      </div>
    </div>
  );
}
