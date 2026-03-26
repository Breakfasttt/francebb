"use client";

import Link from "next/link";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";

export default function DesignLogoShowcase() {
  return (
    <main className="container showcase-container">
      <h1 className="showcase-title">Pistes de Design : Composant Finalisé</h1>
      <p className="showcase-desc">
        Le logo est maintenant un composant réutilisable (SiteLogo.tsx) prêt pour l&apos;intégration globale.
      </p>

      <div className="showcase-grid" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* VÉRIFICATION DU COMPOSANT */}
        <div className="showcase-card final-card">
          <div className="preview-box parchment-bg" style={{ height: '300px', padding: '20px' }}>
            
            <div style={{ transform: 'scale(1.2)' }}>
                <SiteLogo />
            </div>

          </div>
          <div className="card-info">
            <h3>Composant &lt;SiteLogo /&gt;</h3>
            <p>
                - **Fichiers** : <code>common/components/SiteLogo/SiteLogo.tsx</code> + <code>SiteLogo.css</code>. <br/>
                - **Usage** : Prêt pour le Header (scale 0.5) et l&apos;Accueil (scale 1.2). <br/>
                - **Symmetry** : Tous les alignements (F/B, E/L, vertical) sont encapsulés dans le composant.
            </p>
          </div>
        </div>

      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/" className="btn-primary">Retour à l'accueil</Link>
      </div>

      <style jsx>{`
        .showcase-container { padding: 4rem 2rem; }
        .showcase-title { font-size: 2.5rem; margin-bottom: 1rem; text-align: center; }
        .showcase-desc { text-align: center; color: var(--text-muted); margin-bottom: 4rem; max-width: 700px; margin-inline: auto; }
        
        .final-card { max-width: 600px; margin: 0 auto; }
        .preview-box { background: #efebdd; border-radius: 20px 20px 0 0; display: flex; align-items: center; justify-content: center; }

        .card-info { padding: 2rem; }
        .card-info h3 { font-size: 1.5rem; color: var(--accent); margin-bottom: 1rem; }
        .card-info p { color: var(--text-muted); line-height: 1.8; }
      `}</style>
    </main>
  );
}
