import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock, User, Pencil } from "lucide-react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { notFound, redirect } from "next/navigation";
import { getTopicLatestPosts, getPostById, getQuoteStatusMap } from "@/app/forum/actions";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";
import EditPostForm from "@/app/forum/component/EditPostForm";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import "../../../page.css";
import { isModerator } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { 
      author: true,
      topic: {
        include: { 
          forum: {
            include: {
              category: true,
              parentForum: {
                include: { category: true }
              }
            }
          }
        }
      }
    }
  });

  if (!post) notFound();

  // Check permission
  const canEdit = post.authorId === session.user.id || isModerator(session.user.role);
  if (!canEdit) {
    redirect(`/forum/topic/${post.topicId}`);
  }

  // Get 3 latest posts for context
  const latestPosts = await getTopicLatestPosts(post.topicId, 3);
  const quoteStatusMap = await getQuoteStatusMap(latestPosts.map(p => p.content));

  const breadcrumbs = [];
  if (post.topic.forum.parentForum) {
    if (post.topic.forum.parentForum.category) breadcrumbs.push({ label: post.topic.forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: post.topic.forum.parentForum.name, href: `/forum/${post.topic.forum.parentForumId}` });
  } else if (post.topic.forum.category) {
    breadcrumbs.push({ label: post.topic.forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: post.topic.forum.name, href: `/forum/${post.topic.forumId}` });
  breadcrumbs.push({ label: post.topic.title, href: `/forum/topic/${post.topic.id}` });
  breadcrumbs.push({ label: "Modifier le message" });

  return (
    <main className="container forum-container">
      <PageHeader
        title={<span style={{ color: 'var(--primary)' }}>Modifier mon message</span>}
        subtitle={<>Sujet : <strong style={{ color: 'var(--accent)' }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }} /></>}
        backHref={`/forum/topic/${post.topicId}`}
        backTitle="Retour au sujet"
      />
 
      <ForumBreadcrumbs items={breadcrumbs} />

      <div className="forum-layout" style={{ display: 'block' }}>
        <div className="forum-main-content">
          <EditPostForm 
            postId={id} 
            initialContent={post.content} 
          />

          {/* Context: Latest 3 posts */}
          <div style={{ marginTop: '4rem', opacity: 0.8 }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-muted)' }}>
              <Clock size={20} />
              Rappel des derniers messages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {latestPosts.map((latest) => (
                <PremiumCard key={latest.id} className={latest.id === id ? 'is-editing' : ''} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '150px 1fr', opacity: latest.id === id ? 0.5 : 1, border: latest.id === id ? '1px dashed var(--primary)' : '1px solid var(--glass-border)' }}>
                  <div style={{ borderRight: '1px solid var(--glass-border)', paddingRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {latest.author.image ? (
                      <img src={latest.author.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="var(--text-muted)" />
                      </div>
                    )}
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      {latest.author.name}
                      {latest.id === id && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--primary)' }}>(Ce message)</span>}
                    </div>
                  </div>
                  <div 
                    style={{ paddingLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
                    dangerouslySetInnerHTML={{ __html: parseBBCode(latest.content, quoteStatusMap) }}
                  />
                </PremiumCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
