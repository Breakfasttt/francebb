import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import "../forum.css";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";

export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) notFound();

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { name: true, categoryId: true, id: true }
  });

  if (!forum) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  return (
    <main className="container forum-container" style={{ paddingBottom: '5rem' }}>
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href={`/forum/${forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Nouveau <span>sujet</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Dans le forum : <strong>{forum.name}</strong></p>
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <form action={createTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input type="hidden" name="forumId" value={forumId} />
          
          <div className="form-group">
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre du sujet</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ex: Rechercher des joueurs, Stratégies Elfes..."
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message</label>
            <textarea
              id="content"
              name="content"
              required
              rows={10}
              placeholder="Tapez votre message ici..."
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', resize: 'vertical' }}
            ></textarea>
          </div>

          {userCanStick && (
            <div className="form-group" style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isSticky" style={{ width: '18px', height: '18px' }} />
                <span>Mettre en Post-it (Sticky)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isLocked" style={{ width: '18px', height: '18px' }} />
                <span>Verrouiller le sujet</span>
              </label>
            </div>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="widget-button" style={{ flex: 1, height: '3.5rem' }}>
              <MessageSquarePlus size={20} />
              Créer le sujet
            </button>
            <Link href={`/forum/${forumId}`} className="widget-button secondary-btn" style={{ flex: 1, height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
        </div>
       <ForumSidebar forumId={forum.id} forumName={forum.name} categoryId={forum.categoryId || undefined} />
     </div>
   </main>
  );
}
