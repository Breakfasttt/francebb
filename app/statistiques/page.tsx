/**
 * Page Statistiques - Dashboard de la plateforme BBFrance.
 */
import React from 'react';
import PageHeader from '@/common/components/PageHeader/PageHeader';
import { getDashboardStats } from './actions';
import StatCard from './component/StatCard/StatCard';
import { 
  Users, 
  Trophy, 
  FileText, 
  MessageSquare, 
  Eye, 
  Activity, 
  Database, 
  Mail, 
  AlertCircle,
  HardDrive,
  Send
} from 'lucide-react';

import './page.css';
import './page-mobile.css';

export const dynamic = 'force-dynamic';

export default async function StatistiquesPage() {
  const stats = await getDashboardStats();

  return (
    <div className="stats-page-wrapper">
      <PageHeader 
        title={<><span>Statistiques</span></>}
        subtitle="État des lieux du Blood Bowl en France"
      />

      <main className="container stats-container">
        <section className="stats-section">
          <h2 className="section-title">Activité Générale</h2>
          <div className="stats-grid">
            <StatCard 
              label="Utilisateurs" 
              value={stats.public.users} 
              icon={<Users size={24} />}
              description="Coachs inscrits sur la plateforme"
            />
            <StatCard 
              label="Ligues" 
              value={stats.public.ligues} 
              icon={<Trophy size={24} />}
              variant="accent"
              description="Ligues et associations actives"
            />
            <StatCard 
              label="Articles" 
              value={stats.public.articles} 
              icon={<FileText size={24} />}
              description="Actualités et guides publiés"
            />
            <StatCard 
              label="Sujets Forum" 
              value={stats.public.topics} 
              icon={<MessageSquare size={24} />}
              description="Discussions ouvertes sur le forum"
            />
            <StatCard 
              label="Vues Totales" 
              value={stats.public.totalViews.toLocaleString()} 
              icon={<Eye size={24} />}
              description="Consultations cumulées des sujets"
            />
            <StatCard 
              label="Connectés" 
              value={stats.public.onlineUsers} 
              icon={<Activity size={24} />}
              variant="secondary"
              description="Sessions actives actuellement"
            />
          </div>
        </section>

        {stats.admin && (
          <section className="stats-section admin-section">
            <h2 className="section-title">Console Administrateur</h2>
            <div className="stats-grid">
              <StatCard 
                label="Emails du mois" 
                value={stats.admin.monthlyMails} 
                icon={<Send size={24} />}
                variant="admin"
                description="Emails envoyés ce mois-ci"
              />
              <StatCard 
                label="Quota Restant" 
                value={stats.admin.mailsRemaining} 
                icon={<Mail size={24} />}
                variant="admin"
                description="Emails disponibles (Resend)"
              />
              <StatCard 
                label="Taille BDD" 
                value={stats.admin.dbSize} 
                icon={<Database size={24} />}
                variant="admin"
                description="Taille physique du fichier SQLite"
              />
              <StatCard 
                label="Rapports" 
                value={stats.admin.pendingReports} 
                icon={<AlertCircle size={24} />}
                variant="admin"
                description="Signalements en attente"
              />
              <StatCard 
                label="Ressources" 
                value={stats.admin.pendingResources} 
                icon={<FileText size={24} />}
                variant="admin"
                description="En attente de validation"
              />
              <StatCard 
                label="Quota Stockage" 
                value={stats.admin.storageQuota} 
                icon={<HardDrive size={24} />}
                variant="admin"
                description="Limite de stockage allouée"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
