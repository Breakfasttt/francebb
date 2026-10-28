import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArticleForm from "@/app/articles/component/ArticleForm";

export default async function CreateArticlePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <main className="container">
      <PageHeader 
        title="Créer un article" 
        subtitle="Partagez votre expertise ou vos aventures avec la communauté."
        backHref="/articles"
      />
      
      <ArticleForm />
    </main>
  );
}
