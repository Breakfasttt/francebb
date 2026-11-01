"use client";

/**
 * Onglet « Ressources à valider » de la modération (refonte, carte 099) : les ressources proposées par les membres,
 * 10 par page, avec leur image, leur description, leur auteur et leur lien. Trois actions par ressource : « Éditer »
 * (page de modification), « Refuser » et « Approuver ». Les actions `getPendingResources` et `moderateResource`
 * (app/ressources/actions.ts) sont inchangées.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Clock, Edit, ExternalLink, Layout, User, X } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageNav, Skeleton, toast } from "@bbfrance/ui";
import { getPendingResources, moderateResource } from "@/app/ressources/actions";

interface ResourceModerationTabProps {
  onActionSuccess?: () => void;
}

const PAGE_SIZE = 10;

export default function ResourceModerationTab({ onActionSuccess }: ResourceModerationTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ressources renvoyées par getPendingResources
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Ressource en cours de traitement : ses boutons sont désactivés le temps de la réponse
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResources = async () => {
    setLoading(true);
    const data = await getPendingResources(page);
    setResources(data.resources);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé à chaque changement de page
  }, [page]);

  const handleModerate = async (id: string, action: "APPROVE" | "REJECT") => {
    setBusyId(id);
    try {
      const res = await moderateResource(id, action);
      if (res.success) {
        toast.success(action === "APPROVE" ? "Ressource approuvée" : "Ressource rejetée");
        fetchResources();
        onActionSuccess?.();
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Layout size={20} className="text-bb-text-muted" aria-hidden="true" />
        <h2 className="m-0 flex-1 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic">Ressources à valider</h2>
        <Badge variant="neutral">{total} en attente</Badge>
      </div>

      {loading && resources.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <EmptyState icon={<Layout size={32} />} title="Aucune soumission en attente." />
        </Card>
      ) : (
        <div className={`flex flex-col gap-3 ${loading ? "opacity-60" : ""}`}>
          {resources.map((res) => (
            <Card key={res.id} className="overflow-hidden">
              <article aria-label={res.title} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-start lg:gap-4">
                {res.imageUrl && (
                  // Image externe choisie par l'auteur de la ressource : balise <img> simple
                  <img src={res.imageUrl} alt="" className="h-40 w-full shrink-0 rounded-bb-md border border-bb-border object-cover lg:size-20" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h3 className="m-0 border-0 p-0 text-base font-bold break-words text-bb-text normal-case not-italic">{res.title}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-bb-text-muted">
                      <Clock size={14} aria-hidden="true" />
                      {formatDistanceToNow(new Date(res.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  {res.description && <p className="m-0 text-[0.95rem] break-words text-bb-text-muted">{res.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 text-sm">
                    <span className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-bb-text lg:min-h-0">
                      <User size={14} aria-hidden="true" />
                      {res.author.name}
                    </span>
                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-0 items-center gap-1.5 font-semibold text-bb-accent-text lg:min-h-0">
                      <ExternalLink size={14} aria-hidden="true" />
                      Lien externe
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-bb-border pt-3 lg:flex lg:shrink-0 lg:border-t-0 lg:pt-0">
                  <Button asChild variant="secondary" size="tap" className="px-2">
                    <Link href={`/ressources/edit/${res.id}`}>
                      <Edit size={16} aria-hidden="true" />
                      Éditer
                    </Link>
                  </Button>
                  <Button type="button" variant="secondary" size="tap" className="px-2 text-bb-danger-text" disabled={busyId === res.id} onClick={() => handleModerate(res.id, "REJECT")}>
                    <X size={16} aria-hidden="true" />
                    Refuser
                  </Button>
                  <Button type="button" variant="primary" size="tap" className="order-first col-span-2 px-2 lg:order-none" disabled={busyId === res.id} onClick={() => handleModerate(res.id, "APPROVE")}>
                    <Check size={16} aria-hidden="true" />
                    Approuver
                  </Button>
                </div>
              </article>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <PageNav page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </div>
      )}
    </div>
  );
}
