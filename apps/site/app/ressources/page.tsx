"use client";

/**
 * Liste des ressources `/ressources` (refonte, carte 096, ADR 0006) : un annuaire d'outils, de guides et d'aides de
 * jeu proposés par les membres et validés par la modération. Les outils officiels du site passent en premier.
 * En-tête compact « Ressources » avec le nombre de ressources trouvées et le bouton « Proposer une ressource » ; puis
 * la barre de recherche et d'affichage (`ResourceListControls`) et les ressources en grille ou en liste, 20 par page
 * (pagination `PageNav`). Sur ordinateur, le filtre par tags est dans une colonne à gauche ; sur téléphone, une seule
 * colonne, et ce filtre est rangé dans le panneau « Filtrer les ressources ».
 * La liste est chargée dans la page par l'action serveur `getResources`. Depuis la carte 196, la recherche, les tags,
 * l'affichage et la page sont écrits dans l'adresse (`?q=…&tags=…&vue=liste&page=2`) : un lien partagé ou un retour
 * depuis une ressource retrouve la même liste. La recherche est lancée 300 millisecondes après la dernière touche.
 */
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Card, ConfirmDialog, PageNav, Skeleton, toast } from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { useDebounce } from "@/common/hooks/useDebounce";
import { readList, readPositiveInt, useSyncUrlFilters } from "@/common/hooks/useUrlFilters";
import { isAdmin, isModerator } from "@/lib/roles";
import { deleteResourceAction, getResources, getResourceTags } from "./actions";
import ResourceCard, { type ResourceListItem } from "./component/ResourceCard";
import { ResourceFilterAside, ResourceListControls, type ResourceView } from "./component/ResourceFilters";

const PAGE_SIZE = 20;

// useSearchParams demande une limite Suspense (exigence de Next.js) ; la liste a déjà ses propres cartes grises
export default function RessourcesPage() {
  return (
    <Suspense fallback={null}>
      <RessourcesList />
    </Suspense>
  );
}

function RessourcesList() {
  const { data: session } = useSession();
  // Réglages de départ lus dans l'adresse (carte 196)
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 300);
  const [tags, setTags] = useState<string[]>(() => readList(searchParams.get("tags")));
  // Une seule présentation, en lignes (DESIGN.md) : l'ancien paramètre « vue » est ignoré
  const view: ResourceView = "list";
  const [page, setPage] = useState(() => readPositiveInt(searchParams.get("page"), 1));
  useSyncUrlFilters({ q: debouncedQuery.trim(), tags, vue: view === "list" ? "liste" : "", page }, { page: 1 });
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
  // Action principale : en haut du panneau gauche sur ordinateur, dans l'en-tête sur téléphone (DESIGN.md)
  const submitHref = user?.id ? "/ressources/submit" : null;

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
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
        {submitHref && (
          <Button asChild variant="primary" size="tap" className="lg:hidden">
            <Link href={submitHref}>Proposer une ressource</Link>
          </Button>
        )}
      </ForumListHeader>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
        <ResourceFilterAside tags={tags} onTagsChange={changeTags} availableTags={availableTags} submitHref={submitHref} />

        <section aria-label="Ressources trouvées" aria-busy={loading} className="flex min-w-0 flex-col gap-4">
          <ResourceListControls
            total={total}
            query={query}
            onQueryChange={changeQuery}
            tags={tags}
            onTagsChange={changeTags}
            availableTags={availableTags}
          />

          {loading || !data ? (
            // Chargement : des lignes grises, à l'image de la liste qui s'affiche ensuite
            <div className="flex flex-col overflow-hidden rounded-bb-lg border border-bb-border" aria-label="Chargement des ressources">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-none border-b border-bb-border last:border-b-0" />
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
                <div className="grid gap-3 sm:grid-cols-2">
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
            <p className="rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-5 text-bb-text-muted">
              Aucune ressource ne correspond. Essaie d&apos;autres mots ou d&apos;autres tags, ou propose la tienne.
            </p>
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
 * Droits sur une ressource, inchangés depuis avant la refonte : un outil officiel n'est modifiable que par
 * un administrateur et ne peut pas être supprimé ; les autres ressources sont modifiables et supprimables par leur
 * auteur et par la modération.
 */
function rights(resource: ResourceListItem, user: { id?: string; role?: string } | undefined) {
  const isAuthor = !!user?.id && user.id === resource.authorId;
  const isMod = isModerator(user?.role);
  const isSystem = resource.isSystem;
  return {
    canEdit: isSystem ? isAdmin(user?.role) : isMod || isAuthor,
    canDelete: !isSystem && (isMod || isAuthor),
  };
}
