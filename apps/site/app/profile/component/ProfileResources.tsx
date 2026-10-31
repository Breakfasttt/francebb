"use client";

/**
 * Onglet « Mes ressources » du profil (refonte, carte 092) : les ressources que le membre a proposées, 5 par page,
 * avec leur statut (en attente, validée ou refusée), un lien pour les ouvrir, « Éditer » et « Supprimer » (après
 * confirmation). Les actions `getUserResources` et `deleteResourceAction` sont inchangées.
 */
import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, Edit, ExternalLink, Layout, Trash2, XCircle } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, ConfirmDialog, CountBadge, EmptyState, PageNav, Skeleton, toast } from "@bbfrance/ui";
import { getUserResources, deleteResourceAction } from "@/app/ressources/actions";

interface ProfileResourcesProps {
  userId: string;
}

type Resource = { id: string; title: string; description: string; link: string; status: string; createdAt: string | Date };

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success"><CheckCircle size={12} aria-hidden="true" /> Validée</Badge>;
  if (status === "REJECTED") return <Badge variant="danger"><XCircle size={12} aria-hidden="true" /> Refusée</Badge>;
  return <Badge variant="neutral"><AlertCircle size={12} aria-hidden="true" /> En attente</Badge>;
}

export default function ProfileResources({ userId }: ProfileResourcesProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ page: number; resources: Resource[]; totalPages: number } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async (target: number) => {
    const result = await getUserResources(userId, target, 5);
    setData({ page: target, resources: result.resources as Resource[], totalPages: result.totalPages });
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    getUserResources(userId, page, 5).then((result) => {
      if (!cancelled) setData({ page, resources: result.resources as Resource[], totalPages: result.totalPages });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteResourceAction(deletingId);
      if (res.success) {
        toast.success("Ressource supprimée.");
        setDeletingId(null);
        await load(page);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const loading = !data || data.page !== page;

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <Layout size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Mes ressources soumises</CardTitle>
          {data && <CountBadge count={data.resources.length} />}
        </CardHeader>
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : data.resources.length === 0 ? (
          <EmptyState
            icon={<Layout size={32} />}
            title="Aucune ressource soumise"
            action={
              <Button asChild variant="secondary" size="tap">
                <Link href="/ressources">Voir toutes les ressources <ExternalLink size={16} aria-hidden="true" /></Link>
              </Button>
            }
          >
            Vous n&apos;avez pas encore partagé de ressource avec la communauté.
          </EmptyState>
        ) : (
          <ul className="m-0 list-none p-0">
            {data.resources.map((res) => (
              <li key={res.id} className="flex flex-col gap-2 border-b border-bb-border px-4 py-3 last:border-b-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="m-0 min-w-0 flex-1 border-0 p-0 text-base font-bold tracking-normal break-words text-bb-text normal-case not-italic">
                    {res.title}
                  </h3>
                  <StatusBadge status={res.status} />
                </div>
                {res.description && <p className="m-0 line-clamp-3 text-sm break-words text-bb-text-muted">{res.description}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-bb-text-muted">
                    <Clock size={14} aria-hidden="true" /> Soumise le {format(new Date(res.createdAt), "dd/MM/yyyy", { locale: fr })}
                  </span>
                  <a href={res.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-bb-accent-text">
                    Ouvrir le lien <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <span className="ml-auto flex gap-2">
                    <Button asChild variant="secondary" size="tap">
                      <Link href={`/ressources/edit/${res.id}`}><Edit size={16} aria-hidden="true" /> Éditer</Link>
                    </Button>
                    <Button type="button" variant="quiet" size="tap" className="text-bb-danger-text" onClick={() => setDeletingId(res.id)}>
                      <Trash2 size={16} aria-hidden="true" /> Supprimer
                    </Button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {data && <PageNav page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        title="Supprimer la ressource"
        message="Voulez-vous vraiment supprimer cette ressource ? Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        pending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
