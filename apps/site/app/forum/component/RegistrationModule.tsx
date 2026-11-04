"use client";

/**
 * Module d'inscription d'un tournoi, dans le sujet du forum du tournoi (refonte, carte 089, ADR 0006).
 * - En-tête : le bouton « Gestion des inscriptions » (avec le nombre d'inscrits) déplie les listes ; « Inscriptions
 *   closes » quand l'organisateur les a fermées ; puis l'action du membre connecté : se pré-inscrire ou annuler son
 *   inscription (tournoi individuel), inscrire une équipe ou se déclarer mercenaire, modifier ou désinscrire son
 *   équipe (tournoi par équipes). Sur téléphone, ces boutons prennent toute la largeur.
 * - Listes : pré-inscriptions, inscriptions validées, liste d'attente (et mercenaires pour un tournoi par équipes).
 *   L'organisateur, ses commissaires (et les modérateurs, via la page) y changent le statut d'inscription et de
 *   paiement de chaque coach ou équipe, avec des boutons de 44 pixels.
 * - Fenêtres : inscription ou modification d'une équipe, détails d'une équipe, confirmations. Ce sont des panneaux
 *   qui montent du bas sur téléphone (composants `Sheet` et `ConfirmDialog` de packages/ui).
 * Les actions serveur appelées sont les mêmes qu'avant la refonte.
 * Ce module s'exécute dans le navigateur : il ne reçoit que des données publiques, plus l'état de paiement pour ceux
 * qui gèrent le tournoi (carte 174, voir `RegistrationTournament`).
 */
import { useState, useTransition, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Clock, ListOrdered, Lock, Pencil, Plus, UserMinus, UserPlus, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, ConfirmDialog, CountBadge, DESKTOP_QUERY, Field, Input, Select, Sheet, SheetContent, cn, toast, useMediaQuery } from "@bbfrance/ui";
import {
  joinTournament,
  leaveTournament,
  updateRegistrationStatus,
  createTeam,
  updateTeam,
  deleteTeam,
  toggleMercenary
} from "../actions";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import type { PublicTournamentMercenary, PublicTournamentRegistration, PublicTournamentTeam } from "@/lib/forumPostPrivacy";

/**
 * Le tournoi tel que la page du sujet le confie à ce module (carte 174) : seulement les champs lus ici. L'état de
 * paiement des inscriptions et des équipes n'est présent que pour l'organisateur, ses commissaires et la modération.
 */
export interface RegistrationTournament {
  id: string;
  date: Date;
  isTeam: boolean;
  coachsPerTeam: number;
  isFinished: boolean;
  registrationsLocked: boolean;
  registrations: PublicTournamentRegistration[];
  teams: PublicTournamentTeam[];
  mercenaries: PublicTournamentMercenary[];
}

interface RegistrationModuleProps {
  tournament: RegistrationTournament;
  currentUser: any;
  isOrganizer: boolean;
  isCommissioner: boolean;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  label: string;
  action: () => Promise<void>;
}

export default function RegistrationModule({ tournament, currentUser, isOrganizer, isCommissioner }: RegistrationModuleProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<any | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, title: "", message: "", label: "", action: async () => {} });

  const canManage = isOrganizer || isCommissioner;
  const isOver = new Date(tournament.date) < new Date();
  const isActionBlocked = tournament.registrationsLocked || tournament.isFinished || isOver;

  // -- Inscription Individuelle --
  const isRegistered = tournament.registrations?.some((r: any) => r.userId === currentUser?.id);

  const handleJoin = () => {
    startTransition(async () => {
      const res = await joinTournament(tournament.id);
      if (res.success) toast.success("Pré-inscription réussie !");
      else toast.error(res.error || "Erreur");
    });
  };

  const openConfirm = (title: string, message: string, label: string, action: () => Promise<void>) => {
    setConfirm({ open: true, title, message, label, action });
  };

  const handleLeave = () => {
    openConfirm("Désinscription", "Voulez-vous vraiment annuler votre inscription à ce tournoi ?", "Quitter le tournoi", async () => {
      const res = await leaveTournament(tournament.id);
      if (res.success) toast.success("Désinscription effectuée");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleCreateTeamSubmit = () => {
    if (!newTeamName.trim()) {
      toast.error("Veuillez donner un nom à votre équipe");
      return;
    }

    startTransition(async () => {
      const res = editingTeamId
        ? await updateTeam(editingTeamId, newTeamName, selectedMembers.map(m => m.id))
        : await createTeam(tournament.id, newTeamName, selectedMembers.map(m => m.id));

      if (res.success) {
        toast.success(editingTeamId ? "Équipe mise à jour !" : "Équipe inscrite avec succès !");
        setIsTeamModalOpen(false);
        setEditingTeamId(null);
        setNewTeamName("");
        setSelectedMembers([]);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const openEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    setNewTeamName(team.name);
    setSelectedMembers(team.members?.map((m: any) => m.user) || []);
    setIsTeamModalOpen(true);
  };

  const userTeam = tournament.teams?.find((t: any) =>
    t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id)
  );
  const isUserInTeam = !!userTeam;
  const isCaptain = userTeam?.captainId === currentUser?.id;

  const handleToggleMercenary = () => {
    startTransition(async () => {
      const res = await toggleMercenary(tournament.id);
      if (res.success) toast.success("Statut mercenaire mis à jour");
      else toast.error(res.error || "Erreur");
    });
  };

  const isMercenary = tournament.mercenaries?.some((m: any) => m.userId === currentUser?.id);

  const handleDeleteTeam = (teamId: string) => {
    openConfirm("Supprimer l'équipe", "Voulez-vous vraiment supprimer votre équipe ? Tous les membres seront désinscrits.", "Supprimer l'équipe", async () => {
      const res = await deleteTeam(teamId);
      if (res.success) toast.success("Équipe supprimée");
      else toast.error(res.error || "Erreur");
    });
  };

  const totalInscrits = (tournament.registrations?.length || 0) + (tournament.teams?.length || 0);
  const actionButton = "w-full sm:w-auto";

  // Action du membre connecté
  let userActions: ReactNode = null;
  if (currentUser) {
    if (tournament.isTeam) {
      // Équipe : toujours montrer la gestion de son équipe ; sinon, « Inscrire une équipe » seulement si c'est ouvert
      userActions = isUserInTeam ? (
        isCaptain ? (
          <>
            <Button type="button" variant="secondary" size="tap" className={actionButton} onClick={() => openEditTeam(userTeam)} disabled={isPending}>
              <Pencil size={16} aria-hidden="true" /> Modifier mon équipe
            </Button>
            <Button type="button" variant="danger" size="tap" className={actionButton} onClick={() => handleDeleteTeam(userTeam.id)} disabled={isPending}>
              <UserMinus size={16} aria-hidden="true" /> Désinscrire mon équipe
            </Button>
          </>
        ) : (
          <Badge variant="success" className="px-2.5 py-1.5 text-sm">Inscrit avec l&apos;équipe {userTeam.name}</Badge>
        )
      ) : (
        <>
          {!isActionBlocked && (
            <Button type="button" variant="primary" size="tap" className={actionButton} onClick={() => setIsTeamModalOpen(true)} disabled={isPending}>
              <Plus size={16} aria-hidden="true" /> Inscrire une équipe
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="tap"
            className={cn(actionButton, isMercenary && "border-bb-accent-text text-bb-accent-text")}
            onClick={handleToggleMercenary}
            disabled={isPending || isActionBlocked}
            aria-pressed={isMercenary}
          >
            {isMercenary ? "Retirer mercenaire" : "Être mercenaire"}
          </Button>
        </>
      );
    } else {
      // Individuel : toujours montrer « Annuler mon inscription » ; « Me pré-inscrire » seulement si c'est ouvert
      userActions = isRegistered ? (
        <Button type="button" variant="danger" size="tap" className={actionButton} onClick={handleLeave} disabled={isPending}>
          <UserMinus size={16} aria-hidden="true" /> Annuler mon inscription
        </Button>
      ) : (
        !isActionBlocked && (
          <Button type="button" variant="primary" size="tap" className={actionButton} onClick={handleJoin} disabled={isPending}>
            <UserPlus size={16} aria-hidden="true" /> Me pré-inscrire
          </Button>
        )
      );
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm({ ...confirm, open })}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.label}
        danger
        pending={isPending}
        onConfirm={() =>
          startTransition(async () => {
            await confirm.action();
            setConfirm({ ...confirm, open: false });
          })
        }
      />

      <Sheet open={!!selectedTeamDetails} onOpenChange={(open) => !open && setSelectedTeamDetails(null)}>
        <SheetContent title={`Détails de l'équipe : ${selectedTeamDetails?.name ?? ""}`} side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-4 pt-1 pb-3">
            <section>
              <h3 className="m-0 mb-2 border-0 p-0 text-xs font-bold tracking-wide text-bb-text-muted uppercase not-italic">Capitaine</h3>
              <MemberLine user={selectedTeamDetails?.captain} size={40} />
            </section>
            <section>
              <h3 className="m-0 mb-2 border-0 p-0 text-xs font-bold tracking-wide text-bb-text-muted uppercase not-italic">
                Membres ({selectedTeamDetails?.members?.length || 0})
              </h3>
              {selectedTeamDetails?.members?.length === 0 && <p className="m-0 text-sm text-bb-text-muted italic">Aucun membre additionnel</p>}
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {selectedTeamDetails?.members?.map((m: any) => (
                  <li key={m.id} className="rounded-bb-md bg-bb-surface-2 px-3 py-2">
                    <MemberLine user={m.user} size={32} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center lg:p-4">
          <Button
            type="button"
            variant="quiet"
            className="min-h-11 min-w-0 flex-1 justify-start gap-2 rounded-bb-md px-1 text-left text-base whitespace-normal text-bb-text hover:bg-transparent"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Users size={18} aria-hidden="true" className="text-bb-accent-text" />
            <span>Gestion des inscriptions</span>
            <CountBadge count={totalInscrits} max={999} aria-label={`${totalInscrits} inscrit${totalInscrits > 1 ? "s" : ""}`} />
            <ChevronDown size={18} aria-hidden="true" className={cn("ml-auto shrink-0 text-bb-text-muted transition-transform lg:ml-1", isExpanded && "rotate-180")} />
          </Button>

          {tournament.registrationsLocked && (
            <Badge variant="danger" className="self-start px-2 py-1 text-sm lg:self-center">
              <Lock size={14} aria-hidden="true" /> Inscriptions closes
            </Badge>
          )}

          {userActions && <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{userActions}</div>}
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-5 border-t border-bb-border p-3 lg:p-4">
            {tournament.isTeam ? (
              <TeamRegistrationMode
                tournament={tournament}
                currentUser={currentUser}
                canManage={canManage}
                onShowTeamDetails={setSelectedTeamDetails}
              />
            ) : (
              <IndividualRegistrationMode
                tournament={tournament}
                canManage={canManage}
              />
            )}
          </div>
        )}
      </Card>

      {/* Inscription ou modification d'une équipe */}
      <Sheet
        open={isTeamModalOpen}
        onOpenChange={(open) => {
          setIsTeamModalOpen(open);
          if (!open) setEditingTeamId(null);
        }}
      >
        <SheetContent title={editingTeamId ? "Modifier l'équipe" : "Inscrire une équipe"} side={isDesktop ? "center" : "bottom"}>
          <form
            className="flex flex-col gap-4 pt-1 pb-2"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateTeamSubmit();
            }}
          >
            <Field label="Nom de l'équipe" htmlFor="team-name">
              <Input id="team-name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Ex : Les Gorets de Nurgle" required />
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-sm font-semibold text-bb-text">
                Membres de l&apos;équipe ({selectedMembers.length + 1} / {tournament.coachsPerTeam})
              </p>
              <p className="m-0 text-sm text-bb-text-muted">
                Vous êtes automatiquement inclus comme capitaine. Ajoutez vos {tournament.coachsPerTeam - 1} coéquipiers.
              </p>
              <UserSearch
                selectedUsers={selectedMembers}
                onSelect={(u) => setSelectedMembers([...selectedMembers, u])}
                onRemove={(id) => setSelectedMembers(selectedMembers.filter(u => u.id !== id))}
                maxSelections={tournament.coachsPerTeam - 1}
                placeholder="Chercher un coéquipier..."
              />
            </div>
            <div className="flex flex-col gap-2 lg:flex-row-reverse">
              <Button type="submit" variant="primary" size="tap" className="w-full lg:w-auto" disabled={isPending}>
                {editingTeamId ? "Enregistrer les modifications" : "Valider l'inscription"}
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={() => setIsTeamModalOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Avatar et pseudo d'un membre. */
function MemberLine({ user, size }: { user: any; size: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={user?.name || "?"} src={user?.image} size={size} />
      <span className="min-w-0 font-semibold break-words text-bb-text">{user?.name}</span>
    </span>
  );
}

function IndividualRegistrationMode({ tournament, canManage }: any) {
  const preReg = (tournament.registrations || []).filter((r: any) => r.status === "PRE_REGISTERED");
  const registered = (tournament.registrations || []).filter((r: any) => r.status === "REGISTERED")
                     .sort((a: any, b: any) => (a.user.name || "").localeCompare(b.user.name || ""));
  const waiting = (tournament.registrations || []).filter((r: any) => r.status === "WAITING_LIST");

  return (
    <>
      <RegistrationSection title="Pré-inscriptions" items={preReg} canManage={canManage} icon={<Clock size={16} />} />
      <RegistrationSection title="Validées" items={registered} canManage={canManage} icon={<CheckCircle2 size={16} />} showPayment />
      <RegistrationSection title="Liste d'attente" items={waiting} canManage={canManage} icon={<AlertCircle size={16} />} />
    </>
  );
}

function TeamRegistrationMode({ tournament, currentUser, canManage, onShowTeamDetails }: any) {
  const preRegTeams = (tournament.teams || []).filter((t: any) => t.status === "PRE_REGISTERED");
  const registeredTeams = (tournament.teams || []).filter((t: any) => t.status === "REGISTERED");
  const waitingTeams = (tournament.teams || []).filter((t: any) => t.status === "WAITING_LIST");
  const mercenaries = tournament.mercenaries || [];

  return (
    <>
      <RegistrationSection title="Pré-inscriptions" items={preRegTeams} type="TEAM" canManage={canManage} icon={<Clock size={16} />} onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Validées" items={registeredTeams} type="TEAM" canManage={canManage} icon={<CheckCircle2 size={16} />} showPayment onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Liste d'attente" items={waitingTeams} type="TEAM" canManage={canManage} icon={<AlertCircle size={16} />} onShowTeamDetails={onShowTeamDetails} />

      <section>
        <SectionTitle icon={<Users size={16} />} title="Mercenaires" count={mercenaries.length} />
        {mercenaries.length === 0 && <p className="m-0 text-sm text-bb-text-muted italic">Aucun mercenaire disponible</p>}
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {mercenaries.map((m: any) => (
            <li key={m.id} className="flex items-center gap-2 rounded-full border border-bb-border bg-bb-surface-2 py-1 pr-3 pl-1 text-sm">
              <Avatar name={m.user.name || "?"} src={m.user.image} size={28} />
              <span className="font-semibold text-bb-text">{m.user.name}</span>
              {m.userId === currentUser?.id && <span className="font-semibold text-bb-accent-text">(moi)</span>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function SectionTitle({ icon, title, count }: { icon: ReactNode; title: string; count: number }) {
  return (
    <h3 className="m-0 mb-2 flex items-center gap-2 border-0 p-0 text-sm font-bold text-bb-text normal-case not-italic">
      <span aria-hidden="true" className="text-bb-text-muted">{icon}</span>
      {title} ({count})
    </h3>
  );
}

function RegistrationSection({ title, items, type = "PLAYER", canManage, icon, showPayment, onShowTeamDetails }: any) {
  return (
    <section>
      <SectionTitle icon={icon} title={title} count={items.length} />
      {items.length === 0 ? (
        <p className="m-0 text-sm text-bb-text-muted italic">Aucun</p>
      ) : (
        <ul className="m-0 list-none overflow-hidden rounded-bb-md border border-bb-border p-0">
          {items.map((item: any) => (
            <RegistrationItem key={item.id} item={item} type={type} canManage={canManage} showPayment={showPayment} onShowTeamDetails={onShowTeamDetails} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RegistrationItem({ item, type, canManage, showPayment, onShowTeamDetails }: any) {
  const [isPending, startTransition] = useTransition();
  const name = type === "TEAM" ? item.name : item.user.name;

  const moveStatus = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateRegistrationStatus({ type, id: item.id, status: newStatus });
      if (res.success) toast.success("Statut mis à jour");
      else toast.error(res.error || "Erreur");
    });
  };

  const handlePaymentStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      await updateRegistrationStatus({
        type,
        id: item.id,
        status: item.status,
        paymentStatus: e.target.value
      });
    });
  };

  const statusButton = (status: string, label: string, icon: ReactNode) =>
    item.status !== status && (
      <Button type="button" variant="secondary" size="tap-icon" title={label} aria-label={label} onClick={() => moveStatus(status)} disabled={isPending}>
        {icon}
      </Button>
    );

  return (
    <li className="flex flex-col gap-2 border-b border-bb-border px-3 py-2 last:border-b-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        {type === "PLAYER" ? (
          <MemberLine user={item.user} size={32} />
        ) : (
          <Button
            type="button"
            variant="quiet"
            className="h-auto min-h-11 w-full flex-col items-start justify-center gap-0 rounded-bb-sm px-1 py-1 text-left whitespace-normal hover:bg-bb-surface-2"
            onClick={() => onShowTeamDetails?.(item)}
            aria-label={`Voir les détails de l'équipe ${item.name}`}
          >
            <span className="text-[0.95rem] font-bold break-words text-bb-accent-text">{item.name}</span>
            <span className="text-sm break-words text-bb-text-muted">
              Capitaine : {item.captain?.name}
              {item.members?.length > 0 && <> · Coéquipiers : {item.members.map((m: any) => m.user?.name).join(", ")}</>}
            </span>
          </Button>
        )}
      </div>

      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          {showPayment && (
            <Select
              defaultValue={item.paymentStatus}
              onChange={handlePaymentStatus}
              disabled={isPending}
              aria-label={`Statut de paiement de ${name}`}
              className="w-auto min-w-0 flex-1 sm:flex-none"
            >
              <option value="NOT_PAID">🚫 En attente</option>
              <option value="PAID">✅ Payé</option>
              <option value="AT_TOURNAMENT">🏠 Sur place</option>
              <option value="GUEST">🎁 Invité</option>
            </Select>
          )}
          {statusButton("REGISTERED", `Valider l'inscription de ${name}`, <CheckCircle2 size={18} aria-hidden="true" className="text-bb-success-text" />)}
          {statusButton("PRE_REGISTERED", `Remettre ${name} en pré-inscription`, <Clock size={18} aria-hidden="true" />)}
          {statusButton("WAITING_LIST", `Mettre ${name} en liste d'attente`, <ListOrdered size={18} aria-hidden="true" className="text-bb-warning-text" />)}
        </div>
      )}
    </li>
  );
}
