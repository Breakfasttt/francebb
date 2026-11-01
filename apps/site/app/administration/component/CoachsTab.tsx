"use client";

/**
 * Onglet « Membres & accès » de l'administration (refonte, carte 099) : chercher un coach par son pseudo et changer son
 * rôle. On ne peut donner qu'un rôle inférieur au sien (sauf le super administrateur), et jamais le rôle de super
 * administrateur. Les rôles sont affichés par leur libellé (« Modérateur »), lu dans la table RoleConfig. Les actions
 * `getAllRoles`, `searchCoaches` et `updateCoachRole` sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { Loader2, Lock, Search, Users } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState, Field, Input, PageNav, Select, toast } from "@bbfrance/ui";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { useDebounce } from "@/common/hooks/useDebounce";
import { getRoleLabel, getRolePower, isModerator } from "@/lib/roles";
import { getAllRoles, searchCoaches, updateCoachRole } from "../actions";

interface CoachsTabProps {
  currentUserRole: string;
  isSuperAdmin: boolean;
}

const USERS_PER_PAGE = 10;

export default function CoachsTab({ currentUserRole, isSuperAdmin }: CoachsTabProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- membres renvoyés par searchCoaches
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rôles renvoyés par getAllRoles
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const myPower = getRolePower(currentUserRole);
  const roleLabels = Object.fromEntries(dbRoles.map((role) => [role.name, role.label]));

  const availableRoles = dbRoles
    .filter((role) => role.name !== "SUPERADMIN")
    .filter((role) => isSuperAdmin || role.power < myPower)
    .sort((a, b) => b.power - a.power);

  /** Affiche une page de résultats de searchCoaches. */
  const showPage = (data: Awaited<ReturnType<typeof searchCoaches>>, page: number) => {
    setUsers(data.users);
    setTotalPages(data.totalPages);
    setCurrentPage(page);
    setIsLoading(false);
  };

  const loadUsers = async (searchQuery: string, page: number = 1) => {
    showPage(await searchCoaches(searchQuery, page, USERS_PER_PAGE), page);
  };

  useEffect(() => {
    getAllRoles().then(setDbRoles);
  }, []);

  // Recherche relancée une demi-seconde après la dernière frappe, en repartant de la première page
  useEffect(() => {
    searchCoaches(debouncedQuery, 1, USERS_PER_PAGE).then((data) => showPage(data, 1));
  }, [debouncedQuery]);

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      const res = await updateCoachRole(userId, newRole);
      if (res.success) {
        toast.success("Rôle mis à jour");
        loadUsers(query, currentPage);
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Users size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Rôles des membres</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        <p className="m-0 text-[0.95rem] text-bb-text-muted">
          Recherchez un coach pour lui donner un nouveau rôle. Vous ne pouvez donner que des rôles{" "}
          <strong className="text-bb-text">inférieurs au vôtre</strong>.
        </p>
        <Field label="Rechercher un coach" htmlFor="coach-search">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
            <Input
              id="coach-search"
              type="text"
              enterKeyHint="search"
              placeholder="Pseudo du coach"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsLoading(true);
              }}
              className="pr-10 pl-10"
            />
            {isLoading && (
              <Loader2 size={18} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-bb-text-muted" aria-label="Recherche en cours" />
            )}
          </div>
        </Field>
      </CardBody>

      {!isLoading && users.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="Aucun utilisateur trouvé">
          Essayez une autre recherche.
        </EmptyState>
      ) : (
        <ul aria-label="Membres" className={`m-0 list-none border-t border-bb-border p-0 ${isLoading ? "opacity-60" : ""}`}>
          {users.map((user) => {
            const power = getRolePower(user.role);
            const isSuper = user.role === "SUPERADMIN";
            const canManage = isSuperAdmin || (myPower > power && !isSuper);
            const label = getRoleLabel(user.role, roleLabels);

            return (
              <li key={user.id} className="flex flex-col gap-3 border-b border-bb-border px-4 py-3 last:border-b-0 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <UserAvatar
                    image={user.image}
                    name={user.name}
                    size={40}
                    postCount={user._count?.posts || 0}
                    selectedRank={user.avatarFrame}
                    isModerator={isModerator(user.role)}
                  />
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    <span className="max-w-full truncate font-semibold text-bb-text">{user.name}</span>
                    <Badge variant={isModerator(user.role) ? "outline" : "neutral"}>{label}</Badge>
                  </span>
                </div>
                {canManage ? (
                  <Select
                    aria-label={`Rôle de ${user.name}`}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                    className="lg:w-56"
                  >
                    <option value={user.role} disabled>{label} (actuel)</option>
                    {availableRoles.filter((role) => role.name !== user.role).map((role) => (
                      <option key={role.name} value={role.name}>{role.label}</option>
                    ))}
                  </Select>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-bb-md border border-bb-border px-3 text-sm text-bb-text-muted lg:w-56">
                    <Lock size={14} aria-hidden="true" />
                    Action restreinte
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center border-t border-bb-border p-3">
          <PageNav page={currentPage} totalPages={totalPages} onPageChange={(page) => loadUsers(query, page)} />
        </div>
      )}
    </Card>
  );
}
