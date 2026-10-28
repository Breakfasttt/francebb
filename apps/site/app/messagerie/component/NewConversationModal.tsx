"use client";

import React, { useState } from "react";
import { searchUsers, startConversation } from "../actions";
import { X, Search, Check, Users, ShieldCheck } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function NewConversationModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }
        try {
            const users = await searchUsers(val);
            setResults(users);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSelect = (user: any) => {
        if (selected.find(u => u.id === user.id)) {
            setSelected(selected.filter(u => u.id !== user.id));
        } else {
            setSelected([...selected, user]);
        }
    };

    const handleStart = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            const res = await startConversation(selected.map(u => u.id), groupName || undefined);
            if (res.success) {
                toast.success("Conversation créée");
                router.push(`/messagerie?id=${res.conversationId}`);
                onClose();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PremiumCard style={{ maxWidth: "500px", width: "95%", position: 'relative' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Nouvelle discussion</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="messagerie-disclaimer" style={{ 
                    padding: '0.8rem 1rem', 
                    background: 'rgba(var(--primary-rgb), 0.05)', 
                    border: '1px solid var(--primary-transparent)', 
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'flex-start'
                }}>
                    <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        <strong>Confidentialité & Chiffrement :</strong> Vos messages sont chiffrés (AES-256). Seuls les participants de la conversation peuvent lire les échanges. L'administration n'a pas accès à vos discussions privées.
                    </div>
                </div>

                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Titre de la conversation */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Sujet / Titre de la discussion (optionnel)</label>
                        <input 
                            type="text" 
                            className="classic-input"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Question sur le match, Tournoi..."
                        />
                    </div>

                    {/* Barre de recherche */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Rechercher un coach</label>
                        <div style={{ position: "relative" }}>
                            <input 
                                type="text" 
                                className="classic-input"
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Tapez un nom..."
                                autoFocus
                            />
                            <Search style={{ position: "absolute", right: "12px", top: "10px", opacity: 0.5 }} size={20} />
                        </div>
                    </div>

                    {/* Résultats */}
                    <div className="search-results" style={{ maxHeight: "200px", overflowY: "auto", border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        {results.length === 0 && query.length >= 2 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun résultat</div>}
                        {results.map(user => (
                            <div 
                                key={user.id} 
                                className={`search-result-item ${selected.find(u => u.id === user.id) ? 'selected' : ''}`}
                                onClick={() => toggleSelect(user)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                            >
                                <img src={user.image || "/images/default-avatar.png"} alt="" className="user-avatar-mini" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                <span className="user-name" style={{ flex: 1 }}>{user.name}</span>
                                {selected.find(u => u.id === user.id) && <Check size={18} style={{ color: 'var(--primary)' }} />}
                            </div>
                        ))}
                    </div>

                    {/* Sélectionnés */}
                    {selected.length > 0 && (
                        <div className="selected-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            {selected.map(user => (
                                <span key={user.id} className="user-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                                    {user.name}
                                    <X size={14} onClick={(e) => { e.stopPropagation(); toggleSelect(user); }} style={{ cursor: "pointer" }} />
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ marginTop: "1.5rem", display: 'flex', justifyContent: "flex-end", gap: '1rem' }}>
                    <ClassicButton 
                        onClick={onClose}
                    >
                        Annuler
                    </ClassicButton>
                    <CTAButton 
                        onClick={handleStart} 
                        disabled={selected.length === 0 || loading}
                        icon={selected.length > 1 ? <Users size={18} /> : undefined}
                    >
                        {loading ? "Création..." : selected.length > 1 ? "Créer le groupe" : "Démarrer le chat"}
                    </CTAButton>
                </div>
            </PremiumCard>
        </div>
    );
}
