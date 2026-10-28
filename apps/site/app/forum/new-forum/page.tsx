import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft } from "lucide-react";
import "../page.css";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { redirect } from "next/navigation";
import { createForum, getCategories, getAllForums } from "../actions";
import NewForumForm from "./component/NewForumForm";


export default async function NewForumPage({ searchParams }: { searchParams: Promise<{ categoryId?: string, parentForumId?: string }> }) {
  const { categoryId, parentForumId } = await searchParams;
  const session = await auth();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    redirect("/forum");
  }

  const categories = await getCategories();
  const allForums = await getAllForums();

  return (
    <main className="container forum-container">
      <PageHeader
        title={<>Créer un <span>nouveau forum</span></>}
        subtitle="Ajoutez une nouvelle section ou un sous-forum à la communauté"
        backHref="/forum"
        backTitle="Retour au forum"
      />
 
      <div className="forum-layout" style={{ display: 'block' }}>
        <div className="forum-main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NewForumForm 
            categories={categories}
            allForums={allForums}
            initialCategoryId={categoryId}
            initialParentForumId={parentForumId}
            createAction={createForum}
          />
        </div>
      </div>
    </main>
  );
}
