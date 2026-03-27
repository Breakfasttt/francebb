"use client";

import { DatabaseBackup, Download } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

export default function BackupTab() {
  return (
    <PremiumCard className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <DatabaseBackup size={32} color="#22c55e" />
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Sauvegarde de la Base de Données</h3>
      </div>
      
      <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: '2rem' }}>
        Vous pouvez télécharger une copie physique complète de la base de données SQLite (<strong>dev.db</strong>). 
        <br/>Cette archive contient l'intégralité du site : comptes utilisateurs, sujets, messages privés, événements et configurations. Conservez ce fichier en lieu sûr.
      </p>

      <a 
        href="/api/admin/backup" 
        download 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.8rem', 
          padding: '1rem 2rem', 
          background: '#22c55e', 
          color: 'white', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: 800,
          transition: 'all 0.2s',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
        }}
      >
        <Download size={20} />
        TÉLÉCHARGER L'ARCHIVE (dev.db)
      </a>
    </PremiumCard>
  );
}
