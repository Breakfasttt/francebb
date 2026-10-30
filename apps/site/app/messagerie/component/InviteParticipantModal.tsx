"use client";

import React, { useEffect, useState } from "react";
import { useDebounce } from "@/common/hooks/useDebounce";
import { searchUsers, inviteToGroup } from "../actions";
import { X, Search, Check, UserPlus } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { toast, Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from "@bbfrance/ui";

interface InviteParticipantModalProps {
    conversationId: string;
    onClose: () => void;
    onSuccess: () => void;
    existingUserIds: string[];
}

export default function InviteParticipantModal({ conversationId, onClose, onSuccess, existingUserIds }: InviteParticipantModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Awaited<ReturnType<typeof searchUsers>>>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    // Recherche après 300 ms sans frappe ; une réponse arrivée après une frappe plus récente est ignorée
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) return;
        let cancelled = false;
        searchUsers(debouncedQuery)
            .then((users) => { if (!cancelled) setResults(users); })
            .catch((error) => console.error(error));
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    const handleSearch = (val: string) => {
        setQuery(val);
        if (val.trim().length < 2) setResults([]);
    };

    // Membres déjà présents dans le groupe : masqués des résultats
    const visibleResults = results.filter((user) => !existingUserIds.includes(user.id));

    const toggleSelect = (user: any) => {
        if (selected.find(u => u.id === user.id)) {
            setSelected(selected.filter(u => u.id !== user.id));
        } else {
            setSelected([...selected, user]);
        }
    };

    const handleInvite = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            const res = await inviteToGroup(conversationId, selected.map(u => u.id));
            if (res.success) {
                toast.success("Participants ajoutés");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Erreur lors de l'invitation");
            }
        } catch {
            toast.error("Erreur lors de l'invitation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogPortal>
                <DialogOverlay asChild>
                    <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DialogContent asChild aria-describedby={undefined}>
                            <PremiumCard style={{ maxWidth: "500px", width: "95%", position: 'relative' }}>
                                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <DialogTitle asChild>
                                        <h3 style={{ margin: 0 }}>Ajouter des participants</h3>
                                    </DialogTitle>
                                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

                                    <div className="search-results" style={{ maxHeight: "200px", overflowY: "auto", border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                                        {visibleResults.length === 0 && query.length >= 2 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun résultat</div>}
                                        {visibleResults.map(user => (
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
                                    <ClassicButton onClick={onClose}>Annuler</ClassicButton>
                                    <CTAButton 
                                        onClick={handleInvite} 
                                        disabled={selected.length === 0 || loading}
                                        icon={<UserPlus size={18} />}
                                    >
                                        {loading ? "Ajout..." : "Ajouter au chat"}
                                    </CTAButton>
                                </div>
                            </PremiumCard>
                        </DialogContent>
                    </div>
                </DialogOverlay>
            </DialogPortal>
        </Dialog>
    );
}
