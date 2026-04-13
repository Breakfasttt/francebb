import { ArrowLeft } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import "./page.css";
import "./page-mobile.css";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ForumCategory from "@/app/forum/component/ForumCategory";
import DeletionToast from "@/app/forum/component/DeletionToast";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const categories = await prisma.category.findMany({
    where: !userId ? { allowedRoles: "ALL" } : undefined,
    orderBy: { order: "asc" },
    include: {
      forums: {
        where: { 
          parentForumId: null,
          ...( !userId ? { allowedRoles: "ALL" } : {} )
        },
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
            where: !userId ? { allowedRoles: "ALL" } : {},
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
      <PageHeader
        title={<>Le Forum France <span>Blood Bowl</span></>}
        subtitle="L'espace de discussion de la communauté Blood Bowl française"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="forum-layout">
        <div className="forum-main-content">
          <DeletionToast />
          {categories.map((category) => {
            // Check if category has any unread topics (including sub-forums)
            const categoryHasNew = userId ? category.forums.some(forum => {
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
            }) : false;

            return (
              <ForumCategory 
                key={category.id} 
                category={category} 
                categoryHasNew={categoryHasNew} 
                currentUserId={userId}
              />
            );
          })}
        </div>
        <ForumSidebar />
      </div>
    </main>
  );
}
