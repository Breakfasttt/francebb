/**
 * Création d'un article `/articles/create` (refonte, carte 095) : écran de rédaction plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas), avec la barre d'envoi collée en bas de l'écran.
 * Réservé aux membres connectés : un visiteur est envoyé vers la page de connexion.
 */
import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authGuard";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ArticleForm from "@/app/articles/component/ArticleForm";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur
import "@/app/forum/page.css";

export default async function CreateArticlePage() {
  const session = await getActiveSession();
  if (!session) redirect("/auth/login");

  return (
    <ComposeScreen
      title="Créer un article"
      subtitle="Partagez votre expertise ou vos aventures avec la communauté."
      backHref="/articles"
      backTitle="Retour aux articles"
    >
      <ArticleForm />
    </ComposeScreen>
  );
}
