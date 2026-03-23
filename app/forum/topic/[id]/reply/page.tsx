import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTopicLatestPosts, getPostById, getQuoteStatusMap } from "@/app/forum/actions";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";
import ReplyForm from "@/components/forum/ReplyForm";
import ForumBreadcrumbs from "@/components/forum/ForumBreadcrumbs";
import "../../../forum.css";

export const dynamic = "force-dynamic";

export default async function ReplyPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ quotePostId?: string }> 
}) {
  const { id } = await params;
  const { quotePostId } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/forum/topic/${id}`);
  }

  const topic = await prisma.topic.findUnique({
    where: { id },
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
  });

  if (!topic) notFound();

  // Handle quote if requested
  let quoteData = null;
  if (quotePostId) {
    const post = await getPostById(quotePostId);
    if (post && post.topicId === id) {
      quoteData = {
        postId: post.id,
        author: post.authorId,
        content: post.content
      };
    }
  }

  // Get 3 latest posts for context
  const latestPosts = await getTopicLatestPosts(id, 3);
  const quoteStatusMap = await getQuoteStatusMap(latestPosts.map(p => p.content));

  const breadcrumbs = [];
  if (topic.forum.parentForum) {
    if (topic.forum.parentForum.category) breadcrumbs.push({ label: topic.forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: topic.forum.parentForum.name, href: `/forum/${topic.forum.parentForumId}` });
  } else if (topic.forum.category) {
    breadcrumbs.push({ label: topic.forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: topic.forum.name, href: `/forum/${topic.forumId}` });
  breadcrumbs.push({ label: topic.title, href: `/forum/topic/${topic.id}` });
  breadcrumbs.push({ label: "Répondre" });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href={`/forum/topic/${id}`} className="back-button" title="Retour au sujet" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Répondre au <span>sujet</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Sujet : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} /></p>
        </div>
      </header>

      <ForumBreadcrumbs items={breadcrumbs} />
 
      <div className="forum-layout" style={{ display: 'block' }}>
        <div className="forum-main-content">
          <ReplyForm 
            topicId={id} 
            quotePostId={quoteData?.postId} 
            quoteAuthor={quoteData?.author} 
            quoteContent={quoteData?.content} 
          />

          {/* Context: Latest 3 posts */}
          <div style={{ marginTop: '4rem', opacity: 0.8 }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#888' }}>
              <Clock size={20} />
              Rappel des derniers messages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {latestPosts.map((post) => (
                <div key={post.id} className="premium-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                  <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {post.author.image ? (
                      <img src={post.author.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="#888" />
                      </div>
                    )}
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author.name}</div>
                  </div>
                  <div 
                    style={{ paddingLeft: '1.5rem', fontSize: '0.95rem', color: '#aaa', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
                    dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
