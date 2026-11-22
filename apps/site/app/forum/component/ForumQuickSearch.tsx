/**
 * Champ « Rechercher dans le forum » de l'accueil du forum : un simple formulaire qui ouvre la recherche avancée
 * (`/forum/search?q=…`). Sur téléphone, il est en haut de la page, visible sans défiler ; sur ordinateur, dans le
 * panneau gauche. Sans JavaScript côté navigateur : la touche Entrée ou la loupe envoient le formulaire.
 */
import { Search } from "lucide-react";
import { Button, Input } from "@bbfrance/ui";

export default function ForumQuickSearch({ id, placeholder = "Rechercher dans le forum", className = "" }: { id: string; placeholder?: string; className?: string }) {
  return (
    <form action="/forum/search" method="get" role="search" aria-label="Rechercher dans le forum" className={`flex min-w-0 items-center gap-2 ${className}`}>
      <label htmlFor={id} className="sr-only">Rechercher dans le forum</label>
      <Input id={id} name="q" type="search" placeholder={placeholder} enterKeyHint="search" className="min-w-0 flex-1" />
      <Button type="submit" variant="secondary" size="tap-icon" aria-label="Lancer la recherche" className="shrink-0">
        <Search size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
