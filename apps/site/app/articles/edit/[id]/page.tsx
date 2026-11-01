/**
 * Modification d'un article `/articles/edit/[id]` (refonte, carte 095) : le même formulaire que la création
 * (`ArticleForm`), prérempli, dans un écran de rédaction plein écran sur téléphone.
 * Ouvert à l'auteur et à la modération ; un autre membre est renvoyé vers l'article, un visiteur vers la connexion.
 */
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ArticleForm from "@/app/articles/component/ArticleForm";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getActiveSession();
  if (!session) redirect(`/auth/login?callbackUrl=/articles/edit/${id}`);

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: true,
      // Ligue rattachée, pour la montrer déjà choisie dans le formulaire (sinon l'enregistrer l'effaçait, carte 140)
      ligue: { select: { id: true, name: true, acronym: true, region: true, geographicalZone: true } }
    }
  });

  if (!article) notFound();

  if (article.authorId !== session.user.id && !isModerator(session.user.role)) {
    redirect(`/articles/${id}`);
  }

  const initialData = {
    id: article.id,
    title: article.title,
    content: article.content,
    tags: article.tags.map(t => t.name),
    ligueId: article.ligueId,
    ligueCustom: article.ligueCustom,
    ligue: article.ligue
  };

  return (
    <ComposeScreen
      title="Modifier l'article"
      subtitle={article.title}
      backHref={`/articles/${id}`}
      backTitle="Retour à l'article"
    >
      <ArticleForm initialData={initialData} isEdit={true} />
    </ComposeScreen>
  );
}
