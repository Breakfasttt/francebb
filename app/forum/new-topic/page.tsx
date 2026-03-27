import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import "../page.css";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { parseInlineBBCode } from "@/lib/bbcode";
import CreateTopicSidebar from "@/app/forum/component/CreateTopicSidebar";

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
        <BackButton href={`/forum/${forumId}`} title="Retour au forum" style={{ position: 'absolute', left: 0 }} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)' }}>Nouveau sujet</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Dans le forum : <strong style={{ color: 'var(--accent)' }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></p>
        </div>
      </header>
 
      <ForumBreadcrumbs items={breadcrumbs} />

      <form action={createTopic}>
        <input type="hidden" name="forumId" value={forumId} />
        
        <div className="forum-layout">
          <div className="forum-main-content">
            <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          <CreateTopicSidebar 
            forumId={forumId} 
            userRole={session.user.role} 
            submitLabel="Créer le sujet" 
            icon={<MessageSquarePlus size={18} />}
          />
        </div>
      </form>
   </main>
  );
}
