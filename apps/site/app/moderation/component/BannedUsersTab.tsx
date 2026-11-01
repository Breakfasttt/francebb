"use client";

/**
 * Onglet « Coachs bannis » de la modération (refonte, carte 099) : les membres bannis, 10 par page, avec l'auteur, le
 * motif et la date du bannissement, et un bouton « Débannir » (confirmé dans une fenêtre). Une seule liste de fiches,
 * sur ordinateur comme sur téléphone (avant la refonte : un tableau sur ordinateur). Les actions `getBannedUsers` et
 * `unbanUserAction` sont inchangées ; le serveur refuse de débannir un membre de rang égal ou supérieur.
 */
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageNav, Skeleton, toast } from "@bbfrance/ui";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import { getBannedUsers, unbanUserAction } from "../actions";

const PAGE_SIZE = 10;

export default function BannedUsersTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- membres renvoyés par getBannedUsers
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [unbanning, setUnbanning] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getBannedUsers(page);
    setUsers(data.users);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé à chaque changement de page
  }, [page]);

  const onConfirmUnban = async () => {
    if (!selectedUserId) return;
    setUnbanning(true);
    const res = await unbanUserAction(selectedUserId);
    setUnbanning(false);
    setSelectedUserId(null);

    if (res.success) {
      toast.success("Utilisateur débanni");
      fetchUsers();
    } else {
      toast.error(res.error || "Erreur serveur");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <UserX size={20} className="text-bb-danger-text" aria-hidden="true" />
        <h2 className="m-0 flex-1 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic">Coachs bannis</h2>
        {!(loading && users.length === 0) && <Badge variant="danger">{total} banni{total > 1 ? "s" : ""}</Badge>}
      </div>

      <Card className="overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex flex-col gap-3 p-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={<UserCheck size={32} />} title="Aucun utilisateur banni pour le moment." />
        ) : (
          <ul aria-label="Coachs bannis" className={`m-0 list-none p-0 ${loading ? "opacity-60" : ""}`}>
            {users.map((user) => (
              <li key={user.id} className="flex flex-col gap-3 border-b border-bb-border px-4 py-3 last:border-b-0 lg:flex-row lg:items-center lg:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-bb-text">
                      <MemberAvatarImage image={user.image} className="size-8 shrink-0 rounded-full object-cover" />
                      <span className="truncate">{user.name || "Inconnu"}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-bb-text-muted">
                      <Clock size={14} aria-hidden="true" />
                      {new Date(user.bannedAt).getTime() > 0 ? format(new Date(user.bannedAt), "dd/MM/yyyy", { locale: fr }) : "Date inconnue"}
                    </span>
                  </div>
                  <p className="m-0 flex items-center gap-1.5 text-sm text-bb-text-muted">
                    <ShieldAlert size={14} aria-hidden="true" />
                    Banni par <span className="font-semibold text-bb-text">{user.bannedBy}</span>
                  </p>
                  <p className="m-0 text-[0.95rem] break-words text-bb-text">
                    <span className="text-sm font-semibold text-bb-text-muted">Motif : </span>
                    {user.banReason || "Non spécifié"}
                  </p>
                </div>
                <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={() => setSelectedUserId(user.id)}>
                  <UserCheck size={16} aria-hidden="true" />
                  Débannir
                </Button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center border-t border-bb-border p-3">
            <PageNav page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={selectedUserId !== null}
        onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}
        title="Débannir l'utilisateur"
        message="Voulez-vous vraiment débannir cet utilisateur ? Il pourra à nouveau se connecter et participer sur le site."
        confirmLabel="Débannir"
        pending={unbanning}
        onConfirm={onConfirmUnban}
      />
    </div>
  );
}
