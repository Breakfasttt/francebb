"use client";

import { useState } from "react";
import { createTopic, updateTournament } from "../actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { 
  Trophy, Calendar, MapPin, Users, Coins, Monitor, 
  Shield, Utensils, BedDouble, Sun, Map, Save, Globe
} from "lucide-react";
import CreateTopicSidebar from "@/app/forum/component/CreateTopicSidebar";
import UserSearch from "@/common/components/UserSearch/UserSearch";

interface TournamentFormProps {
  forumId: string;
  userCanStick: boolean;
  referenceData: {
    franceRegions: any[];
    gameEditions: any[];
    departments: any[];
    tournamentTypes: any[];
    platforms: any[];
    coachRegions: any[];
  };
  initialData?: {
    id: string;
    name: string;
    date: Date;
    endDate: Date | null;
    address: string | null;
    gmapsUrl: string | null;
    location: string;
    ville: string | null;
    departement: string | null;
    region: string | null;
    regionNAF: string | null;
    maxParticipants: number | null;
    isTeam: boolean;
    coachsPerTeam: number | null;
    price: number | null;
    priceMeals: number | null;
    priceLodging: number | null;
    structure: string | null;
    ruleset: string | null;
    gameEdition: string | null;
    platform: string | null;
    mealsIncluded: boolean;
    lodgingAtVenue: boolean;
    fridayArrival: boolean;
    isNAF: boolean;
    isCDF: boolean;
    isCGO: boolean;
    isTGE: boolean;
    isTSC: boolean;
    commissaires: any[];
    topicId: string;
    firstPostId: string;
    postContent: string;
    isOrganizer: boolean;
  };
}

export default function TournamentForm({ forumId, userCanStick, referenceData, initialData }: TournamentFormProps) {
  const isEdit = !!initialData;
  const [isTeam, setIsTeam] = useState(initialData?.isTeam ?? false);
  const [commissaires, setCommissaires] = useState<any[]>(initialData?.commissaires ?? []);
  const [startDate, setStartDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "");
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "");

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal = false) => {
    // Liste des touches spéciales autorisées
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter', 'Escape'];
    if (allowDecimal) {
      allowedKeys.push('.', ',');
    }
    
    // Autoriser les raccourcis Ctrl/Cmd + A, C, V, X
    if (e.ctrlKey || e.metaKey) return;

    // Bloquer ce qui n'est pas un chiffre ou une touche autorisée
    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    // Bloquer les virgules/points multiples
    if ((e.key === '.' || e.key === ',') && (e.currentTarget.value.includes('.') || e.currentTarget.value.includes(','))) {
      e.preventDefault();
    }
  };

  const handleSelectUser = (user: any) => {
    setCommissaires(prev => [...prev, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setCommissaires(prev => prev.filter(u => u.id !== userId));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    if (endDate && val && endDate < val) {
      setEndDate(val);
    }
  };

  // On crée une version client-side de l'action pour injecter les IDs fixes en mode édition
  const formAction = async (formData: FormData) => {
    if (isEdit && initialData) {
      await updateTournament(initialData.id, initialData.topicId, initialData.firstPostId, formData);
    } else {
      await createTopic(formData);
    }
  };

  const SectionSeparator = ({ icon, title }: { icon: any, title: string }) => (
    <div className="section-separator" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.8rem', 
      padding: '1rem 0', 
      borderBottom: '1px solid var(--glass-border)',
      marginTop: '1.5rem',
      marginBottom: '1rem'
    }}>
      <div style={{ color: 'var(--accent)' }}>{icon}</div>
      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>{title}</h4>
      <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)', marginLeft: '1rem' }}></div>
    </div>
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="forumId" value={forumId} />
      
      <div className="forum-layout">
        <div className="forum-main-content">
          <div className="premium-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="form-group">
              <label htmlFor="title" style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 800, fontSize: '1.1rem' }}>
                Titre de l&apos;annonce (Nom du tournoi) *
              </label>
              <TitleInputWithSmiley initialValue={initialData?.name} />
            </div>

            <div style={{ 
              padding: '2rem', 
              background: 'var(--glass-bg)', 
              borderRadius: '16px', 
              border: '1px solid var(--glass-border)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--accent)', color: 'black', padding: '10px', borderRadius: '10px' }}>
                    <Trophy size={28} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{isEdit ? "Modification du Tournoi" : "Configuration du Tournoi"}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Les filtres permettent aux coachs de trouver facilement votre évènement.</p>
                </div>
              </div>

              <SectionSeparator icon={<Calendar size={18} />} title="Dates" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Date de début *</label>
                  <input 
                    type="date" 
                    name="tDate" 
                    required 
                    className="admin-input" 
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input 
                    type="date" 
                    name="tEndDate" 
                    className="admin-input" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              <SectionSeparator icon={<MapPin size={18} />} title="Lieu / Localisation" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Région de tournoi (NAF)</label>
                  <select name="tRegionNAF" className="admin-input" defaultValue={initialData?.regionNAF || ""}>
                    <option value="">Sélectionner</option>
                    {referenceData.coachRegions.map(r => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Région (France)</label>
                  <select name="tRegion" className="admin-input" defaultValue={initialData?.region || ""}>
                    <option value="">Sélectionner</option>
                    {referenceData.franceRegions.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Département</label>
                  <select name="tDept" className="admin-input" defaultValue={initialData?.departement || ""}>
                    <option value="">Sélectionner</option>
                    {referenceData.departments.map(d => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input type="text" name="tVille" defaultValue={initialData?.ville || ""} placeholder="Ex: Lyon" className="admin-input" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Lieu / Adresse exacte (pour Google Maps)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" name="tAddress" defaultValue={initialData?.address || ""} placeholder="Ex: 5 rue de la Paix, Paris" className="admin-input" 
                           style={{ paddingLeft: '2.8rem' }} />
                    <Map size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Lien Google Maps direct (Optionnel)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="url" name="tGmapsUrl" defaultValue={initialData?.gmapsUrl || ""} placeholder="Ex: https://goo.gl/maps/..." className="admin-input" 
                           style={{ paddingLeft: '2.8rem' }} />
                    <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <SectionSeparator icon={<Users size={18} />} title="Participants" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', background: 'var(--glass-bg)', padding: '0.8rem', borderRadius: '8px', border: isTeam ? '1px solid var(--accent)' : '1px solid var(--glass-border)' }}>
                    <input type="checkbox" name="isTeam" checked={isTeam} onChange={e => setIsTeam(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                    <span>En équipe</span>
                  </label>
                </div>
                {isTeam && (
                  <div className="form-group">
                    <label>Coachs par équipe</label>
                    <input 
                      type="number" 
                      name="tCoachsPerTeam" 
                      defaultValue={Math.max(2, initialData?.coachsPerTeam || 2)} 
                      min={2} 
                      className="admin-input" 
                      onKeyDown={(e) => handleNumericKeyDown(e)}
                      onInput={(e: any) => {
                        const val = e.target.value;
                        if (val === "0") e.target.value = "2"; 
                      }}
                      onBlur={(e) => {
                        if (parseInt(e.target.value) < 2 || !e.target.value) e.target.value = "2";
                      }}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>{isTeam ? "Nombre d'équipes max" : "Nombre de coachs max"}</label>
                  <input 
                    type="number" 
                    name="tMax" 
                    defaultValue={initialData?.maxParticipants || ""} 
                    placeholder="Ex: 40" 
                    min={1} 
                    className="admin-input" 
                    onKeyDown={(e) => handleNumericKeyDown(e)}
                    onBlur={(e) => {
                      if (e.target.value && parseInt(e.target.value) < 1) e.target.value = "1";
                    }}
                  />
                </div>
              </div>

              {(initialData?.isOrganizer ?? true) && (
                <>
                  <SectionSeparator icon={<Users size={18} />} title="Commissaires" />
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.8rem' }}>
                      Utilisateurs pouvant gérer ce tournoi (en plus de vous)
                    </label>
                    <UserSearch 
                      selectedUsers={commissaires}
                      onSelect={handleSelectUser}
                      onRemove={handleRemoveUser}
                      placeholder="Chercher un commissaire..."
                      maxSelections={10}
                    />
                    <input type="hidden" name="commissaireIds" value={commissaires.map(u => u.id).join(',')} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Les commissaires pourront modifier les infos du tournoi et gérer les inscriptions.
                    </p>
                  </div>
                </>
              )}

              <SectionSeparator icon={<Shield size={18} />} title="Championnats / Points" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {['NAF', 'CDF', 'CGO', 'TGE', 'TSC'].map(c => (
                  <label key={c} className="checkbox-box-admin">
                    <input type="checkbox" name={`is${c}`} defaultChecked={(initialData as any)?.[`is${c}`]} />
                    <div className="box-content" style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 800 }}>{c}</span>
                    </div>
                  </label>
                ))}
              </div>

              <SectionSeparator icon={<Monitor size={18} />} title="Plateforme & Édition" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Plateforme</label>
                  <select name="tPlatform" className="admin-input" defaultValue={initialData?.platform || "Tabletop"}>
                    {referenceData.platforms.map(p => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Édition du jeu</label>
                  <select name="tGame" className="admin-input" defaultValue={initialData?.gameEdition || "BB25"}>
                    {referenceData.gameEditions.map(g => (
                        <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ruleset (Pack de règles)</label>
                  <input type="text" name="tRuleset" defaultValue={initialData?.ruleset || ""} placeholder="Ex: Eurobowl 2024" className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Type de tournoi</label>
                  <select name="tStructure" className="admin-input" defaultValue={initialData?.structure || "Resurrection"}>
                    {referenceData.tournamentTypes.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <SectionSeparator icon={<Coins size={18} />} title="Logistique & Prix" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Prix Inscription (€)</label>
                  <input type="number" step="0.5" name="tPrice" defaultValue={initialData?.price || ""} placeholder="Ex: 15" className="admin-input" 
                         onKeyDown={(e) => handleNumericKeyDown(e, true)} />
                </div>
                <div className="form-group">
                  <label>Prix Repas (€ optionnel)</label>
                  <input type="number" step="0.5" name="tPriceMeals" defaultValue={initialData?.priceMeals || ""} placeholder="Ex: 5" className="admin-input" 
                         onKeyDown={(e) => handleNumericKeyDown(e, true)} />
                </div>
                <div className="form-group">
                  <label>Prix Logement (€ optionnel)</label>
                  <input type="number" step="0.5" name="tPriceLodging" defaultValue={initialData?.priceLodging || ""} placeholder="Ex: 10" className="admin-input" 
                         onKeyDown={(e) => handleNumericKeyDown(e, true)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <label className="checkbox-box-admin">
                  <input type="checkbox" name="tMeals" defaultChecked={initialData?.mealsIncluded} />
                  <div className="box-content">
                    <Utensils size={18} />
                    <span>Repas inclus</span>
                  </div>
                </label>
                <label className="checkbox-box-admin">
                  <input type="checkbox" name="tLodging" defaultChecked={initialData?.lodgingAtVenue} />
                  <div className="box-content">
                    <BedDouble size={18} />
                    <span>Dodo sur place</span>
                  </div>
                </label>
                <label className="checkbox-box-admin">
                  <input type="checkbox" name="tFriday" defaultChecked={initialData?.fridayArrival} />
                  <div className="box-content">
                    <Sun size={18} />
                    <span>Accueil vendredi</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content" style={{ display: 'block', marginBottom: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
                Présentation complète / Règlement détaillé *
              </label>
              <BBCodeEditor
                id="content"
                name="content"
                defaultValue={initialData?.postContent}
                placeholder="Détaillez ici votre tournoi, horaires, lots, etc. Le parser BBCode est disponible."
                rows={18}
              />
            </div>
          </div>
        </div>

        <CreateTopicSidebar 
          forumId={forumId}
          userRole={userCanStick ? "ADMIN" : "COACH"}
          submitLabel={isEdit ? "Enregistrer les modifications" : "Publier le tournoi"}
          icon={isEdit ? <Save size={18} /> : <Trophy size={18} />}
          isTournament={true}
        />
      </div>

      <style jsx>{`
        .admin-input {
          width: 100%;
          padding: 0.9rem 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: var(--accent); }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; }
        
        .checkbox-box-admin {
          cursor: pointer;
        }
        .checkbox-box-admin input { display: none; }
        .box-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          padding: 1.2rem;
          background: var(--glass-bg);
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .checkbox-box-admin input:checked + .box-content {
           background: rgba(255, 215, 0, 0.05);
           border-color: var(--accent);
           color: var(--accent);
           transform: translateY(-2px);
           box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
        }
      `}</style>
    </form>
  );
}
