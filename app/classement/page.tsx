import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Trophy, Timer, Construction, Award } from "lucide-react";
import "./page.css";

export default function ClassementPage() {
  return (
    <main className="container classement-page">
      <PageHeader 
        title="Classement & Coupe de France" 
        subtitle="Le Panthéon des meilleurs coachs de Blood Bowl France"
        backHref="/" 
      />

      <div className="maintenance-box">
        <div className="icon-stack">
          <Award size={64} className="main-icon" />
          <Construction size={24} className="sub-icon animate-bounce" />
        </div>
        
        <h2>Bientôt Disponible !</h2>
        <p>Le système de classement et le suivi de la Coupe de France sont en cours de développement.</p>
        
        <div className="features-preview">
          <div className="preview-item">
            <Trophy size={20} />
            <span>Classement National NAF</span>
          </div>
          <div className="preview-item">
            <Award size={20} />
            <span>Suivi des Major Tournaments</span>
          </div>
          <div className="preview-item">
            <Timer size={20} />
            <span>Historique des Saisons</span>
          </div>
        </div>

        <div className="back-link">
          Revenez bientôt pour plus d'infos !
        </div>
      </div>
    </main>
  );
}
