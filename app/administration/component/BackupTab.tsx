"use client";

import { DatabaseBackup, Download } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

export default function BackupTab() {
  return (
    <PremiumCard className="fade-in" style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--success-transparent, rgba(34, 197, 94, 0.1))', padding: '0.8rem', borderRadius: '12px', color: 'var(--success)' }}>
          <DatabaseBackup size={32} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Sauvegarde de la Base de Données</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Archive physique complète pour récupération ou migration.</p>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1rem' }}>
        Vous pouvez télécharger une copie physique complète de la base de données SQLite (<strong style={{ color: 'var(--foreground)' }}>dev.db</strong>). 
        <br/>Cette archive contient l'intégralité du site : comptes utilisateurs, sujets, messages privés, événements et configurations. 
        <strong style={{ color: 'var(--warning)', marginLeft: '0.3rem' }}>Conservez ce fichier en lieu sûr.</strong>
      </p>

      <a 
        href="/api/admin/backup" 
        download 
        className="download-backup-btn"
      >
        <Download size={22} />
        TÉLÉCHARGER L'ARCHIVE (dev.db)
      </a>

      <style jsx>{`
        .download-backup-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 2.5rem;
          background: var(--success, #22c55e);
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          font-size: 1rem;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .download-backup-btn:hover {
          transform: translateY(-4px);
          filter: brightness(1.1);
          box-shadow: 0 15px 30px rgba(34, 197, 94, 0.5);
        }
        .download-backup-btn:active {
          transform: translateY(-1px);
        }
      `}</style>
    </PremiumCard>
  );
}
