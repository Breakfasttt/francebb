import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus, Trophy, Calendar, MapPin, Users, Coins } from "lucide-react";
import Link from "next/link";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { parseInlineBBCode } from "@/lib/bbcode";

/**
 * Page de création d'un sujet de tournoi.
 * Uniquement accessible dans les forums marqués comme isTournamentForum.
 */

export default async function NewTournamentPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) notFound();

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: {
      category: true,
      parentForum: {
        include: { category: true }
      }
    }
  });

  if (!forum || !forum.isTournamentForum) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  // Charger les données de référence
  const franceRegions = await prisma.referenceData.findMany({
    where: { group: 'REGION_FRANCE', isActive: true },
    orderBy: { order: 'asc' }
  });

  const gameEditions = await prisma.referenceData.findMany({
    where: { group: 'GAME_EDITION', isActive: true },
    orderBy: { order: 'asc' }
  });

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Annoncer un tournoi" });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href={`/forum/${forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Annoncer un <span>tournoi</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Dans le forum : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></p>
        </div>
      </header>
 
      <ForumBreadcrumbs items={breadcrumbs} />

      <form action={createTopic}>
        <input type="hidden" name="forumId" value={forumId} />
        
        <div className="forum-layout">
          <div className="forum-main-content">
            <div style={{ background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Infos tournoi en PREMIER */}
              <div style={{ 
                padding: '2rem', 
                background: 'rgba(255, 215, 0, 0.03)', 
                border: '1px solid rgba(255, 215, 0, 0.2)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(255, 215, 0, 0.2)', paddingBottom: '1rem' }}>
                  <div style={{ 
                    background: 'var(--accent)', 
                    color: 'black', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.3rem', fontWeight: 800 }}>Détails du Tournoi</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Ces informations seront utilisées pour le référencement et les filtres de recherche.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                      <Calendar size={14} /> Date du tournoi *
                    </label>
                    <input type="date" name="tDate" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                      <MapPin size={14} /> Lieu / Nom de la salle
                    </label>
                    <input type="text" name="tLocation" placeholder="Ex: Salle des fêtes" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Ville </label>
                    <input type="text" name="tVille" placeholder="Ex: Lyon" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Département (N°) </label>
                    <input type="text" name="tDept" placeholder="Ex: 69" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Région </label>
                    <select name="tRegion" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                      <option value="">Sélectionner</option>
                      {franceRegions.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> <Users size={14} /> Places max. </label>
                    <input type="number" name="tMax" placeholder="Ex: 40" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> <Coins size={14} /> Prix d'inscription (€) </label>
                    <input type="number" step="0.5" name="tPrice" placeholder="Ex: 15" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Durée (jours) </label>
                    <select name="tDays" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                      <option value="1">1 jour</option>
                      <option value="2">2 jours</option>
                      <option value="3">3 jours (Long weekend)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Édition du jeu </label>
                    <select name="tGame" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                      {gameEditions.map(g => (
                        <option key={g.key} value={g.key}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}> Règlement / Format </label>
                    <input type="text" name="tRuleset" placeholder="Ex: NAF, Eurobowl..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="tMeals" style={{ width: '18px', height: '18px' }} />
                    <span>Repas inclus</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="tLodging" style={{ width: '18px', height: '18px' }} />
                    <span>Dodo sur place</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="tFriday" style={{ width: '18px', height: '18px' }} />
                    <span>Accueil vendredi</span>
                  </label>
                </div>
              </div>

              {/* Titre et Message en DESSOUS pour le tournoi */}
              <div className="form-group">
                <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre de l&apos;annonce (Nom du tournoi)</label>
                <TitleInputWithSmiley />
              </div>

              <div className="form-group">
                <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Présentation complète / Règlement détaillé</label>
                <BBCodeEditor
                  id="content"
                  name="content"
                  placeholder="Détaillez ici votre tournoi, horaires, lots, etc."
                  rows={15}
                />
              </div>
            </div>
          </div>

          <aside className="forum-sidebar">
            <div className="sidebar-sticky-inner">
              <div className="forum-widget" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', margin: 0, color: 'var(--accent)' }}>
                  <Trophy size={16} /> Publication Tournoi
                </h3>

                {userCanStick && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="isSticky" value="true" style={{ width: '16px', height: '16px' }} />
                      <span>Épingler (Post-it)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="isLocked" value="true" style={{ width: '16px', height: '16px' }} />
                      <span>Verrouiller le sujet</span>
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="widget-button" style={{ width: '100%', background: 'var(--accent)', color: 'black', padding: '0.8rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                    Publier le tournoi
                  </button>
                  <Link href={`/forum/${forumId}`} className="widget-button secondary-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Annuler
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
   </main>
  );
}
