"use client";

/**
 * Module de gestion des inscriptions aux tournois (Individuel et Équipe)
 * Version optimisée : compacte, thémée et sans Drag & Drop
 */

import { useState, useTransition } from "react";
import { 
  Users, UserPlus, UserMinus, 
  CheckCircle2, Clock, ListOrdered, 
  ChevronDown, ChevronUp,
  Plus, AlertCircle
} from "lucide-react";
import "./RegistrationModule.css";
import "./RegistrationModule-mobile.css";

import toast from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import { 
  joinTournament, 
  leaveTournament, 
  updateRegistrationStatus,
  createTeam,
  updateTeam,
  deleteTeam,
  toggleMercenary
} from "../actions";
import Modal from "@/common/components/Modal/Modal";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import DangerButton from "@/common/components/Button/DangerButton";
import BadgeButton from "@/common/components/Button/BadgeButton";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";

interface RegistrationModuleProps {
  tournament: any;
  currentUser: any;
  isOrganizer: boolean;
  isCommissioner: boolean;
}

export default function RegistrationModule({ tournament, currentUser, isOrganizer, isCommissioner }: RegistrationModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<any | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<any>;
    isDanger?: boolean;
    label?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

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

  const openConfirm = (title: string, message: string, action: () => Promise<any>, isDanger = false, label = "Confirmer") => {
    setConfirmConfig({ isOpen: true, title, message, action, isDanger, label });
  };

  const handleLeave = () => {
    openConfirm(
      "Désinscription",
      "Voulez-vous vraiment annuler votre inscription à ce tournoi ?",
      async () => {
        const res = await leaveTournament(tournament.id);
        if (res.success) toast.success("Désinscription effectuée");
        else toast.error(res.error || "Erreur");
      },
      true,
      "Quitter le tournoi"
    );
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

  const isUserInTeam = tournament.teams?.some((t: any) => 
    t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id)
  );
  
  const userTeam = tournament.teams?.find((t: any) => 
    t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id)
  );

  const handleToggleMercenary = () => {
    startTransition(async () => {
      const res = await toggleMercenary(tournament.id);
      if (res.success) toast.success("Statut mercenaire mis à jour");
      else toast.error(res.error || "Erreur");
    });
  };

  const isMercenary = tournament.mercenaries?.some((m: any) => m.userId === currentUser?.id);

  const handleDeleteTeam = (teamId: string) => {
    openConfirm(
      "Supprimer l'équipe",
      "Voulez-vous vraiment supprimer votre équipe ? Tous les membres seront désinscrits.",
      async () => {
        const res = await deleteTeam(teamId);
        if (res.success) toast.success("Équipe supprimée");
        else toast.error(res.error || "Erreur");
      },
      true,
      "Supprimer l'équipe"
    );
  };

  const totalInscrits = (tournament.registrations?.length || 0) + (tournament.teams?.length || 0);

  return (
    <>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={async () => {
          startTransition(async () => {
            await confirmConfig.action();
            setConfirmConfig({ ...confirmConfig, isOpen: false });
          });
        }}
        isDanger={confirmConfig.isDanger}
        confirmLabel={confirmConfig.label}
      />

      <Modal
        isOpen={!!selectedTeamDetails}
        onClose={() => setSelectedTeamDetails(null)}
        title={`Détails de l'équipe : ${selectedTeamDetails?.name}`}
        hideFooter
      >
        <div className="team-details-modal-content" style={{ padding: '0.5rem 0' }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
             <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Capitaine</h5>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <UserAvatar image={selectedTeamDetails?.captain?.image} name={selectedTeamDetails?.captain?.name || "???"} size={40} selectedRank={selectedTeamDetails?.captain?.avatarFrame} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedTeamDetails?.captain?.name}</span>
             </div>
          </div>

          <div>
             <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Membres ({selectedTeamDetails?.members?.length || 0})</h5>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {selectedTeamDetails?.members?.length === 0 && <p style={{ fontStyle: 'italic', opacity: 0.6 }}>Aucun membre additionnel</p>}
                {selectedTeamDetails?.members?.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                    <UserAvatar image={m.user?.image} name={m.user?.name || "???"} size={32} selectedRank={m.user?.avatarFrame} />
                    <span style={{ fontWeight: 600 }}>{m.user?.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </Modal>

      <div className={`registration-module ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        <div className="registration-bar">
          <button 
            className="registration-toggle-btn" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="toggle-info">
              <Users size={18} />
              <span>Gestion des Inscriptions</span>
              <span className="badge-count">{totalInscrits}</span>
            </div>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {tournament.registrationsLocked && (
            <div className="registration-locked-notice">
              <AlertCircle size={14} /> Inscriptions Closes
            </div>
          )}

          {/* Bouton d'action principal */}
          {currentUser && (
            <div className="quick-user-action">
              {tournament.isTeam ? (
                /* Équipe : Toujours montrer "Quitter" si déjà dans une équipe. Sinon, cacher "Inscrire une équipe" si bloqué. */
                isUserInTeam ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {userTeam?.captainId === currentUser?.id && (
                      <ClassicButton 
                        size="sm" 
                        onClick={() => openEditTeam(userTeam)} 
                        disabled={isPending}
                        icon={<Plus size={16} />}
                      >
                        Modifier
                      </ClassicButton>
                    )}
                    <DangerButton 
                      size="sm" 
                      onClick={() => userTeam && handleDeleteTeam(userTeam.id)} 
                      disabled={isPending || userTeam?.captainId !== currentUser?.id} 
                      icon={<UserMinus size={16} />}
                      title={userTeam?.captainId !== currentUser?.id ? "Seul le capitaine peut supprimer l'équipe" : "Supprimer mon équipe"}
                    >
                      {userTeam?.captainId === currentUser?.id ? "Désinscrire" : "Inscrit"}
                    </DangerButton>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isActionBlocked && (
                      <CTAButton size="sm" onClick={() => setIsTeamModalOpen(true)} disabled={isPending} icon={<Plus size={16} />}>
                        Inscrire une équipe
                      </CTAButton>
                    )}
                    <ClassicButton 
                      size="sm" 
                      onClick={handleToggleMercenary} 
                      disabled={isPending || isActionBlocked}
                      variant="outline"
                      style={isMercenary ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                    >
                      {isMercenary ? "Retirer mercenaire" : "Être mercenaire"}
                    </ClassicButton>
                  </div>
                )
              ) : (
                /* Individuel : Toujours montrer "Annuler" si déjà inscrit. Si non inscrit, cacher "Me pré-inscrire" si bloqué. */
                isRegistered ? (
                  <DangerButton size="sm" onClick={handleLeave} disabled={isPending} icon={<UserMinus size={16} />}>
                    Annuler
                  </DangerButton>
                ) : (
                  !isActionBlocked && (
                    <CTAButton size="sm" onClick={handleJoin} disabled={isPending} icon={<UserPlus size={16} />}>
                      Me pré-inscrire
                    </CTAButton>
                  )
                )
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="registration-content">

            {tournament.isTeam ? (
              <TeamRegistrationMode 
                tournament={tournament} 
                currentUser={currentUser} 
                canManage={canManage}
                isMercenary={isMercenary}
                onToggleMercenary={handleToggleMercenary}
                onShowTeamDetails={setSelectedTeamDetails}
                isActionBlocked={isActionBlocked}
              />
            ) : (
              <IndividualRegistrationMode 
                tournament={tournament} 
                canManage={canManage}
              />
            )}
          </div>
        )}

        {/* Modal d'inscription d'équipe */}
        <Modal
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setEditingTeamId(null);
          }}
          title={editingTeamId ? "Modifier l'équipe" : "Inscrire une équipe"}
          confirmText={editingTeamId ? "Enregistrer les modifications" : "Valider l'inscription"}
          onConfirm={handleCreateTeamSubmit}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Nom de l&apos;équipe *</label>
              <input 
                type="text" 
                value={newTeamName} 
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Ex: Les Gorets de Nurgle"
                className="admin-input" // Utilise le style des inputs de tournoi
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  background: 'var(--input-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  color: 'var(--foreground)'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>
                Membres de l&apos;équipe ({selectedMembers.length + 1} / {tournament.coachsPerTeam})
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
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
          </div>
        </Modal>
      </div>
    </>
  );
}

function IndividualRegistrationMode({ tournament, canManage }: any) {
  const preReg = (tournament.registrations || []).filter((r: any) => r.status === "PRE_REGISTERED");
  const registered = (tournament.registrations || []).filter((r: any) => r.status === "REGISTERED")
                     .sort((a: any, b: any) => (a.user.name || "").localeCompare(b.user.name || ""));
  const waiting = (tournament.registrations || []).filter((r: any) => r.status === "WAITING_LIST");

  return (
    <div className="registration-sections">
      <RegistrationSection title="Pré-inscriptions" items={preReg} status="PRE_REGISTERED" canManage={canManage} icon={<Clock size={14} />} />
      <RegistrationSection title="Validées" items={registered} status="REGISTERED" canManage={canManage} icon={<CheckCircle2 size={14} />} showPayment />
      <RegistrationSection title="Liste d'attente" items={waiting} status="WAITING_LIST" canManage={canManage} icon={<AlertCircle size={14} />} />
    </div>
  );
}

function TeamRegistrationMode({ tournament, currentUser, canManage, isMercenary, onToggleMercenary, onShowTeamDetails, isActionBlocked }: any) {
  const preRegTeams = (tournament.teams || []).filter((t: any) => t.status === "PRE_REGISTERED");
  const registeredTeams = (tournament.teams || []).filter((t: any) => t.status === "REGISTERED");
  const waitingTeams = (tournament.teams || []).filter((t: any) => t.status === "WAITING_LIST");
  const mercenaries = tournament.mercenaries || [];

  const isUserMember = tournament.teams?.some((t: any) => 
    t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id)
  );

  return (
    <div className="registration-sections">
      <RegistrationSection title="Équipes Pré-inscrites" items={preRegTeams} type="TEAM" status="PRE_REGISTERED" canManage={canManage} icon={<Clock size={14} />} onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Équipes Validées" items={registeredTeams} type="TEAM" status="REGISTERED" canManage={canManage} icon={<CheckCircle2 size={14} />} showPayment onShowTeamDetails={onShowTeamDetails} />
      <RegistrationSection title="Liste d'attente" items={waitingTeams} type="TEAM" status="WAITING_LIST" canManage={canManage} icon={<AlertCircle size={14} />} onShowTeamDetails={onShowTeamDetails} />
      
      <div className="registration-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h4 className="section-title" style={{ margin: 0 }}><Users size={14} /> Mercenaires ({mercenaries.length})</h4>
          </div>
          
          <div className="items-list compact">
             {mercenaries.length === 0 && <div className="empty-text">Aucun mercenaire disponible</div>}
             {mercenaries.map((m: any) => (
                <div key={m.id} className="compact-item">
                   <img src={m.user.image || "/default-avatar.png"} alt="" className="avatar-xs" />
                   <span className="name">{m.user.name}</span>
                   {m.userId === currentUser?.id && <span className="me-badge" style={{ marginLeft: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>(Moi)</span>}
                </div>
             ))}
          </div>
      </div>
    </div>
  );
}

function RegistrationSection({ title, items, type = "PLAYER", canManage, icon, showPayment, onShowTeamDetails }: any) {
  return (
    <div className="registration-section">
      <h4 className="section-title">{icon} {title} ({items.length})</h4>
      <div className="items-list">
        {items.length === 0 && <div className="empty-text">Aucun</div>}
        {items.map((item: any) => (
          <RegistrationItem key={item.id} item={item} type={type} canManage={canManage} showPayment={showPayment} onShowTeamDetails={onShowTeamDetails} />
        ))}
      </div>
    </div>
  );
}

function RegistrationItem({ item, type, canManage, showPayment, onShowTeamDetails }: any) {
  const [isPending, startTransition] = useTransition();

  const moveStatus = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateRegistrationStatus({ type, id: item.id, status: newStatus });
      if (res.success) toast.success("Statut mis à jour");
      else toast.error(res.error || "Erreur");
    });
  };

  const handlePaymentStatus = (e: any) => {
    startTransition(async () => {
      await updateRegistrationStatus({
        type,
        id: item.id,
        status: item.status,
        paymentStatus: e.target.value
      });
    });
  };

  return (
    <div className="registration-entry">
      <div 
        className={`entry-main ${type === "TEAM" ? "is-team-clickable" : ""}`}
        onClick={() => type === "TEAM" && onShowTeamDetails?.(item)}
        title={type === "TEAM" ? "Cliquer pour voir les détails de l'équipe" : ""}
        style={type === "TEAM" ? { cursor: 'pointer' } : {}}
      >
        {type === "PLAYER" ? (
          <>
            <img src={item.user.image || "/default-avatar.png"} alt="" className="avatar-xs" />
            <span className="entry-name">{item.user.name}</span>
          </>
        ) : (
          <div className="team-info">
            <span className="entry-name team">{item.name}</span>
            <span className="team-members">
              <span className="captain-tag">Capitaine : {item.captain?.name}</span>
              {item.members?.length > 0 && (
                <span className="members-list">
                   • Coéquipiers : {item.members.map((m: any) => m.user?.name).join(", ")}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="entry-actions">
        {canManage && (
          <>
            {showPayment && (
              <ClassicSelect 
                defaultValue={item.paymentStatus}
                onChange={handlePaymentStatus}
                disabled={isPending}
                size="sm"
                containerStyle={{ minWidth: "120px" }}
              >
                <option value="NOT_PAID">🚫 En attente</option>
                <option value="PAID">✅ Payé</option>
                <option value="AT_TOURNAMENT">🏠 Sur place</option>
                <option value="GUEST">🎁 Invité</option>
              </ClassicSelect>
            )}

            <div className="move-buttons">
              {item.status !== "REGISTERED" && (
                <button title="Valider" onClick={() => moveStatus("REGISTERED")} className="btn-icon success"><CheckCircle2 size={14} /></button>
              )}
              {item.status !== "PRE_REGISTERED" && (
                <button title="Pré-inscription" onClick={() => moveStatus("PRE_REGISTERED")} className="btn-icon neutral"><Clock size={14} /></button>
              )}
              {item.status !== "WAITING_LIST" && (
                <button title="Attente" onClick={() => moveStatus("WAITING_LIST")} className="btn-icon warning"><ListOrdered size={14} /></button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
