import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { parseInlineBBCode } from "@/lib/bbcode";

/**
 * Page de création d'un sujet classique.
 * Si le forum est un forum de tournoi, on devrait utiliser /new-tournament pour les annonces.
 */

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
                  rows={20}
                />
              </div>
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
