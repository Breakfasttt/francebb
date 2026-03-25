import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus, Trophy, Calendar, MapPin, Users, Coins } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import Link from "next/link";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";


export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
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

  if (!forum) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Nouveau sujet" });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href={`/forum/${forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Nouveau <span>sujet</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Dans le forum : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></p>
        </div>
      </header>
 
      <ForumBreadcrumbs items={breadcrumbs} />

      <form action={createTopic}>
        <input type="hidden" name="forumId" value={forumId} />
        
        <div className="forum-layout">
          <div className="forum-main-content">
            <div style={{ background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre du sujet</label>
                <TitleInputWithSmiley />
              </div>

              <div className="form-group">
                <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message</label>
                <BBCodeEditor
                  id="content"
                  name="content"
                  placeholder="Tapez votre message ici... Utilisez les boutons ou les balises BBCode."
                  rows={10}
                />
              </div>

              {forum.isTournamentForum && (
                <div style={{ 
                  marginTop: '1rem', 
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Ville
                      </label>
                      <input type="text" name="tVille" placeholder="Ex: Lyon" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Département (N°)
                      </label>
                      <input type="text" name="tDept" placeholder="Ex: 69" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Région
                      </label>
                      <select name="tRegion" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                        <option value="">Sélectionner</option>
                        <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                        <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                        <option value="Bretagne">Bretagne</option>
                        <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                        <option value="Corse">Corse</option>
                        <option value="Grand Est">Grand Est</option>
                        <option value="Hauts-de-France">Hauts-de-France</option>
                        <option value="Île-de-France">Île-de-France</option>
                        <option value="Normandie">Normandie</option>
                        <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                        <option value="Occitanie">Occitanie</option>
                        <option value="Pays de la Loire">Pays de la Loire</option>
                        <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        <Users size={14} /> Places max.
                      </label>
                      <input type="number" name="tMax" placeholder="Ex: 40" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        <Coins size={14} /> Prix d'inscription (€)
                      </label>
                      <input type="number" step="0.5" name="tPrice" placeholder="Ex: 15" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Durée (jours)
                      </label>
                      <select name="tDays" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                        <option value="1">1 jour</option>
                        <option value="2">2 jours</option>
                        <option value="3">3 jours (Long weekend)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Édition du jeu
                      </label>
                      <select name="tGame" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                        <option value="BB20">Blood Bowl 2020</option>
                        <option value="BB3">Blood Bowl 3</option>
                        <option value="BB7">Blood Bowl 7's</option>
                        <option value="GutterBowl">Gutter Bowl</option>
                        <option value="Classic">Classic / LRB6</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        Règlement / Format
                      </label>
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
              )}
            </div>
          </div>

          <aside className="forum-sidebar">
            <div className="sidebar-sticky-inner">
              <div className="forum-widget" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', margin: 0 }}>
                  <MessageSquarePlus size={16} /> Publication
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
                  <button type="submit" className="widget-button" style={{ width: '100%', background: 'var(--primary)', padding: '0.8rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                    Créer le sujet
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
