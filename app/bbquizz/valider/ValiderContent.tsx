/**
 * Contenu client pour la page de validation des questions.
 */
"use client";

import React, { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { handleQuizSuggestion } from "../actions";
import { toast } from "react-hot-toast";
import { Check, X, User, Calendar, Brain } from "lucide-react";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import { translateCategory } from "../utils";

interface QuizSuggestion {
  id: string;
  category: string;
  question: string;
  options: string;
  correctIndex: number;
  explanation: string | null;
  author: { name: string | null };
  createdAt: Date;
}

export default function ValiderContent({ initialSuggestions }: { initialSuggestions: any[] }) {
  const [suggestions, setSuggestions] = useState<QuizSuggestion[]>(initialSuggestions);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleModeration = async (id: string, approve: boolean) => {
    setIsProcessing(id);
    const res = await handleQuizSuggestion(id, approve);
    setIsProcessing(null);

    if (res) {
      toast.success(approve ? "Question approuvée et publiée" : "Question rejetée");
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  if (suggestions.length === 0) {
    return <EmptyState title="Aucune suggestion" subtitle="Tout est à jour ! Revenez plus tard." />;
  }

  return (
    <div className="suggestions-list">
      {suggestions.map((s) => {
        const options = JSON.parse(s.options);
        return (
          <PremiumCard key={s.id} className="suggestion-card">
            <div className="suggestion-header">
              <div className="author-info">
                <User size={14} />
                <span>{s.author.name || "Anonyme"}</span>
                <span className="separator">•</span>
                <Calendar size={14} />
                <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="category-badge">
                <Brain size={14} />
                {translateCategory(s.category)}
              </div>
            </div>

            <h3 className="suggestion-question">{s.question}</h3>

            <div className="options-preview">
              {options.map((opt: string, idx: number) => (
                <div key={idx} className={`option-item ${idx === s.correctIndex ? 'correct' : ''}`}>
                  <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                  {idx === s.correctIndex && <Check size={14} className="check-icon" />}
                </div>
              ))}
            </div>

            {s.explanation && (
              <div className="explanation-preview">
                <strong>Explication :</strong> {s.explanation}
              </div>
            )}

            <div className="suggestion-actions">
              <button 
                className="btn-reject" 
                onClick={() => handleModeration(s.id, false)}
                disabled={isProcessing === s.id}
              >
                <X size={18} /> Rejeter
              </button>
              <button 
                className="btn-approve" 
                onClick={() => handleModeration(s.id, true)}
                disabled={isProcessing === s.id}
              >
                <Check size={18} /> Approuver
              </button>
            </div>
          </PremiumCard>
        );
      })}
    </div>
  );
}
