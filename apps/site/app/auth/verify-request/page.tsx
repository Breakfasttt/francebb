import { Mail } from "lucide-react";
import "./page.css";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";
import Link from "next/link";

/**
 * Page affichée après l'envoi d'un Magic Link par email.
 */
export default function VerifyRequestPage() {
  return (
    <main className="login-container">
      <PremiumCard className="login-card">
        <div className="verify-icon-wrapper">
          <Mail size={48} className="verify-icon" />
        </div>
        
        <h1 className="login-title">Vérifiez votre boîte mail</h1>
        
        <div className="verify-content">
          <p>Un lien de connexion vient de vous être envoyé par email.</p>
          <p className="verify-instruction">
            Cliquez sur le lien contenu dans le message pour vous connecter instantanément.
          </p>
        </div>

        <div className="verify-footer-actions">
          <Link href="/auth/login" style={{ display: 'contents' }}>
            <ClassicButton fullWidth>
              Retour à la connexion
            </ClassicButton>
          </Link>
        </div>

        <p className="login-footer">
          Si vous ne recevez rien, vérifiez vos messages indésirables (spams).
        </p>
      </PremiumCard>
    </main>
  );
}
