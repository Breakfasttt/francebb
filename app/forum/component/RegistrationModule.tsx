"use client";

/**
 * Module de gestion des inscriptions aux tournois (Individuel et Équipe)
 * Supporte le Drag & Drop via @dnd-kit pour l'administration et les commissaires
 */

import { useState, useTransition, useEffect } from "react";
import { 
  Trophy, Users, UserPlus, UserMinus, 
  Settings, CheckCircle2, Clock, ListOrdered, 
  Trash2, Edit, Save, Plus, Search, HelpCircle,
  GripVertical, X
} from "lucide-react";
import "./RegistrationModule.css";
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultAnnouncements,
} from '@dnd-kit/core';
import { 
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from "react-hot-toast";
import { 
  joinTournament, 
  leaveTournament, 
  toggleMercenary, 
  updateRegistrationStatus,
  createTeam,
  updateTeam,
  deleteTeam,
  findUsersSearch
} from "../actions";

interface RegistrationModuleProps {
  tournament: any;
  currentUser: any;
  isOrganizer: boolean;
  isCommissioner: boolean;
}

export default function RegistrationModule({ tournament, currentUser, isOrganizer, isCommissioner }: RegistrationModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const canManage = isOrganizer || isCommissioner;

  // -- Sensors pour DnD --
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!canManage) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !canManage) return;

    const [type, id] = (active.id as string).split(':');
    const newStatus = over.id as any;

    if (active.data.current?.status !== newStatus) {
      startTransition(async () => {
        const res = await updateRegistrationStatus({
          type: type as any,
          id,
          status: newStatus
        });
        if (res.success) toast.success("Statut mis à jour");
        else toast.error(res.error || "Erreur");
      });
    }
  };

  // -- Inscription Individuelle --
  const isRegistered = tournament.registrations?.some((r: any) => r.userId === currentUser?.id);
  const userReg = tournament.registrations?.find((r: any) => r.userId === currentUser?.id);

  const handleJoin = () => {
    startTransition(async () => {
      const res = await joinTournament(tournament.id);
      if (res.success) toast.success("Pré-inscription réussie !");
      else toast.error(res.error || "Erreur");
    });
  };

  const handleLeave = () => {
    if (window.confirm("Voulez-vous vraiment annuler votre inscription ?")) {
      startTransition(async () => {
        const res = await leaveTournament(tournament.id);
        if (res.success) toast.success("Désinscription effectuée");
        else toast.error(res.error || "Erreur");
      });
    }
  };

  return (
    <div className="registration-module">
      <div className="registration-header">
        <h3>
          <ListOrdered size={24} />
          {tournament.isTeam ? "Gestion des Équipes" : "Gestion des Inscriptions"}
        </h3>
        {!tournament.isTeam && (
          <div className="user-actions">
            {!isRegistered ? (
              <button 
                className="admin-btn-primary" 
                onClick={handleJoin}
                disabled={isPending}
              >
                <UserPlus size={18} /> Se pré-inscrire
              </button>
            ) : (
              <button 
                className="admin-btn-secondary" 
                onClick={handleLeave}
                disabled={isPending}
                style={{ borderColor: '#ff4444', color: '#ff4444' }}
              >
                <UserMinus size={18} /> Annuler l'inscription
              </button>
            )}
          </div>
        )}
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {tournament.isTeam ? (
          <TeamRegistrationMode 
            tournament={tournament} 
            currentUser={currentUser} 
            canManage={canManage}
            isPending={isPending}
          />
        ) : (
          <IndividualRegistrationMode 
            tournament={tournament} 
            canManage={canManage}
            isPending={isPending}
          />
        )}
      </DndContext>
    </div>
  );
}

// ------ MODE INDIVIDUEL ------
function IndividualRegistrationMode({ tournament, canManage, isPending }: any) {
  const preReg = (tournament.registrations || []).filter((r: any) => r.status === "PRE_REGISTERED");
  const registered = (tournament.registrations || []).filter((r: any) => r.status === "REGISTERED")
                     .sort((a: any, b: any) => (a.user.name || "").localeCompare(b.user.name || ""));
  const waiting = (tournament.registrations || []).filter((r: any) => r.status === "WAITING_LIST");

  return (
    <div className="registration-grid-individual">
      <RegistrationColumn 
        id="PRE_REGISTERED" 
        title="Pré-inscriptions" 
        items={preReg} 
        canManage={canManage}
        color="#888"
      />
      <RegistrationColumn 
        id="REGISTERED" 
        title="Inscriptions Validées" 
        items={registered} 
        canManage={canManage}
        color="var(--accent)"
      />
      <RegistrationColumn 
        id="WAITING_LIST" 
        title="Liste d'attente" 
        items={waiting} 
        canManage={canManage}
        isFullWidth
        color="#ff4444"
      />
    </div>
  );
}

// ------ MODE ÉQUIPE ------
function TeamRegistrationMode({ tournament, currentUser, canManage, isPending }: any) {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const isMercenary = tournament.mercenaries?.some((m: any) => m.userId === currentUser?.id);
  const userTeam = tournament.teams?.find((t: any) => t.captainId === currentUser?.id || t.members?.some((m: any) => m.userId === currentUser?.id));

  const handleToggleMercenary = () => {
    toggleMercenary(tournament.id);
  };

  const preRegTeams = (tournament.teams || []).filter((t: any) => t.status === "PRE_REGISTERED");
  const registeredTeams = (tournament.teams || []).filter((t: any) => t.status === "REGISTERED")
                          .sort((a: any, b: any) => a.name.localeCompare(b.name));
  const waitingTeams = (tournament.teams || []).filter((t: any) => t.status === "WAITING_LIST");
  const mercenaries = tournament.mercenaries || [];

  return (
    <div className="registration-team-layout">
      <div className="team-creation-box">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {!userTeam && (
             <button className="admin-btn-secondary" onClick={() => setShowTeamForm(!showTeamForm)}>
               <Plus size={18} /> {showTeamForm ? "Annuler" : "Inscrire une équipe"}
             </button>
          )}
          <button 
            className={`admin-btn-secondary ${isMercenary ? 'active' : ''}`} 
            onClick={handleToggleMercenary}
            style={isMercenary ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
          >
            {isMercenary ? <CheckCircle2 size={18} /> : <UserPlus size={18} />} 
            {isMercenary ? "Mercenaire (Inscrit)" : "S'inscrire en mercenaire"}
          </button>
        </div>

        {showTeamForm && (
          <TeamForm 
            tournament={tournament} 
            onClose={() => setShowTeamForm(false)} 
          />
        )}

        {userTeam && !showTeamForm && (
           <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <strong>Votre équipe : {userTeam.name}</strong>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {userTeam.captainId === currentUser?.id && (
                  <button className="text-btn" onClick={() => setShowTeamForm(true)}><Edit size={14} /> Modifier</button>
                )}
                {userTeam.captainId === currentUser?.id && (
                   <button className="text-btn dangerous" onClick={() => deleteTeam(userTeam.id)}><Trash2 size={14} /> Dissoudre</button>
                )}
              </div>
           </div>
        )}
      </div>

      <div className="registration-grid-team">
        <RegistrationColumn id="PRE_REGISTERED" title="Équipes Pré-inscrites" items={preRegTeams} type="TEAM" canManage={canManage} />
        <RegistrationColumn id="REGISTERED" title="Équipes Validées" items={registeredTeams} type="TEAM" canManage={canManage} />
        <RegistrationColumn id="WAITING_LIST" title="Liste d'attente (Teams)" items={waitingTeams} type="TEAM" canManage={canManage} />
        
        <div className="mercenary-col">
          <div className="zone-header">
            <span className="zone-title">Disponibles (Mercenaires)</span>
            <span className="zone-count">{mercenaries.length}</span>
          </div>
          <div className="registration-zone no-drag">
             {mercenaries.length === 0 && <div className="empty-zone-text">Aucun mercenaire</div>}
             {mercenaries.map((m: any) => (
                <div key={m.id} className="registration-item">
                   <div className="user-info">
                      <img src={m.user.image || "/default-avatar.png"} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <span className="user-name">{m.user.name}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------ COMPOSANTS SHARED ------

function RegistrationColumn({ id, title, items, type = "PLAYER", canManage, color, isFullWidth = false }: any) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className={isFullWidth ? "waiting-list-zone" : ""} style={{ flex: 1 }}>
      <div className="zone-header">
        <span className="zone-title" style={{ color: color || '#888' }}>{title}</span>
        <span className="zone-count">{items.length}</span>
      </div>
      <SortableContext 
        id={id}
        items={items.map((it: any) => `${type}:${it.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div 
          ref={setNodeRef} 
          className="registration-zone"
        >
          {items.length === 0 && <div className="empty-zone-text">Vide</div>}
          {items.map((item: any) => (
            <RegistrationItem 
              key={item.id} 
              id={`${type}:${item.id}`} 
              item={item} 
              type={type}
              canManage={canManage}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function RegistrationItem({ id, item, type, canManage }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: { type, status: item.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  const handlePaymentChange = (e: any) => {
    updateRegistrationStatus({
      type,
      id: item.id,
      status: item.status,
      paymentStatus: e.target.value
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="registration-item">
      {canManage && (
        <div {...attributes} {...listeners} className="drag-handle">
          <GripVertical size={18} />
        </div>
      )}
      
      {type === "PLAYER" ? (
        <div className="user-info">
          <img src={item.user.image || "/default-avatar.png"} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <span className="user-name">{item.user.name}</span>
        </div>
      ) : (
        <div className="user-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
          <span className="user-name" style={{ color: 'var(--accent)' }}>{item.name}</span>
          <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', color: '#999' }}>
             {item.members?.map((m: any, idx: number) => (
               <span key={m.id}>{m.user.name}{idx < item.members.length - 1 ? ',' : ''}</span>
             ))}
             {/* Remplissage ??? si manque des membres */}
             {item.members?.length < (item.tournament?.coachsPerTeam || 0) && (
                Array.from({ length: item.tournament.coachsPerTeam - item.members.length }).map((_, i) => (
                  <span key={`empty-${i}`} style={{ opacity: 0.4 }}>???</span>
                ))
             )}
          </div>
        </div>
      )}

      {canManage && item.status === "REGISTERED" && (
        <select 
          className="payment-status-select"
          defaultValue={item.paymentStatus}
          onChange={handlePaymentChange}
        >
          <option value="NOT_PAID">❌ Non payé</option>
          <option value="PAID">✅ Validé</option>
          <option value="AT_TOURNAMENT">🏟️ Sur place</option>
          <option value="GUEST">🎁 Invité</option>
          <option value="DEPANNAGE">🔧 Dépannage</option>
        </select>
      )}
    </div>
  );
}

function TeamForm({ tournament, onClose }: any) {
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // On utiliserait une server action pour chercher les membres
  // Pour l'instant placeholder
  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const users = await findUsersSearch(q);
    setSearchResults(users);
  };

  const addMember = (user: any) => {
    if (memberIds.includes(user.id)) return;
    if (memberIds.length >= tournament.coachsPerTeam) {
      toast.error(`Maximum ${tournament.coachsPerTeam} membres`);
      return;
    }
    setMemberIds([...memberIds, user.id]);
    setQuery("");
    setSearchResults([]);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createTeam(tournament.id, name, memberIds);
        if (res.success) {
        toast.success("Équipe inscrite !");
        onClose();
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="team-form" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
       <div className="team-form-grid">
          <div className="form-group">
            <label>Nom de l'équipe</label>
            <input type="text" className="admin-input" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
             <label>Coéquipiers (Recherche par nom)</label>
             <input type="text" className="admin-input" placeholder="Taper pour chercher..." 
                value={query}
                onChange={e => handleSearch(e.target.value)}
             />
             {searchResults.length > 0 && (
               <div className="search-results-dropdown" style={{
                 position: 'absolute', top: '100%', left: 0, right: 0, 
                 background: '#222', border: '1px solid var(--glass-border)',
                 borderRadius: '8px', zIndex: 100, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
               }}>
                 {searchResults.map(u => (
                   <div key={u.id} className="search-item" 
                      onClick={() => addMember(u)}
                      style={{ padding: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #333' }}
                   >
                     <img src={u.image || "/default-avatar.png"} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                     <span>{u.name}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
          <button type="submit" className="admin-btn-primary" disabled={isPending}>
             Valider l'équipe
          </button>
       </div>
       <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {memberIds.map(id => (
            <div key={id} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {id} <button type="button" onClick={() => setMemberIds(memberIds.filter(i => i !== id))}><X size={12}/></button>
            </div>
          ))}
       </div>
    </form>
  );
}
