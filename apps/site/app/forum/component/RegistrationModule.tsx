"use client";

/**
 * Module d'inscription d'un tournoi, dans le sujet du forum du tournoi (refonte, carte 089, ADR 0006).
 * - En tête, une phrase dit au membre connecté où il en est (« Tu es inscrit », « Tu es pré-inscrit… », liste
 *   d'attente avec sa place, mercenaire, équipe) : revue 221, avant il ne voyait que son bouton.
 * - En-tête : le bouton « Gestion des inscriptions » (avec le nombre d'inscrits, compté comme la fiche et la liste
 *   des tournois) déplie les listes, ouvertes d'office pour l'organisateur ; « Inscriptions fermées » quand
 *   l'organisateur les a fermées ; puis l'action du membre connecté : se pré-inscrire ou retirer son inscription
 *   (tournoi individuel), inscrire une équipe ou se déclarer mercenaire, modifier ou désinscrire son équipe (tournoi
 *   par équipes). Sur téléphone, ces boutons prennent toute la largeur. Un tournoi terminé n'affiche plus ce module :
 *   les résultats prennent sa place.
 * - Listes : pré-inscriptions, inscriptions validées, liste d'attente (et mercenaires pour un tournoi par équipes).
 *   L'organisateur, ses commissaires (et les modérateurs, via la page) y changent le statut d'inscription et de
 *   paiement de chaque coach ou équipe, avec des boutons de 44 pixels qui disent ce qu'ils font.
 * - Fenêtres : inscription ou modification d'une équipe, détails d'une équipe, confirmations. Ce sont des panneaux
 *   qui montent du bas sur téléphone (composants `Sheet` et `ConfirmDialog` de packages/ui).
 * Les actions serveur appelées sont les mêmes qu'avant la refonte. Depuis la carte 186, le capitaine choisit ses
 * coéquipiers parmi les mercenaires (cases à cocher) au lieu d'une recherche parmi tous les membres, et le serveur
 * vérifie toutes les règles (taille, coach dans une seule équipe, tournoi ouvert).
 * Ce module s'exécute dans le navigateur : il ne reçoit que des données publiques, plus l'état de paiement pour ceux
 * qui gèrent le tournoi (carte 174, voir `RegistrationTournament`).
 */
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Pencil, Plus, UserMinus, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, Card, ConfirmDialog, DESKTOP_QUERY, Field, Input, Select, Sheet, SheetContent, cn, toast, useMediaQuery } from "@bbfrance/ui";
import {
  joinTournament,
  leaveTournament,
  updateRegistrationStatus,
  createTeam,
  updateTeam,
  deleteTeam,
  toggleMercenary
} from "../actions";
import { isTournamentOver } from "@/lib/tournamentDates";
import { placesLabel } from "@/lib/tournamentPlaces";
import type { PublicTournamentMercenary, PublicTournamentRegistration, PublicTournamentTeam } from "@/lib/forumPostPrivacy";

/**
 * Le tournoi tel que la page du sujet le confie à ce module (carte 174) : seulement les champs lus ici. L'état de
 * paiement des inscriptions et des équipes n'est présent que pour l'organisateur, ses commissaires et la modération.
 */
export interface RegistrationTournament {
  id: string;
  date: Date;
  /** Dernier jour du tournoi : les inscriptions restent ouvertes jusqu'à sa fin, heure de Paris (carte 187). */
  endDate: Date | null;
  isTeam: boolean;
  /** Nombre maximal d'inscrits (ou d'équipes) ; `null` : sans limite. */
  maxParticipants?: number | null;
  coachsPerTeam: number;
  isFinished: boolean;
  isCancelled: boolean;
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

/** Coach qu'un capitaine peut choisir comme coéquipier. */
type TeammateCandidate = PublicTournamentMercenary["user"];

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
  // Liste ouverte d'office pour l'organisateur et ses commissaires : c'est leur outil de travail (revue 221)
  const [isExpanded, setIsExpanded] = useState(isOrganizer || isCommissioner);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  // Erreur affichée sous le nom de l'équipe (carte 194)
  const [teamNameError, setTeamNameError] = useState<string>();
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<any | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, title: "", message: "", label: "", action: async () => {} });

  const canManage = isOrganizer || isCommissioner;
  const pathname = usePathname();
  // Même règle que le serveur (carte 186) : pas d'inscription à un tournoi annulé, terminé, passé ou fermé
  const isOver = isTournamentOver(tournament);
  const isActionBlocked = tournament.registrationsLocked || tournament.isFinished || tournament.isCancelled || isOver;

  // -- Inscription Individuelle --
  const myRegistration = tournament.registrations?.find((r) => r.userId === currentUser?.id);
  const isRegistered = !!myRegistration;

  const handleJoin = () => {
    startTransition(async () => {
      const res = await joinTournament(tournament.id);
      if (res.success && res.waitingList) toast.success("Le tournoi est complet : tu es inscrit sur la liste d'attente.");
      else if (res.success) toast.success("Pré-inscription réussie !");
      else toast.error(res.error || "Erreur");
    });
  };

  const openConfirm = (title: string, message: string, label: string, action: () => Promise<void>) => {
    setConfirm({ open: true, title, message, label, action });
  };

  const handleLeave = () => {
    openConfirm("Retirer mon inscription", "Tu veux vraiment retirer ton inscription à ce tournoi ?", "Retirer mon inscription", async () => {
      const res = await leaveTournament(tournament.id);
      if (res.success) toast.success("Ton inscription est retirée.");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleCreateTeamSubmit = () => {
    if (!newTeamName.trim()) {
      setTeamNameError("Donne un nom à ton équipe.");
      document.getElementById("team-name")?.focus();
      return;
    }

    startTransition(async () => {
      const res = editingTeamId
        ? await updateTeam(editingTeamId, newTeamName, selectedMembers.map(m => m.id))
        : await createTeam(tournament.id, newTeamName, selectedMembers.map(m => m.id));

      if (res.success) {
        const waitingList = "waitingList" in res && res.waitingList;
        toast.success(
          editingTeamId
            ? "Équipe mise à jour !"
            : waitingList
              ? "Le tournoi est complet : ton équipe est inscrite sur la liste d'attente."
              : "Équipe inscrite avec succès !"
        );
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
    // Le capitaine fait partie des membres de l'équipe : il n'est pas un coéquipier à cocher (sinon « 4 / 3 », revue 221)
    setSelectedMembers(team.members?.filter((m: any) => m.userId !== team.captainId).map((m: any) => m.user) || []);
    setIsTeamModalOpen(true);
  };

  const userTeam = tournament.teams?.find((t: any) =>
    t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id)
  );
  const isUserInTeam = !!userTeam;
  const isCaptain = userTeam?.captainId === currentUser?.id;

  // Coéquipiers possibles (carte 186) : les mercenaires du tournoi et, en modification, les membres déjà dans l'équipe.
  // Le serveur refuse tout autre coach : un membre ne peut plus être ajouté sans s'être porté volontaire.
  const editedTeam = editingTeamId ? tournament.teams.find((team) => team.id === editingTeamId) : undefined;
  const teammateCandidates: TeammateCandidate[] = [];
  for (const user of [...(editedTeam?.members.map((member) => member.user) ?? []), ...tournament.mercenaries.map((m) => m.user)]) {
    if (user.id !== currentUser?.id && !teammateCandidates.some((candidate) => candidate.id === user.id)) teammateCandidates.push(user);
  }

  const handleToggleMercenary = () => {
    startTransition(async () => {
      const res = await toggleMercenary(tournament.id);
      if (res.success) toast.success(isMercenary ? "Tu n'es plus mercenaire." : "Tu es mercenaire : un capitaine peut t'ajouter à son équipe.");
      else toast.error(res.error || "Erreur");
    });
  };

  const isMercenary = tournament.mercenaries?.some((m: any) => m.userId === currentUser?.id);

  const handleDeleteTeam = (teamId: string) => {
    openConfirm("Supprimer l'équipe", "Tu veux vraiment supprimer ton équipe ? Tous les membres seront désinscrits.", "Supprimer l'équipe", async () => {
      const res = await deleteTeam(teamId);
      if (res.success) toast.success("Équipe supprimée");
      else toast.error(res.error || "Erreur");
    });
  };

  // Inscrits : validés et pré-inscrits (en équipes pour un tournoi par équipes), comme la fiche et la liste des tournois
  // (« 4 / 24 places », revue 221) ; la liste d'attente est comptée à part.
  const entries: { status: string }[] = tournament.isTeam ? tournament.teams ?? [] : tournament.registrations ?? [];
  const totalInscrits = entries.filter((entry) => entry.status !== "WAITING_LIST").length;
  const totalWaiting = entries.length - totalInscrits;
  const actionButton = "w-full sm:w-auto";

  // Où en est le membre connecté, dit en une phrase au-dessus de ses boutons (revue 221)
  let myStatus: string | null = null;
  if (currentUser) {
    if (tournament.isTeam && userTeam) {
      myStatus = `Tu es dans l'équipe ${userTeam.name}${isCaptain ? " (capitaine)" : ""}.`;
      if (userTeam.status === "PRE_REGISTERED") myStatus += " Elle est pré-inscrite : l'organisateur doit valider.";
      else if (userTeam.status === "WAITING_LIST") myStatus += ` Elle est en liste d'attente (${rankText(waitingRank(tournament.teams, userTeam.id))}).`;
    } else if (tournament.isTeam && isMercenary) {
      myStatus = "Tu es mercenaire : un capitaine peut t'ajouter à son équipe.";
    } else if (!tournament.isTeam && myRegistration) {
      if (myRegistration.status === "REGISTERED") myStatus = "Tu es inscrit.";
      else if (myRegistration.status === "PRE_REGISTERED") myStatus = "Tu es pré-inscrit : l'organisateur doit valider.";
      else myStatus = `Tu es en liste d'attente (${rankText(waitingRank(tournament.registrations, myRegistration.id))}).`;
    }
  }

  // Action du membre connecté ; un visiteur est invité à se connecter pour s'inscrire, puis revient sur ce sujet
  let userActions: ReactNode = null;
  if (!currentUser && !isActionBlocked) {
    userActions = (
      <Button asChild variant="primary" size="tap">
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}>Se connecter pour s&apos;inscrire</Link>
      </Button>
    );
  }
  if (currentUser) {
    if (tournament.isTeam) {
      // Équipe : toujours montrer la gestion de son équipe ; sinon, « Inscrire une équipe » seulement si c'est ouvert
      userActions = isUserInTeam ? (
        isCaptain ? (
          <>
            <Button type="button" variant="secondary" size="tap" className={actionButton} onClick={() => openEditTeam(userTeam)} disabled={isPending}>
              <Pencil size={16} aria-hidden="true" /> Modifier mon équipe
            </Button>
            <Button type="button" variant="secondary" size="tap" className={actionButton} onClick={() => handleDeleteTeam(userTeam.id)} disabled={isPending}>
              <UserMinus size={16} aria-hidden="true" /> Désinscrire mon équipe
            </Button>
          </>
        ) : null
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
            {isMercenary ? "Ne plus être mercenaire" : "Être mercenaire"}
          </Button>
        </>
      );
    } else {
      // Individuel : toujours montrer « Retirer mon inscription », en bouton secondaire (le rouge plein reste à l'action
      // principale) ; « Me pré-inscrire » seulement si c'est ouvert
      userActions = isRegistered ? (
        <Button type="button" variant="secondary" size="tap" className={actionButton} onClick={handleLeave} disabled={isPending}>
          <UserMinus size={16} aria-hidden="true" /> Retirer mon inscription
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

  // Tournoi terminé : les résultats prennent la place des inscrits (revue 221)
  if (tournament.isFinished) return null;

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
              <h3 className="mb-2 text-bb-label font-bold tracking-wide text-bb-text-muted uppercase">Capitaine</h3>
              <MemberLine user={selectedTeamDetails?.captain} size={40} />
            </section>
            <section>
              <h3 className="mb-2 text-bb-label font-bold tracking-wide text-bb-text-muted uppercase">
                Coéquipiers ({teammatesOf(selectedTeamDetails).length})
              </h3>
              {teammatesOf(selectedTeamDetails).length === 0 && <p className="m-0 text-sm text-bb-text-muted">Pas encore de coéquipier.</p>}
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {teammatesOf(selectedTeamDetails).map((m: any) => (
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
        {myStatus && (
          <p role="status" className="m-0 border-b border-bb-border px-3 py-2.5 text-[0.95rem] font-semibold text-bb-text lg:px-4">
            {myStatus}
          </p>
        )}
        <div className="flex flex-col gap-3 p-3 lg:flex-row lg:flex-wrap lg:items-center lg:p-4">
          <Button
            type="button"
            variant="quiet"
            className="min-h-11 min-w-0 flex-1 justify-start gap-2 rounded-bb-md px-1 text-left text-base whitespace-normal text-bb-text hover:bg-transparent"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* « Gestion » pour l'organisateur et les commissaires ; pour les autres, la liste des inscrits */}
            <span className="font-bb-heading text-[0.95rem]">{canManage ? "Gestion des inscriptions" : "Inscrits"}</span>
            <span className="text-sm text-bb-text-muted tabular-nums">
              ({placesLabel(totalInscrits, tournament.maxParticipants ?? null, tournament.isTeam)}{totalWaiting > 0 && ` · ${totalWaiting} en attente`})
            </span>
            <ChevronDown size={18} aria-hidden="true" className={cn("ml-auto shrink-0 text-bb-text-muted transition-transform lg:ml-1", isExpanded && "rotate-180")} />
          </Button>

          {tournament.registrationsLocked && (
            <Badge variant="neutral" className="self-start px-2 py-1 text-sm lg:self-center">
              Inscriptions fermées
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
            // L'erreur de saisie s'affiche sous le champ, pas dans la bulle du navigateur (carte 194)
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateTeamSubmit();
            }}
          >
            <Field label="Nom de l'équipe (obligatoire)" htmlFor="team-name" error={teamNameError}>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => {
                  setNewTeamName(e.target.value);
                  setTeamNameError(undefined);
                }}
                placeholder="Ex : Les Gorets de Nurgle"
                required
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-sm font-semibold text-bb-text">
                Membres de l&apos;équipe ({selectedMembers.length + 1} / {tournament.coachsPerTeam})
              </p>
              <p className="m-0 text-sm text-bb-text-muted">
                Tu es automatiquement inclus comme capitaine. Choisis jusqu&apos;à {tournament.coachsPerTeam - 1} coéquipiers parmi
                les coachs qui se sont proposés comme mercenaires : seuls les volontaires peuvent être ajoutés.
              </p>
              {teammateCandidates.length === 0 ? (
                <p className="m-0 rounded-bb-md bg-bb-surface-2 px-3 py-2 text-sm text-bb-text-muted italic">
                  Aucun mercenaire pour l&apos;instant. Tu peux inscrire l&apos;équipe maintenant et la compléter plus tard.
                </p>
              ) : (
                <ul className="m-0 flex max-h-[40dvh] list-none flex-col gap-2 overflow-y-auto p-0">
                  {teammateCandidates.map((user) => {
                    const checked = selectedMembers.some((m) => m.id === user.id);
                    const full = !checked && selectedMembers.length >= tournament.coachsPerTeam - 1;
                    return (
                      <li key={user.id}>
                        <label
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 py-1.5 has-[:checked]:border-bb-accent-text has-[:checked]:bg-bb-accent-soft",
                            full && "cursor-not-allowed opacity-60"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]"
                            checked={checked}
                            disabled={full}
                            onChange={() =>
                              setSelectedMembers(checked ? selectedMembers.filter((m) => m.id !== user.id) : [...selectedMembers, user])
                            }
                          />
                          <MemberLine user={user} size={32} />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
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

/** Coéquipiers d'une équipe : ses membres sans le capitaine, qui en fait partie dans la base. */
function teammatesOf(team: any): any[] {
  return (team?.members ?? []).filter((m: any) => m.userId !== team.captainId);
}

/** Place dans la liste d'attente (1 pour la première), dans l'ordre où le serveur range les inscriptions. */
function waitingRank(items: { id: string; status: string }[], id: string): number {
  return items.filter((item) => item.status === "WAITING_LIST").findIndex((item) => item.id === id) + 1;
}

const rankText = (rank: number) => (rank === 1 ? "1re place" : `${rank}e place`);

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
      <RegistrationSection title="Pré-inscriptions" items={preReg} canManage={canManage} />
      <RegistrationSection title="Validées" items={registered} canManage={canManage} showPayment />
      <RegistrationSection title="Liste d'attente" items={waiting} canManage={canManage} />
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
      <RegistrationSection title="Pré-inscriptions" items={preRegTeams} type="TEAM" canManage={canManage} onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Validées" items={registeredTeams} type="TEAM" canManage={canManage} showPayment onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Liste d'attente" items={waitingTeams} type="TEAM" canManage={canManage} onShowTeamDetails={onShowTeamDetails} />

      <section>
        <SectionTitle title="Mercenaires" count={mercenaries.length} />
        {mercenaries.length === 0 && <p className="m-0 text-sm text-bb-text-muted">Pas de mercenaire pour l&apos;instant.</p>}
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

/** Intitulé d'une liste, sans icône (DESIGN.md : pas d'icône devant chaque titre). */
function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="mb-2 font-bb-heading text-sm text-bb-text">
      {title} <span className="text-bb-text-muted tabular-nums">({count})</span>
    </h3>
  );
}

function RegistrationSection({ title, items, type = "PLAYER", canManage, showPayment, onShowTeamDetails }: any) {
  return (
    <section>
      <SectionTitle title={title} count={items.length} />
      {items.length === 0 ? (
        <p className="m-0 text-sm text-bb-text-muted">Personne pour l&apos;instant.</p>
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

  // Boutons avec leur texte (revue 221 : les seules icônes ne se comprenaient pas) ; le libellé complet reste pour
  // les lecteurs d'écran, qui entendent le nom du coach ou de l'équipe
  const statusButton = (status: string, text: string, label: string) =>
    item.status !== status && (
      <Button type="button" variant="secondary" size="tap" className="px-3" aria-label={label} onClick={() => moveStatus(status)} disabled={isPending}>
        {text}
      </Button>
    );

  return (
    <li className="flex flex-col gap-2 border-b border-bb-border px-3 py-2 last:border-b-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        {type === "PLAYER" ? (
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <MemberLine user={item.user} size={32} />
            {canManage && item.user?.isBanned && <Badge variant="danger">Banni</Badge>}
          </span>
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
              {teammatesOf(item).length > 0 && <> · Coéquipiers : {teammatesOf(item).map((m: any) => m.user?.name).join(", ")}</>}
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
              {/* Toutes les valeurs de PaymentStatus (schema.prisma) : une valeur absente de la liste s'affichait mal et se
                  perdait au premier changement (revue 221, « Dépannage ») */}
              <option value="NOT_PAID">Non payé</option>
              <option value="PAID">Payé</option>
              <option value="AT_TOURNAMENT">Paiera sur place</option>
              <option value="GUEST">Invité</option>
              <option value="DEPANNAGE">Dépannage</option>
            </Select>
          )}
          {statusButton("REGISTERED", "Valider", `Valider l'inscription de ${name}`)}
          {statusButton("PRE_REGISTERED", "Pré-inscription", `Remettre ${name} en pré-inscription`)}
          {statusButton("WAITING_LIST", "Liste d'attente", `Mettre ${name} en liste d'attente`)}
        </div>
      )}
    </li>
  );
}
