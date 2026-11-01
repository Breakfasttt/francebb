"use client";

/**
 * Liste des ressources `/ressources` (refonte, carte 096, ADR 0006) : un annuaire d'outils, de guides et d'aides de
 * jeu proposés par les membres et validés par la modération. Les outils officiels du site passent en premier.
 * En-tête compact « Ressources » avec le nombre de ressources trouvées et le bouton « Soumettre une ressource » ; puis
 * la barre de recherche et d'affichage (`ResourceListControls`) et les ressources en grille ou en liste, 20 par page
 * (pagination `PageNav`). Sur ordinateur, le filtre par tags est dans une colonne à gauche ; sur téléphone, une seule
 * colonne, et ce filtre est rangé dans le panneau « Filtrer les ressources ».
 * La liste est chargée dans la page par l'action serveur `getResources`, comme avant la refonte : la recherche, les
 * tags, l'affichage et la page ne sont pas écrits dans l'adresse. La recherche est lancée 300 millisecondes après la
 * dernière touche.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, Plus } from "lucide-react";
import { Button, Card, ConfirmDialog, EmptyState, PageNav, Skeleton, toast } from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { useDebounce } from "@/common/hooks/useDebounce";
import { isAdmin, isModerator } from "@/lib/roles";
import { deleteResourceAction, getResources, getResourceTags } from "./actions";
import ResourceCard, { type ResourceListItem } from "./component/ResourceCard";
import { ResourceFilterAside, ResourceListControls, type ResourceView } from "./component/ResourceFilters";

const PAGE_SIZE = 20;

export default function RessourcesPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [tags, setTags] = useState<string[]>([]);
  const [view, setView] = useState<ResourceView>("grid");
  const [page, setPage] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  // Dernier résultat reçu, avec la clé de la demande qui l'a produit : tant que la clé ne correspond pas aux réglages
  // actuels (y compris pendant les 300 millisecondes d'attente après une touche), une nouvelle liste est en cours de
  // chargement : des cartes grises remplacent alors les résultats, comme la roue de chargement d'avant la refonte. On
  // n'affiche jamais une liste qui ne correspond plus à la recherche tapée.
  const [result, setResult] = useState<{ key: string; data: { resources: ResourceListItem[]; total: number; totalPages: number } } | null>(null);
  // Augmenté après une suppression, pour recharger la page de résultats
  const [reloadCount, setReloadCount] = useState(0);
  const [deleting, setDeleting] = useState<ResourceListItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const searchText = debouncedQuery.trim();
  const requestKey = JSON.stringify([searchText, tags, page, reloadCount]);
  useEffect(() => {
    // Une réponse arrivée après un nouveau réglage est ignorée
    let outdated = false;
    getResources({ query: searchText, tags, page, pageSize: PAGE_SIZE }).then((data) => {
      if (!outdated) setResult({ key: requestKey, data });
    });
    return () => {
      outdated = true;
    };
  }, [requestKey, searchText, tags, page]);
  const data = result?.data ?? null;
  const loading = result?.key !== requestKey || query.trim() !== searchText;

  // Suggestions du filtre par tags : tous les tags existants, chargés une fois
  useEffect(() => {
    getResourceTags().then(setAvailableTags);
  }, []);

  // Changer un filtre ramène à la première page des résultats
  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const changeTags = (value: string[]) => {
    setTags(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    const res = await deleteResourceAction(deleting.id);
    setDeletePending(false);
    if (res.success) {
      toast.success("Ressource supprimée");
      setDeleting(null);
      setReloadCount((count) => count + 1);
    } else {
      toast.error(res.error || "Erreur");
    }
  };

  const user = session?.user as { id?: string; role?: string } | undefined;
  const total = data?.total ?? 0;
  const resources = data?.resources ?? [];

  // Carte 141 : le bouton n'est montré qu'aux membres connectés (un visiteur serait renvoyé vers la connexion)
  const submitButton = user?.id ? (
    <Button asChild variant="primary" size="tap">
      <Link href="/ressources/submit" className="no-underline">
        <Plus size={18} aria-hidden="true" />
        {/* Un seul bloc de texte : l'écart entre l'icône et le texte ne s'ajoute pas avant « une ressource » */}
        <span>Soumettre<span className="max-sm:sr-only"> une ressource</span></span>
      </Link>
    </Button>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Ressources"
        subtitle={
          data
            ? `Outils et guides pour les coachs · ${total} ressource${total > 1 ? "s" : ""} trouvée${total > 1 ? "s" : ""}`
            : "Outils et guides pour les coachs"
        }
        backHref="/"
        backTitle="Retour à l'accueil"
      >
        {submitButton}
      </ForumListHeader>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <ResourceFilterAside tags={tags} onTagsChange={changeTags} availableTags={availableTags} />

        <section aria-label="Ressources trouvées" aria-busy={loading} className="flex min-w-0 flex-col gap-4">
          <ResourceListControls
            total={total}
            query={query}
            onQueryChange={changeQuery}
            view={view}
            onViewChange={setView}
            tags={tags}
            onTagsChange={changeTags}
            availableTags={availableTags}
          />

          {loading || !data ? (
            // Chargement : des cartes grises à la place des ressources
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Chargement des ressources">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-72 rounded-bb-lg" />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className="flex flex-col gap-4">
              {view === "list" ? (
                <Card className="overflow-hidden">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} view="list" {...rights(resource, user)} onDelete={() => setDeleting(resource)} />
                  ))}
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} {...rights(resource, user)} onDelete={() => setDeleting(resource)} />
                  ))}
                </div>
              )}

              {data.totalPages > 1 && (
                <div className="flex justify-center">
                  <PageNav
                    page={page}
                    totalPages={data.totalPages}
                    onPageChange={(target) => {
                      setPage(target);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <EmptyState icon={<BookOpen size={40} />} title="Aucune ressource trouvée" action={submitButton}>
                Aucune ressource ne correspond à vos critères. Essayez d&apos;autres mots ou d&apos;autres tags, ou proposez la vôtre !
              </EmptyState>
            </Card>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer la ressource"
        message={deleting ? `La ressource « ${deleting.title} » sera supprimée définitivement.` : ""}
        confirmLabel="Supprimer"
        danger
        pending={deletePending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/**
 * Droits sur une ressource, inchangés depuis avant la refonte : un outil officiel (ou bbscheme) n'est modifiable que par
 * un administrateur et ne peut pas être supprimé ; les autres ressources sont modifiables et supprimables par leur
 * auteur et par la modération.
 */
function rights(resource: ResourceListItem, user: { id?: string; role?: string } | undefined) {
  const isAuthor = !!user?.id && user.id === resource.authorId;
  const isMod = isModerator(user?.role);
  const isSystem = resource.isSystem || resource.id === "bbscheme";
  return {
    canEdit: isSystem ? isAdmin(user?.role) : isMod || isAuthor,
    canDelete: !isSystem && (isMod || isAuthor),
  };
}
