"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { createTeamRoster } from "../../../actions";
import { Save, AlertCircle, Plus, Trash2, Shield, Users, Trophy } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import DangerButton from "@/common/components/Button/DangerButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import "./TeamBuilder.css";

type Roster = {
  id: string;
  name: string;
  tier: number;
  rerollCost: number;
  apothecary: boolean;
  specialRules: string[];
  players: any[];
};

export default function TeamBuilder({ availableRosters }: { availableRosters: Roster[] }) {
  const router = useRouter();
  
  const [teamName, setTeamName] = useState("");
  const [selectedRosterId, setSelectedRosterId] = useState("");
  
  // States d'équipe
  const [hiredPlayers, setHiredPlayers] = useState<any[]>([]);
  const [rerolls, setRerolls] = useState(0);
  const [hasApothecary, setHasApothecary] = useState(false);
  const [assistants, setAssistants] = useState(0);
  const [cheerleaders, setCheerleaders] = useState(0);
  const [dedicatedFans, setDedicatedFans] = useState(1);
  const [treasury, setTreasury] = useState(1000000);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoster = availableRosters.find(r => r.id === selectedRosterId);

  // --- CALCULS TV ---
  const teamValue = useMemo(() => {
    let tv = 0;
    // Joueurs
    hiredPlayers.forEach(p => {
      tv += p.cost;
    });
    
    if (selectedRoster) {
      // Relances
      tv += rerolls * selectedRoster.rerollCost;
      // Apo
      if (hasApothecary) tv += 50000;
    }
    
    // Staff
    tv += assistants * 10000;
    tv += cheerleaders * 10000;
    // Dedicated fans (pas compté dans la TV en BB2020 pour la valeur d'équipe "sur le terrain", 
    // mais leur achat de départ compte dans la TV Initiale ou dans la trésorerie.
    // Selon le LRB S3, chaque fan sup coûte 10 000 po lors de la création, mais la TV = joueurs + relances + apo + staff.
    // Vérifions : Fans dédiés ajoutent-ils à la TV ? Non, ils coûtent juste de la trésorerie.
    
    return tv;
  }, [hiredPlayers, rerolls, hasApothecary, assistants, cheerleaders, selectedRoster]);

  const spentTreasury = useMemo(() => {
    return teamValue + ((dedicatedFans - 1) * 10000);
  }, [teamValue, dedicatedFans]);

  const remainingTreasury = 1000000 - spentTreasury;

  // --- ACTIONS ---
  const handleAddPlayer = (positional: any) => {
    if (remainingTreasury < positional.cost) return;
    
    // Vérifier les limites (qty est du type "0-2", "0-16")
    const maxQty = parseInt(positional.qty.split("-")[1]);
    const currentQty = hiredPlayers.filter(p => p.positionName === positional.name).length;
    
    if (currentQty >= maxQty) return;
    if (hiredPlayers.length >= 16) return;

    setHiredPlayers([...hiredPlayers, {
      ...positional,
      positionName: positional.name,
      name: "",
      number: hiredPlayers.length + 1
    }]);
  };

  const handleRemovePlayer = (index: number) => {
    const newArr = [...hiredPlayers];
    newArr.splice(index, 1);
    setHiredPlayers(newArr);
  };

  const handlePlayerNameChange = (index: number, newName: string) => {
    const newArr = [...hiredPlayers];
    newArr[index].name = newName;
    setHiredPlayers(newArr);
  };

  const handleSave = async () => {
    if (!teamName || !selectedRosterId || hiredPlayers.length < 11) {
      alert("Il faut un nom, une race et au moins 11 joueurs pour créer l'équipe.");
      return;
    }
    
    if (remainingTreasury < 0) {
      alert("Vous avez dépassé le budget d'un million de pièces d'or.");
      return;
    }

    try {
      setIsSubmitting(true);
      const teamId = await createTeamRoster({
        name: teamName,
        raceId: selectedRosterId,
        raceName: selectedRoster!.name,
        treasury: remainingTreasury,
        rerolls,
        apothecary: hasApothecary,
        assistants,
        cheerleaders,
        dedicatedFans,
        players: hiredPlayers,
        teamValue
      });
      router.push(`/equipes/${teamId}`);
    } catch (e: any) {
      console.error(e);
      alert("Erreur lors de la création : " + e.message);
      setIsSubmitting(false);
    }
  };

  // Reset lors d'un changement de race
  const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRosterId(e.target.value);
    setHiredPlayers([]);
    setRerolls(0);
    setHasApothecary(false);
    setAssistants(0);
    setCheerleaders(0);
    setDedicatedFans(1);
  };

  return (
    <div className="team-builder">
      {/* HEADER DE CREATION */}
      <PremiumCard className="tb-header-card">
        <div className="tb-inputs">
          <div className="input-group">
            <label>Nom de l'équipe</label>
            <input 
              type="text" 
              className="classic-input"
              placeholder="Les fiers à bras..." 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <ClassicSelect 
            label="Race" 
            icon={<Shield size={16} />}
            value={selectedRosterId} 
            onChange={handleRaceChange}
          >
            <option value="" disabled>Sélectionner une race</option>
            {availableRosters.map(r => (
              <option key={r.id} value={r.id}>{r.name} (Tier {r.tier})</option>
            ))}
          </ClassicSelect>
        </div>

        <div className="tb-stats">
          <div className={`stat-box ${remainingTreasury < 0 ? 'error' : ''}`}>
            <span className="label">Trésorerie Restante</span>
            <span className="value">{remainingTreasury.toLocaleString()} po</span>
          </div>
          <div className="stat-box">
            <span className="label">Valeur d'Équipe (TV)</span>
            <span className="value">{teamValue.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="label">Joueurs</span>
            <span className={`value ${hiredPlayers.length < 11 ? 'warning' : ''}`}>{hiredPlayers.length}/16</span>
          </div>
        </div>
      </PremiumCard>

      {selectedRoster && (
        <div className="tb-layout">
          {/* COLONNE GAUCHE : ROSTER DISPO & STAFF */}
          <div className="tb-sidebar">
            <PremiumCard>
              <h3>Positions Disponibles</h3>
              <div className="position-list">
                {selectedRoster.players.map((pos, i) => {
                  const max = parseInt(pos.qty.split("-")[1]);
                  const current = hiredPlayers.filter(p => p.positionName === pos.name).length;
                  const canBuy = current < max && remainingTreasury >= pos.cost;

                  return (
                    <div key={i} className={`position-item ${!canBuy ? 'disabled' : ''}`}>
                      <div className="pos-info">
                        <strong>{pos.name}</strong>
                        <span className="pos-cost">{pos.cost.toLocaleString()} po</span>
                      </div>
                      <div className="pos-actions">
                        <span className="pos-qty">{current}/{max}</span>
                        <ClassicButton 
                          onClick={() => handleAddPlayer(pos)} 
                          disabled={!canBuy || hiredPlayers.length >= 16}
                          size="sm"
                          icon={<Plus />}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumCard>

            <PremiumCard>
              <h3>Staff & Équipement</h3>
              <div className="staff-grid">
                <div className="staff-item">
                  <label>Relances ({selectedRoster.rerollCost.toLocaleString()})</label>
                  <input type="number" min="0" max="8" value={rerolls} onChange={e => setRerolls(parseInt(e.target.value) || 0)} />
                </div>
                {selectedRoster.apothecary && (
                  <div className="staff-item">
                    <label>Apothicaire (50k)</label>
                    <input type="checkbox" checked={hasApothecary} onChange={e => setHasApothecary(e.target.checked)} />
                  </div>
                )}
                <div className="staff-item">
                  <label>Assistants (10k)</label>
                  <input type="number" min="0" value={assistants} onChange={e => setAssistants(parseInt(e.target.value) || 0)} />
                </div>
                <div className="staff-item">
                  <label>Pom-pom girls (10k)</label>
                  <input type="number" min="0" value={cheerleaders} onChange={e => setCheerleaders(parseInt(e.target.value) || 0)} />
                </div>
                <div className="staff-item">
                  <label>Fans Dédiés (10k)</label>
                  <input type="number" min="1" max="6" value={dedicatedFans} onChange={e => setDedicatedFans(parseInt(e.target.value) || 1)} />
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* COLONNE DROITE : JOUEURS ENGAGÉS */}
          <div className="tb-main">
            <PremiumCard>
              <div className="tb-main-header">
                <h3>Effectif ({hiredPlayers.length}/16)</h3>
                <CTAButton 
                  disabled={isSubmitting || hiredPlayers.length < 11 || remainingTreasury < 0 || !teamName}
                  onClick={handleSave}
                  isLoading={isSubmitting}
                  icon={<Save />}
                >
                  Valider l'Équipe
                </CTAButton>
              </div>

              {hiredPlayers.length === 0 ? (
                <div className="empty-state text-muted">
                  <AlertCircle size={32} />
                  <p>Aucun joueur engagé. Sélectionnez des joueurs dans la liste de gauche.</p>
                </div>
              ) : (
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Position</th>
                      <th>MA</th><th>ST</th><th>AG</th><th>PA</th><th>AV</th>
                      <th>Coût</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiredPlayers.map((player, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input 
                            type="text" 
                            className="classic-input-small"
                            placeholder="Nom du joueur"
                            value={player.name}
                            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                          />
                        </td>
                        <td>{player.positionName}</td>
                        <td>{player.ma}</td>
                        <td>{player.st}</td>
                        <td>{player.ag}</td>
                        <td>{player.pa || "-"}</td>
                        <td>{player.av}</td>
                        <td>{player.cost}</td>
                        <td>
                          <DangerButton 
                            onClick={() => handleRemovePlayer(index)}
                            size="sm"
                            icon={<Trash2 />}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </PremiumCard>
          </div>
        </div>
      )}
    </div>
  );
}
