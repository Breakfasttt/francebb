"use client";

import React, { useState } from "react";
import { renameConversation } from "../actions";
import { X, Save, Type } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import toast from "react-hot-toast";

interface RenameConversationModalProps {
    conversationId: string;
    currentName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RenameConversationModal({ conversationId, currentName, onClose, onSuccess }: RenameConversationModalProps) {
    const [name, setName] = useState(currentName || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await renameConversation(conversationId, name);
            if (res.success) {
                toast.success("Conversation renommée");
                onSuccess();
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
            <PremiumCard style={{ maxWidth: "400px", width: "95%", position: 'relative' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Type size={20} className="text-primary" />
                        Renommer le groupe
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Nouveau titre</label>
                        <input 
                            type="text" 
                            className="classic-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Entrez un titre..."
                            autoFocus
                        />
                    </div>
                </div>

                <div className="modal-footer" style={{ marginTop: "1.5rem", display: 'flex', justifyContent: "flex-end", gap: '1rem' }}>
                    <ClassicButton onClick={onClose}>Annuler</ClassicButton>
                    <CTAButton 
                        onClick={handleSave} 
                        disabled={loading}
                        icon={<Save size={18} />}
                    >
                        {loading ? "Enregistrement..." : "Enregistrer"}
                    </CTAButton>
                </div>
            </PremiumCard>
        </div>
    );
}
