import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArticleForm from "@/app/articles/component/ArticleForm";
import { isModerator } from "@/lib/roles";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/auth/login?callbackUrl=/articles/edit/${id}`);

  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!article) notFound();

  const sessionUser = session.user as any;
  if (article.authorId !== sessionUser.id && !isModerator(sessionUser.role)) {
    redirect(`/articles/${id}`);
  }

  const initialData = {
    id: article.id,
    title: article.title,
    content: article.content,
    tags: article.tags.map(t => t.name)
  };

  return (
    <main className="container">
      <PageHeader 
        title="Modifier l'article" 
        subtitle={`Édition de : ${article.title}`}
        backHref={`/articles/${id}`}
      />
      
      <ArticleForm initialData={initialData} isEdit={true} />
    </main>
  );
}
