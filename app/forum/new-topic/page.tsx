import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import "../forum.css";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/components/forum/BBCodeEditor";
import TitleInputWithSmiley from "@/components/forum/TitleInputWithSmiley";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";


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
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href={`/forum/${forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Nouveau <span>sujet</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Dans le forum : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></p>
        </div>
      </header>
 
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <form action={createTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input type="hidden" name="forumId" value={forumId} />
          
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
              rows={12}
            />
          </div>

          {userCanStick && (
            <div className="form-group" style={{ display: 'flex', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isSticky" value="true" />
                <span>Épingler le sujet (Post-it)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isLocked" value="true" />
                <span>Verrouiller le sujet</span>
              </label>
            </div>
          )}

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link href={`/forum/${forumId}`} className="widget-button secondary-btn" style={{ width: 'auto' }}>
              Annuler
            </Link>
            <button type="submit" className="widget-button" style={{ width: 'auto', background: 'var(--primary)', padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Créer le sujet
            </button>
          </div>
        </form>
      </div>
   </main>
  );
}
