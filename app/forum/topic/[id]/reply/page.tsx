import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock, User } from "lucide-react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { notFound, redirect } from "next/navigation";
import { getTopicLatestPosts, getPostById, getQuoteStatusMap } from "@/app/forum/actions";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";
import ReplyForm from "@/app/forum/component/ReplyForm";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import "../../../page.css";

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
      <PageHeader
        title={<>Répondre au <span>sujet</span></>}
        subtitle={<>Sujet : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} /></>}
        backHref={`/forum/topic/${id}`}
        backTitle="Retour au sujet"
      />

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
                <PremiumCard key={post.id} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '150px 1fr' }}>
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
                    style={{ paddingLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
                    dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap, session?.user?.id) }}
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
