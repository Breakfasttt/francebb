/**
 * Création d'un forum, réservée aux modérateurs (refonte, carte 088). `?categoryId=` et `?parentForumId=`
 * préremplissent l'emplacement (liens « Nouveau forum » de l'accueil du forum et de la page d'un forum).
 */
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { redirect } from "next/navigation";
import { createForum, getCategories, getAllForums } from "../actions";
import ForumListHeader from "../component/ForumListHeader";
import NewForumForm from "./component/NewForumForm";


export default async function NewForumPage({ searchParams }: { searchParams: Promise<{ categoryId?: string, parentForumId?: string }> }) {
  const { categoryId, parentForumId } = await searchParams;
  const session = await getActiveSession();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    redirect("/forum");
  }

  const categories = await getCategories();
  const allForums = await getAllForums();

  return (
    <div className="mx-auto w-full max-w-[760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Créer un forum"
        subtitle="Ajoutez une nouvelle section ou un sous-forum à la communauté."
        backHref="/forum"
        backTitle="Retour au forum"
      />
      <NewForumForm
        categories={categories}
        allForums={allForums}
        initialCategoryId={categoryId}
        initialParentForumId={parentForumId}
        createAction={createForum}
      />
    </div>
  );
}
