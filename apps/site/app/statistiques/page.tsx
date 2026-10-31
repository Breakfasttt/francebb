/**
 * Page Statistiques (refonte, carte 090, ADR 0006) : les chiffres publics de la plateforme, puis, pour un
 * administrateur seulement, ceux de la console d'administration (courriels, quotas, base, éléments en attente).
 * Deux colonnes de chiffres sur téléphone, trois sur ordinateur.
 */
import React from 'react';
import ForumListHeader from '@/app/forum/component/ForumListHeader';
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

export const dynamic = 'force-dynamic';

const sectionTitle = "m-0 border-0 p-0 text-lg leading-tight font-bold text-bb-text normal-case not-italic";
const grid = "m-0 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4";

export default async function StatistiquesPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Statistiques"
        subtitle="État des lieux du Blood Bowl en France"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="flex flex-col gap-8">
        <section aria-labelledby="stats-public" className="flex flex-col gap-3">
          <h2 id="stats-public" className={sectionTitle}>Activité générale</h2>
          <dl className={grid}>
            <StatCard 
              label="Utilisateurs" 
              value={stats.public.users} 
              icon={<Users size={18} />}
              description="Coachs inscrits sur la plateforme"
            />
            <StatCard 
              label="Ligues" 
              value={stats.public.ligues} 
              icon={<Trophy size={18} />}
              description="Ligues et associations actives"
            />
            <StatCard 
              label="Articles" 
              value={stats.public.articles} 
              icon={<FileText size={18} />}
              description="Actualités et guides publiés"
            />
            <StatCard 
              label="Sujets du forum" 
              value={stats.public.topics} 
              icon={<MessageSquare size={18} />}
              description="Discussions ouvertes sur le forum"
            />
            <StatCard 
              label="Vues totales" 
              value={stats.public.totalViews.toLocaleString('fr-FR')} 
              icon={<Eye size={18} />}
              description="Consultations cumulées des sujets"
            />
            <StatCard 
              label="En ligne" 
              value={stats.public.onlineUsers} 
              icon={<Activity size={18} />}
              description="Membres ayant lu le forum ces 15 dernières minutes"
            />
          </dl>
        </section>

        {stats.admin && (
          <section aria-labelledby="stats-admin" className="flex flex-col gap-3">
            <h2 id="stats-admin" className={sectionTitle}>Console d’administration</h2>
            <p className="m-0 -mt-1 text-sm text-bb-text-muted">Visible seulement par les administrateurs.</p>
            <dl className={grid}>
              <StatCard 
                label="Courriels du mois" 
                value={stats.admin.monthlyMails} 
                icon={<Send size={18} />}
                description="Courriels envoyés ce mois-ci"
              />
              <StatCard 
                label="Quota restant" 
                value={stats.admin.mailsRemaining} 
                icon={<Mail size={18} />}
                description="Courriels encore disponibles ce mois-ci (Resend)"
              />
              <StatCard 
                label="Taille de la base" 
                value={stats.admin.dbSize} 
                icon={<Database size={18} />}
                description="Place occupée par la base de données"
              />
              <StatCard 
                label="Signalements" 
                value={stats.admin.pendingReports} 
                icon={<AlertCircle size={18} />}
                description="En attente de traitement"
              />
              <StatCard 
                label="Ressources" 
                value={stats.admin.pendingResources} 
                icon={<FileText size={18} />}
                description="En attente de validation"
              />
              <StatCard 
                label="Quota de stockage" 
                value={stats.admin.storageQuota} 
                icon={<HardDrive size={18} />}
                description="Limite de stockage allouée"
              />
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
