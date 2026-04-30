import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { updateLigue } from "@/app/ligues/actions";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import UserSearchWrapper from "@/app/ligues/create/UserSearchWrapper";
import LigueBlasonUpload from "../LigueBlasonUpload";
import LigueLocationFields from "@/app/ligues/create/LigueLocationFields";
import LigueEditSubmit from "../LigueEditSubmit";
import { Shield, MapPin, Globe, Users, Info, Save } from "lucide-react";
import { isModerator } from "@/lib/roles";
import "@/app/ligues/create/page.css"; // Reuse create styles

export default async function EditLiguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/auth/login?callback=/ligue/edit/${id}`);

  const ligue = await prisma.ligue.findUnique({
    where: { id },
    include: {
      commissaires: true
    }
  });

  if (!ligue) notFound();

  const isCreator = session.user.id === ligue.creatorId;
  const isCommissaire = ligue.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isCreator && !isCommissaire && !isMod) {
    redirect(`/ligue/${id}`);
  }

  const coachRegions = await prisma.referenceData.findMany({
    where: { group: "COACH_REGION", isActive: true },
    orderBy: { order: "asc" }
  });

  const departments = await prisma.referenceData.findMany({
    where: { group: "DEPARTEMENT_FRANCE", isActive: true },
    orderBy: { order: "asc" }
  });

  const franceRegions = await prisma.referenceData.findMany({
    where: { group: "REGION_FRANCE", isActive: true },
    orderBy: { order: "asc" }
  });

  // Correct way to pass ID to a Server Action used in a form
  const editActionWithId = updateLigue.bind(null, id);

  return (
    <main className="container">
      <PageHeader 
        title={`Modifier ${ligue.acronym}`} 
        subtitle={ligue.name}
        backHref={`/ligue/${id}`} 
      />

      <form className="ligue-form">
        <div className="form-layout">
          <div className="form-main">
            <PremiumCard style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--accent)', color: 'var(--header-foreground)', padding: '10px', borderRadius: '10px' }}>
                    <Shield size={28} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Informations de Base</h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Nom complet de la ligue *</label>
                  <input type="text" name="name" required className="admin-input" defaultValue={ligue.name} />
                </div>
                <div className="form-group">
                  <label>Acronyme *</label>
                  <input type="text" name="acronym" required className="admin-input" defaultValue={ligue.acronym} maxLength={10} />
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
                  initialValues={{
                    lat: ligue.lat,
                    lng: ligue.lng,
                    address: ligue.address,
                    ville: ligue.ville,
                    region: ligue.region,
                    departement: ligue.departement,
                    geographicalZone: ligue.geographicalZone
                  }}
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
                  defaultValue={ligue.description || ""}
                  rows={12}
                />
              </div>

            </PremiumCard>
          </div>

          <aside className="form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <LigueBlasonUpload 
              initialImage={ligue.image} 
              ligueName={ligue.name} 
            />
            <PremiumCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Users size={20} style={{ color: 'var(--accent)' }} />
                <h4 style={{ margin: 0 }}>Commissaires</h4>
              </div>
              
              {(isCreator || isMod) ? (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    En tant que chef de ligue, vous pouvez modifier la liste des commissaires.
                  </p>
                  <UserSearchWrapper 
                    initialUsers={ligue.commissaires.map(c => ({
                      id: c.id,
                      name: c.name,
                      image: c.image
                    }))}
                  />
                  <input type="hidden" name="commissaireIds" id="commissaireIdsInput" />
                </>
              ) : (
                <div className="user-list-readonly" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Seul le chef de ligue peut modifier cette liste.
                  </p>
                  {ligue.commissaires.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                        <Shield size={14} style={{ color: 'var(--accent)' }} /> {c.name}
                    </div>
                  ))}
                </div>
              )}

              <LigueEditSubmit ligueId={id} />
            </PremiumCard>
          </aside>
        </div>
      </form>

    </main>
  );
}
