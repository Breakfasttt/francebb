import Link from "next/link";
import "./page.css";
import { AlertCircle, ChevronLeft } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  const getErrorMessage = (err?: string) => {
    switch (err) {
      case "Configuration":
        return "Il y a un problème avec la configuration du serveur d'authentification.";
      case "AccessDenied":
        return "L'accès vous a été refusé.";
      case "Verification":
        return "Le lien magique a expiré ou a déjà été utilisé.";
      default:
        return "Une erreur inattendue est survenue lors de l'authentification.";
    }
  };

  return (
    <main className="login-container">
      <PremiumCard className="login-card">
        <div className="error-icon-wrapper">
          <AlertCircle size={48} className="error-icon" />
        </div>
        <h1 className="login-title">Erreur d'authentification</h1>
        
        <div className="auth-error-details">
          <p>{getErrorMessage(error)}</p>
          {error && <code className="error-code">ID Erreur: {error}</code>}
        </div>

              <Link href="/auth/login" style={{ display: 'contents' }}>
                <ClassicButton fullWidth icon={<ChevronLeft size={18} />}>
                  Retour à la page de connexion
                </ClassicButton>
              </Link>
      </PremiumCard>
    </main>
  );
}
