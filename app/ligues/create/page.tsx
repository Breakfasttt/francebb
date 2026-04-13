import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { createLigue } from "@/app/ligues/actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import UserSearchWrapper from "./UserSearchWrapper";
import LigueLocationFields from "./LigueLocationFields";
import CTAButton from "@/common/components/Button/CTAButton";
import { Shield, MapPin, Globe, Users, Info } from "lucide-react";
import "./page.css";
import "./page-mobile.css";


export default async function CreateLiguePage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callback=/ligues/create");

  const coachRegions = await prisma.referenceData.findMany({
    where: { group: "COACH_REGION", isActive: true },
    orderBy: { order: "asc" }
  });

  const franceRegions = await prisma.referenceData.findMany({
    where: { group: "REGION_FRANCE", isActive: true },
    orderBy: { order: "asc" }
  });

  const departments = await prisma.referenceData.findMany({
    where: { group: "DEPARTEMENT_FRANCE", isActive: true },
    orderBy: { order: "asc" }
  });

  return (
    <main className="container">
      <PageHeader 
        title="Créer une Ligue" 
        subtitle="Regroupez votre communauté Blood Bowl locale"
        backHref="/ligues" 
      />

      <form action={createLigue} className="ligue-form">
        <div className="form-layout">
          <div className="form-main">
            <PremiumCard style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--accent)', color: 'var(--header-foreground)', padding: '10px', borderRadius: '10px' }}>
                    <Shield size={28} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Informations de Base</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Identifiez votre ligue sur le site.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Nom complet de la ligue *</label>
                  <input type="text" name="name" required className="admin-input" placeholder="Ex: Ligue de Blood Bowl de Lyon" />
                </div>
                <div className="form-group">
                  <label>Acronyme *</label>
                  <input type="text" name="acronym" required className="admin-input" placeholder="Ex: LBBL" maxLength={10} />
                </div>
              </div>

              <div className="section-separator">
                <MapPin size={18} />
                <h4>Localisation & Zone NAF</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <LigueLocationFields 
                    coachRegions={coachRegions} 
                    franceRegions={franceRegions} 
                    allDepartments={departments} 
                />
                
              </div>

              <div className="section-separator">
                <Info size={18} />
                <h4>Présentation & Description</h4>
              </div>

              <div className="form-group">
                <label>Description du fonctionnement, lien Discord, etc. (BBCode)</label>
                <BBCodeEditor 
                  name="description" 
                  placeholder="Présentez votre ligue aux nouveaux coachs..." 
                  rows={12}
                />
              </div>

            </PremiumCard>
          </div>

          <aside className="form-sidebar">
            <PremiumCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Users size={20} style={{ color: 'var(--accent)' }} />
                <h4 style={{ margin: 0 }}>Commissaires</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Désignez d&apos;autres membres pour vous aider à gérer cette ligue (éditior, gestion des tournois).
              </p>
              
              <UserSearchWrapper />
              <input type="hidden" name="commissaireIds" id="commissaireIdsInput" />

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <CTAButton 
                  type="submit" 
                  fullWidth 
                  icon={<Shield size={18} />}
                  size="lg"
                >
                  Créer la Ligue
                </CTAButton>
              </div>
            </PremiumCard>
          </aside>
        </div>
      </form>

    </main>
  );
}
