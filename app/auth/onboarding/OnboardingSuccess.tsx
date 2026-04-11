"use client";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export default function OnboardingSuccess() {
  const { update } = useSession();

  const handleEntry = async () => {
    // On force une mise à jour de la session pour être sûr que le JWT a le bon flag
    await update({ hasFinishedOnboarding: true });
    
    // On pose un cookie temporaire pour aider le middleware à passer outre le JWT obsolète
    document.cookie = "onboarding_sync=true; path=/; max-age=60"; // 60 secondes suffisent
    
    window.location.href = "/";
  };

  return (
    <div className="onboarding-success-msg" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <p className="onboarding-subtitle">Votre profil est configuré avec succès.</p>
      <button onClick={handleEntry} className="onboarding-submit-btn" style={{ width: 'auto', margin: '0 auto' }}>
        Entrer sur le site <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
      </button>
    </div>
  );
}
