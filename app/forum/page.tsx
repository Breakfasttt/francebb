import { ArrowLeft } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import "./page.css";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ForumCategory from "@/app/forum/component/ForumCategory";
import DeletionToast from "@/app/forum/component/DeletionToast";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callback=/forum");

  const userId = session?.user?.id;

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      forums: {
        where: { parentForumId: null },
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { topics: true }
          },
          topics: {
            where: { isArchived: false },
            orderBy: { updatedAt: "desc" },
            include: {
              author: true,
              _count: {
                select: { posts: true }
              },
              topicViews: {
                where: { userId: userId || "" }
              }
            }
          },
          subForums: {
            include: {
              topics: {
                include: {
                  topicViews: {
                    where: { userId: userId || "" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', margin: 0 }}>Le Forum France <span>Blood Bowl</span></h1>
          <p style={{ color: '#888', margin: 0 }}>L'espace de discussion de la communauté Blood Bowl française</p>
        </div>
      </header>

      <div className="forum-layout">
        <div className="forum-main-content">
          <DeletionToast />
          {categories.map((category) => {
            // Check if category has any unread topics (including sub-forums)
            const categoryHasNew = category.forums.some(forum => {
              const directUnread = forum.topics.some(topic => {
                const view = topic.topicViews[0];
                return !view || topic.updatedAt > view.lastViewedAt;
              });
              const subUnread = forum.subForums.some(sub =>
                sub.topics.some(topic => {
                  const view = topic.topicViews[0];
                  return !view || topic.updatedAt > view.lastViewedAt;
                })
              );
              return directUnread || subUnread;
            });

            return (
              <ForumCategory 
                key={category.id} 
                category={category} 
                categoryHasNew={categoryHasNew} 
              />
            );
          })}
        </div>
        <ForumSidebar />
      </div>
    </main>
  );
}
