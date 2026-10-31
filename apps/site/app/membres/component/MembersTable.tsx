"use client";

/**
 * Annuaire des membres `/membres` (refonte, carte 092, ADR 0006). Tout se passe dans le navigateur, comme avant la
 * refonte : recherche par nom, filtres par rôle, région et ligue, tri, 25 membres par page.
 * - Sur ordinateur : la recherche et les filtres au-dessus d'un tableau ; un clic sur un en-tête de colonne trie la
 *   liste (de A à Z, puis de Z à A au second clic).
 * - Sur téléphone : la recherche reste visible ; les filtres et le tri sont rangés dans le panneau « Filtrer les
 *   membres », ouvert par le bouton « Filtres » (qui indique combien de filtres sont actifs). Un membre par carte.
 * Les filtres actifs sont rappelés en pastilles, chacune avec une croix qui le retire.
 * Pour un modérateur : les bannis sont affichés, « Bannir » ou « Débannir » et « Supprimer » (super administrateur)
 * sont dans le menu « ⋯ » de chaque membre, et le rôle se change avec la liste « Changer le rôle ». Chaque action
 * demande une confirmation. Les actions serveur sont inchangées.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Ban, Mail, Search, SearchX, SlidersHorizontal, Trash2, UserCheck, X } from "lucide-react";
import {
  ActionMenu, Badge, Button, Card, ConfirmDialog, CountBadge, DESKTOP_QUERY, EmptyState, Field, Input, PageNav, Select,
  Sheet, SheetContent, toast, useMediaQuery,
} from "@bbfrance/ui";
import {
  ROLE_LABELS, UserRole, canEditTargetRole, getAllowedRolesToAssign, canManageRoles, isModerator, getRoleLabel, getRolePower,
} from "@/lib/roles";
import { updateUserRole, toggleBanUser, deleteUser } from "@/app/membres/actions";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import BanUserDialog from "@/common/components/BanUserDialog/BanUserDialog";

const USERS_PER_PAGE = 25;

type SortKey = "name" | "role" | "naf" | "region" | "ligue";
type SortConfig = { key: SortKey; direction: "asc" | "desc" } | null;

interface Member {
  id: string;
  name: string;
  image?: string | null;
  role: string;
  isBanned: boolean;
  nafNumber?: string | null;
  region?: string | null;
  ligues?: { id: string; name: string; acronym: string }[];
}

interface Props {
  users: Member[];
  currentUserRole: UserRole;
  currentUserId: string;
  allLigues: { id: string; name: string; acronym: string }[];
  allRegions: { key: string; label: string }[];
  /** Libellés des rôles lus dans la table RoleConfig (rôles personnalisés compris). */
  roleLabels?: Record<string, string>;
}

const nafHref = (naf: string) => `https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${naf}`;

/** Ordre de chaque tri (repris tel quel d'avant la refonte). */
function compare(a: Member, b: Member, { key, direction }: { key: SortKey; direction: "asc" | "desc" }): number {
  const sign = direction === "asc" ? 1 : -1;
  const order = (x: string | number, y: string | number) => (x < y ? -sign : x > y ? sign : 0);
  if (key === "name") return order(a.name.toLowerCase(), b.name.toLowerCase());
  // Rôles : le plus puissant d'abord dans l'ordre croissant
  if (key === "role") return -order(getRolePower(a.role), getRolePower(b.role));
  if (key === "naf") {
    const nafA = a.nafNumber ? parseInt(a.nafNumber, 10) : Infinity;
    const nafB = b.nafNumber ? parseInt(b.nafNumber, 10) : Infinity;
    if (nafA === Infinity && nafB === Infinity) return 0;
    return order(nafA, nafB);
  }
  if (key === "region") return order(a.region || "", b.region || "");
  return order(a.ligues?.[0]?.acronym || "", b.ligues?.[0]?.acronym || "");
}

export default function MembersTable({ users, currentUserRole, currentUserId, allLigues, allRegions, roleLabels }: Props) {
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLigue, setSelectedLigue] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [roleModal, setRoleModal] = useState<{ userId: string; userName: string; newRole: UserRole } | null>(null);
  const [banModal, setBanModal] = useState<{ userId: string; userName: string; isBanned: boolean } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ userId: string; userName: string } | null>(null);

  /** Changer la recherche, un filtre ou le tri ramène à la première page. */
  const change = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };
  const setSearch = change(setSearchTerm);
  const setRole = change(setSelectedRole);
  const setRegion = change(setSelectedRegion);
  const setLigue = change(setSelectedLigue);
  const setSort = change(setSortConfig);

  const roleLabel = (role: string) => getRoleLabel(role, roleLabels);
  const regionLabel = (key?: string | null) => allRegions.find((r) => r.key === key)?.label || key || "";
  const ligueLabel = (id: string) => {
    const ligue = allLigues.find((l) => l.id === id);
    return ligue ? `[${ligue.acronym}] ${ligue.name}` : id;
  };

  const confirmRoleChange = () => {
    if (!roleModal) return;
    startTransition(async () => {
      try {
        const res = await updateUserRole(roleModal.userId, roleModal.newRole);
        if (res.success) toast.success("Rôle mis à jour");
        else toast.error(res.error || "Erreur lors du changement de rôle");
      } catch {
        toast.error("Erreur lors du changement de rôle");
      } finally {
        setRoleModal(null);
      }
    });
  };

  const confirmBanToggle = (reason: string) => {
    if (!banModal) return;
    const isBanning = !banModal.isBanned;
    if (isBanning && !reason.trim()) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }
    startTransition(async () => {
      try {
        const res = await toggleBanUser(banModal.userId, isBanning, reason);
        if (res.success) {
          toast.success(isBanning ? "Utilisateur banni" : "Utilisateur débanni");
          setBanModal(null);
          router.refresh();
        } else {
          toast.error(res.error || "Erreur lors de l'opération");
        }
      } catch {
        toast.error("Erreur lors de l'opération");
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    startTransition(async () => {
      try {
        const res = await deleteUser(deleteModal.userId);
        if (res.success) {
          toast.success("Utilisateur supprimé (contenus rattachés au compte fantôme)");
          router.refresh();
        } else {
          toast.error(res.error || "Erreur lors de la suppression du membre");
        }
      } catch {
        toast.error("Erreur lors de la suppression du membre");
      } finally {
        setDeleteModal(null);
      }
    });
  };

  const showRoles = canManageRoles(currentUserRole);
  const showMod = isModerator(currentUserRole);
  const showDelete = currentUserRole === "SUPERADMIN";
  const selectableRoles = getAllowedRolesToAssign(currentUserRole);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "" || u.role === selectedRole;
    const matchesRegion = selectedRegion === "" || u.region === selectedRegion;
    const matchesLigue = selectedLigue === "" || u.ligues?.some((l) => l.id === selectedLigue);
    return matchesSearch && matchesRole && matchesRegion && matchesLigue;
  });
  const sortedUsers = sortConfig ? [...filteredUsers].sort((a, b) => compare(a, b, sortConfig)) : filteredUsers;
  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    const direction = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSort({ key, direction });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedRegion("");
    setSelectedLigue("");
    setCurrentPage(1);
  };

  const activeFilters = [
    selectedRole && { label: `Rôle : ${roleLabel(selectedRole)}`, clear: () => setRole("") },
    selectedRegion && { label: `Région : ${regionLabel(selectedRegion)}`, clear: () => setRegion("") },
    selectedLigue && { label: `Ligue : ${ligueLabel(selectedLigue)}`, clear: () => setLigue("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const countText = `${sortedUsers.length} membre${sortedUsers.length > 1 ? "s" : ""}`;

  /** Les trois filtres, dans la barre (ordinateur) ou dans le panneau (téléphone). */
  const filterFields = (prefix: string) => (
    <>
      <Field label="Rôle" htmlFor={`${prefix}-role`}>
        <Select id={`${prefix}-role`} value={selectedRole} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </Select>
      </Field>
      <Field label="Région" htmlFor={`${prefix}-region`}>
        <Select id={`${prefix}-region`} value={selectedRegion} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Toutes les régions</option>
          {allRegions.map((region) => <option key={region.key} value={region.key}>{region.label}</option>)}
        </Select>
      </Field>
      <Field label="Ligue" htmlFor={`${prefix}-ligue`}>
        <Select id={`${prefix}-ligue`} value={selectedLigue} onChange={(e) => setLigue(e.target.value)}>
          <option value="">Toutes les ligues</option>
          {allLigues.map((ligue) => <option key={ligue.id} value={ligue.id}>[{ligue.acronym}] {ligue.name}</option>)}
        </Select>
      </Field>
    </>
  );

  const roleBadge = (role: string) => {
    const power = getRolePower(role);
    return <Badge variant={power >= 90 ? "accent" : power >= 70 ? "outline" : "neutral"}>{roleLabel(role)}</Badge>;
  };

  /** Liste « Changer le rôle », ou « Verrouillé » quand ce membre est de rang égal ou supérieur. */
  const roleSelect = (user: Member) =>
    canEditTargetRole(currentUserRole, user.role as UserRole) ? (
      <Select
        aria-label={`Changer le rôle de ${user.name}`}
        value={user.role}
        disabled={isPending}
        onChange={(e) => setRoleModal({ userId: user.id, userName: user.name, newRole: e.target.value as UserRole })}
      >
        <option value={user.role} disabled>Changer le rôle…</option>
        {selectableRoles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
      </Select>
    ) : (
      <span className="text-sm text-bb-text-muted italic">Verrouillé</span>
    );

  /** Menu « ⋯ » d'un membre : bannir ou débannir, supprimer. */
  const actionMenu = (user: Member) => {
    const canModerate = canEditTargetRole(currentUserRole, user.role as UserRole) || currentUserRole === "SUPERADMIN";
    return (
      <ActionMenu
        label={`Actions pour ${user.name}`}
        title={user.name}
        items={[
          {
            label: user.isBanned ? "Débannir" : "Bannir",
            icon: user.isBanned ? <UserCheck size={18} aria-hidden="true" /> : <Ban size={18} aria-hidden="true" />,
            hidden: !showMod || !canModerate,
            onSelect: () => setBanModal({ userId: user.id, userName: user.name, isBanned: user.isBanned }),
          },
          {
            label: "Supprimer",
            icon: <Trash2 size={18} aria-hidden="true" />,
            danger: true,
            hidden: !showDelete,
            onSelect: () => setDeleteModal({ userId: user.id, userName: user.name }),
          },
        ]}
      />
    );
  };

  const nameLink = (user: Member) => (
    <Link href={`/spy/${user.id}`} className="inline-flex min-h-11 min-w-0 items-center gap-2.5 font-semibold text-bb-text no-underline hover:underline">
      <MemberAvatarImage image={user.image} className="size-8 shrink-0 rounded-full object-cover" />
      <span className="min-w-0 break-words">{user.name}</span>
    </Link>
  );

  const ligueBadges = (user: Member) =>
    user.ligues && user.ligues.length > 0
      ? user.ligues.map((l) => <Badge key={l.id} variant="neutral" title={l.name}>{l.acronym}</Badge>)
      : <span className="text-bb-text-muted">—</span>;

  const nafCell = (user: Member) =>
    user.nafNumber ? (
      <a href={nafHref(user.nafNumber)} target="_blank" rel="noopener noreferrer" className="font-semibold text-bb-accent-text">
        {user.nafNumber}
      </a>
    ) : <span className="text-bb-text-muted">—</span>;

  const canMessage = (user: Member) => user.id !== currentUserId && !user.isBanned;

  const sortHeader = (key: SortKey, label: string) => {
    const active = sortConfig?.key === key;
    const direction = active ? sortConfig?.direction : undefined;
    const Icon = !direction ? ArrowUpDown : direction === "asc" ? ArrowDown : ArrowUp;
    return (
      <th scope="col" className="p-0" aria-sort={direction ? (direction === "asc" ? "ascending" : "descending") : undefined}>
        <Button
          type="button"
          variant="quiet"
          onClick={() => handleSort(key)}
          className="min-h-11 w-full justify-start gap-1.5 rounded-none px-3 text-xs font-bold tracking-wide uppercase"
        >
          {label}
          <Icon size={14} aria-hidden="true" className={active ? "text-bb-accent-text" : "opacity-50"} />
        </Button>
      </th>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Recherche, bouton « Filtres » (téléphone) et filtres (ordinateur) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex items-end gap-2 lg:w-80 lg:shrink-0">
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
            <Input
              type="text"
              enterKeyHint="search"
              aria-label="Rechercher un coach par son nom"
              placeholder="Rechercher un coach…"
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="button" variant="secondary" size="tap" className="shrink-0 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" /> Filtres
            <CountBadge count={activeFilters.length} />
          </Button>
        </div>
        <div className="hidden flex-1 gap-3 lg:grid lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          {filterFields("members-filter")}
          <Button type="button" variant="quiet" size="tap" onClick={resetFilters}>Réinitialiser</Button>
        </div>
      </div>

      {/* Nombre de résultats et filtres actifs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-bb-text-muted" aria-live="polite">{countText}</span>
        {activeFilters.map((f) => (
          <Button
            key={f.label}
            type="button"
            variant="secondary"
            size="sm"
            aria-label={`Retirer le filtre ${f.label}`}
            onClick={f.clear}
            className="min-h-9 gap-1 rounded-full px-3 font-semibold"
          >
            {f.label} <X size={14} aria-hidden="true" />
          </Button>
        ))}
      </div>

      {paginatedUsers.length === 0 ? (
        <Card>
          <EmptyState icon={<SearchX size={32} />} title="Aucun membre ne correspond à vos critères de recherche.">
            Essayez un autre nom ou retirez un filtre.
          </EmptyState>
        </Card>
      ) : (
        <>
          {/* Ordinateur : tableau */}
          <Card className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-[0.95rem]">
              <thead className="border-b border-bb-border bg-bb-surface-2 text-bb-text-muted">
                <tr>
                  {sortHeader("name", "Utilisateur")}
                  {sortHeader("role", "Rôle")}
                  {sortHeader("naf", "N° NAF")}
                  {sortHeader("region", "Région")}
                  {sortHeader("ligue", "Ligue(s)")}
                  <th scope="col" className="px-3 text-xs font-bold tracking-wide uppercase">Message</th>
                  {showRoles && <th scope="col" className="px-3 text-xs font-bold tracking-wide uppercase">Gestion du rôle</th>}
                  {(showMod || showDelete) && <th scope="col" className="px-3"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className={`border-b border-bb-border last:border-b-0 ${user.isBanned ? "bg-bb-surface-2" : ""}`}>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {nameLink(user)}
                        {user.isBanned && <Badge variant="danger"><Ban size={12} aria-hidden="true" /> Banni</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">{roleBadge(user.role)}</td>
                    <td className="px-3 py-1.5">{nafCell(user)}</td>
                    <td className="px-3 py-1.5 text-bb-text-muted">{regionLabel(user.region) || "—"}</td>
                    <td className="px-3 py-1.5"><div className="flex flex-wrap gap-1">{ligueBadges(user)}</div></td>
                    <td className="px-3 py-1.5">
                      {canMessage(user) && (
                        <Button asChild variant="secondary" size="tap" className="px-3">
                          <Link href={`/messagerie?userId=${user.id}`}><Mail size={16} aria-hidden="true" /> Message privé</Link>
                        </Button>
                      )}
                    </td>
                    {showRoles && <td className="min-w-48 px-3 py-1.5">{roleSelect(user)}</td>}
                    {(showMod || showDelete) && <td className="px-1 py-1.5 text-right">{actionMenu(user)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Téléphone : un membre par carte */}
          <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
            {paginatedUsers.map((user) => (
              <li key={user.id}>
                <Card className={`flex flex-col gap-3 p-4 ${user.isBanned ? "bg-bb-surface-2" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      {nameLink(user)}
                      <div className="flex flex-wrap gap-1.5">
                        {roleBadge(user.role)}
                        {user.isBanned && <Badge variant="danger"><Ban size={12} aria-hidden="true" /> Banni</Badge>}
                      </div>
                    </div>
                    {(showMod || showDelete) && actionMenu(user)}
                  </div>

                  <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div className="flex flex-col">
                      <dt className="text-bb-text-muted">N° NAF</dt>
                      <dd className="m-0">{nafCell(user)}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-bb-text-muted">Région</dt>
                      <dd className="m-0 break-words text-bb-text">{regionLabel(user.region) || "—"}</dd>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <dt className="text-bb-text-muted">Ligue(s)</dt>
                      <dd className="m-0 flex flex-wrap gap-1 pt-0.5">{ligueBadges(user)}</dd>
                    </div>
                  </dl>

                  {canMessage(user) && (
                    <Button asChild variant="secondary" size="tap" className="w-full">
                      <Link href={`/messagerie?userId=${user.id}`}><Mail size={16} aria-hidden="true" /> Message privé</Link>
                    </Button>
                  )}
                  {showRoles && canEditTargetRole(currentUserRole, user.role as UserRole) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-bb-text" aria-hidden="true">Rôle</span>
                      {roleSelect(user)}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex justify-center">
        <PageNav
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* Téléphone : panneau des filtres et du tri */}
      <Sheet open={filtersOpen && !isDesktop} onOpenChange={setFiltersOpen}>
        <SheetContent title="Filtrer les membres">
          <div className="flex flex-col gap-4 pt-1 pb-2">
            {filterFields("members-sheet")}
            <Field label="Trier par" htmlFor="members-sheet-sort">
              <Select
                id="members-sheet-sort"
                value={sortConfig ? `${sortConfig.key}_${sortConfig.direction}` : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return setSort(null);
                  const [key, direction] = value.split("_") as [SortKey, "asc" | "desc"];
                  setSort({ key, direction });
                }}
              >
                <option value="">Ordre alphabétique</option>
                <option value="name_desc">Nom (Z-A)</option>
                <option value="role_asc">Rôle</option>
                <option value="naf_asc">N° NAF</option>
                <option value="region_asc">Région</option>
                <option value="ligue_asc">Ligue</option>
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="tap" className="flex-1" onClick={resetFilters}>Réinitialiser</Button>
              <Button type="button" variant="primary" size="tap" className="flex-1" onClick={() => setFiltersOpen(false)}>
                Voir {countText}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Fenêtres de confirmation */}
      <ConfirmDialog
        open={!!roleModal}
        onOpenChange={(open) => { if (!open) setRoleModal(null); }}
        title={roleModal ? `Changer le rôle de ${roleModal.userName}` : "Changer le rôle"}
        message={roleModal ? `Voulez-vous vraiment donner le rôle « ${ROLE_LABELS[roleModal.newRole]} » à ${roleModal.userName} ?` : ""}
        pending={isPending}
        onConfirm={confirmRoleChange}
      />

      <BanUserDialog
        open={!!banModal}
        onOpenChange={(open) => { if (!open) setBanModal(null); }}
        userName={banModal?.userName ?? ""}
        isBanned={banModal?.isBanned ?? false}
        pending={isPending}
        onConfirm={confirmBanToggle}
      />

      <Sheet open={!!deleteModal} onOpenChange={(open) => { if (!open) setDeleteModal(null); }}>
        <SheetContent
          title="Suppression définitive"
          side={isDesktop ? "center" : "bottom"}
          description={deleteModal ? `Supprimer le compte de ${deleteModal.userName}. Cette action est irréversible.` : undefined}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex flex-col gap-3 pt-1 pb-2 text-[0.95rem] leading-relaxed">
            <p className="m-0 text-bb-text-muted">
              Le compte et ses données privées (messages privés, réactions, inscriptions) seront supprimés. Ses sujets,
              messages du forum, articles et résultats seront rattachés au compte « Coach Inconnu ».
            </p>
            <p className="m-0 rounded-bb-md border border-bb-border bg-bb-surface-2 p-3 text-bb-text">
              <strong>Rappel :</strong> cette suppression sert uniquement à retirer les faux comptes, les comptes en
              erreur ou les comptes abandonnés. Pour la modération habituelle, préférez le bannissement.
            </p>
            <div className="flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
              <Button type="button" variant="danger" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={confirmDelete}>
                <Trash2 size={18} aria-hidden="true" /> Confirmer la suppression
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={() => setDeleteModal(null)}>
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
