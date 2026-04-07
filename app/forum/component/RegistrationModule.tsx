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
import toast from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import { 
  joinTournament, 
  leaveTournament, 
  updateRegistrationStatus
} from "../actions";

interface RegistrationModuleProps {
  tournament: any;
  currentUser: any;
  isOrganizer: boolean;
  isCommissioner: boolean;
}

export default function RegistrationModule({ tournament, currentUser, isOrganizer, isCommissioner }: RegistrationModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
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
            <div className="registration-locked-notice" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.75rem', 
              color: 'var(--accent)', 
              fontWeight: 700,
              padding: '0 1rem',
              textTransform: 'uppercase'
            }}>
              <AlertCircle size={14} /> Inscriptions Closes
            </div>
          )}

          {/* Bouton d'action principal */}
          {currentUser && (
            <div className="quick-user-action">
              {tournament.isTeam ? (
                /* Équipe : Cacher le bouton si bloqué, sinon afficher le bouton d'inscription */
                !isActionBlocked && (
                  <button className="reg-btn primary mini" onClick={() => setIsExpanded(true)} disabled={isPending}>
                    <Plus size={16} /> Inscrire une équipe
                  </button>
                )
              ) : (
                /* Individuel : Toujours montrer "Annuler" si déjà inscrit. Si non inscrit, cacher "Me pré-inscrire" si bloqué. */
                isRegistered ? (
                  <button className="reg-btn danger mini" onClick={handleLeave} disabled={isPending}>
                    <UserMinus size={16} /> Annuler
                  </button>
                ) : (
                  !isActionBlocked && (
                    <button className="reg-btn primary mini" onClick={handleJoin} disabled={isPending}>
                      <UserPlus size={16} /> Me pré-inscrire
                    </button>
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
              />
            ) : (
              <IndividualRegistrationMode 
                tournament={tournament} 
                canManage={canManage}
              />
            )}
          </div>
        )}
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

function TeamRegistrationMode({ tournament, canManage }: any) {
  const preRegTeams = (tournament.teams || []).filter((t: any) => t.status === "PRE_REGISTERED");
  const registeredTeams = (tournament.teams || []).filter((t: any) => t.status === "REGISTERED");
  const waitingTeams = (tournament.teams || []).filter((t: any) => t.status === "WAITING_LIST");
  const mercenaries = tournament.mercenaries || [];

  return (
    <div className="registration-sections">
      <RegistrationSection title="Équipes Pré-inscrites" items={preRegTeams} type="TEAM" status="PRE_REGISTERED" canManage={canManage} icon={<Clock size={14} />} />
      <RegistrationSection title="Équipes Validées" items={registeredTeams} type="TEAM" status="REGISTERED" canManage={canManage} icon={<CheckCircle2 size={14} />} showPayment />
      <RegistrationSection title="Liste d'attente" items={waitingTeams} type="TEAM" status="WAITING_LIST" canManage={canManage} icon={<AlertCircle size={14} />} />
      
      {mercenaries.length > 0 && (
         <div className="registration-section">
            <h4 className="section-title"><Users size={14} /> Mercenaires ({mercenaries.length})</h4>
            <div className="items-list compact">
               {mercenaries.map((m: any) => (
                  <div key={m.id} className="compact-item">
                     <img src={m.user.image || "/default-avatar.png"} alt="" className="avatar-xs" />
                     <span className="name">{m.user.name}</span>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}

function RegistrationSection({ title, items, type = "PLAYER", canManage, icon, showPayment }: any) {
  return (
    <div className="registration-section">
      <h4 className="section-title">{icon} {title} ({items.length})</h4>
      <div className="items-list">
        {items.length === 0 && <div className="empty-text">Aucun</div>}
        {items.map((item: any) => (
          <RegistrationItem key={item.id} item={item} type={type} canManage={canManage} showPayment={showPayment} />
        ))}
      </div>
    </div>
  );
}

function RegistrationItem({ item, type, canManage, showPayment }: any) {
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
      <div className="entry-main">
        {type === "PLAYER" ? (
          <>
            <img src={item.user.image || "/default-avatar.png"} alt="" className="avatar-xs" />
            <span className="entry-name">{item.user.name}</span>
          </>
        ) : (
          <div className="team-info">
            <span className="entry-name team">{item.name}</span>
            <span className="team-members">
              {item.members?.map((m: any) => m.user.name).join(", ")}
            </span>
          </div>
        )}
      </div>

      <div className="entry-actions">
        {canManage && (
          <>
            {showPayment && (
              <select 
                className="mini-select"
                defaultValue={item.paymentStatus}
                onChange={handlePaymentStatus}
                disabled={isPending}
              >
                <option value="NOT_PAID">En attente</option>
                <option value="PAID">Payé</option>
                <option value="AT_TOURNAMENT">Sur place</option>
                <option value="GUEST">Invité</option>
              </select>
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
