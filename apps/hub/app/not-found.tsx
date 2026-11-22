/** Page introuvable du hub : en français, avec un retour au passeport (jamais vers une application, ADR-0007). */
import { buttonVariants } from "@bbfrance/ui";
import CenteredCard from "./components/CenteredCard";
import { Muted } from "./components/Messages";

export default function NotFound() {
  return (
    <CenteredCard title="Page introuvable">
      <Muted>Cette adresse ne mène à aucune page du passeport. Le lien est peut-être ancien ou mal recopié.</Muted>
      <a href="/" className={buttonVariants({ variant: "secondary", size: "tap" })}>Aller à mon passeport</a>
    </CenteredCard>
  );
}
