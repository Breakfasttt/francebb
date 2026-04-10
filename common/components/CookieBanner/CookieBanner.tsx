"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";
import "./CookieBanner.css";
import "./CookieBanner-mobile.css";


/**
 * Composant pour l'affichage du bandeau de consentement aux cookies (RGPD).
 * Apparaît uniquement si l'utilisateur n'a pas encore validé.
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem("bbfrance_cookie_consent");
    if (!consent) {
      // Petit délai pour l'effet d'apparition
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner-container">
        <div className="cookie-banner-content">
          <div className="cookie-icon-wrapper">
            <Cookie size={24} className="cookie-icon" />
          </div>
          <div className="cookie-text">
            <h3>Respect de la vie privée</h3>
            <p>
              Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement 
              (authentification, thèmes). Aucune donnée n'est revendue à des tiers. 
              En savoir plus sur nos <Link href="/mentions-legales" className="cookie-link">mentions légales</Link>.
            </p>
          </div>
        </div>
        <div className="cookie-banner-actions">
           <button onClick={handleAccept} className="cookie-btn-primary">
             <Check size={16} /> 
             <span>Accepter</span>
           </button>
           <button onClick={() => setIsVisible(false)} className="cookie-btn-close" title="Fermer pour cette session">
             <X size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
