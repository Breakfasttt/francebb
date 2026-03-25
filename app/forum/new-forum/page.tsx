import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft } from "lucide-react";
import "../page.css";
import Link from "next/link";
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
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Créer un <span>nouveau forum</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Ajoutez une nouvelle section ou un sous-forum à la communauté</p>
        </div>
      </header>
 
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
