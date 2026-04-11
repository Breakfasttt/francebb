/**
 * Composant formulaire pour le Quizz Blood Bowl.
 * Utilisé pour la création (suggestion) et l'édition de questions.
 */
"use client";

import React, { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { PlusCircle, Save, Undo2 } from "lucide-react";
import "./QuizForm.css";
import "./QuizForm-mobile.css";
import { translateCategory } from "../../utils";

interface QuizFormProps {
  initialData?: {
    category: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title: string;
  submitLabel: string;
}

export default function QuizForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  title,
  submitLabel 
}: QuizFormProps) {
  const [formData, setFormData] = useState({
    category: initialData?.category ? translateCategory(initialData.category) : "Règles",
    question: initialData?.question || "",
    options: initialData?.options || ["", "", "", ""],
    correctIndex: initialData?.correctIndex || 0,
    explanation: initialData?.explanation || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <PremiumCard className="quiz-form-card">
      <form onSubmit={handleSubmit} className="quiz-form">
        <h2 className="form-title">{title}</h2>
        
        <div className="form-group">
          <label htmlFor="category">Catégorie</label>
          <select 
            id="category"
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="form-select"
          >
            <option>Règles</option>
            <option>Lore / Univers</option>
            <option>Compétences</option>
            <option>Équipes</option>
            <option>Star Players</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="question">Question</label>
          <textarea 
            id="question"
            rows={3} 
            placeholder="Posez votre question ici..."
            value={formData.question}
            onChange={e => setFormData({...formData, question: e.target.value})}
            className="form-textarea"
            required
          />
        </div>

        <div className="options-form-grid">
          {formData.options.map((opt, idx) => (
            <div key={idx} className="form-group">
              <label>Option {String.fromCharCode(65 + idx)}</label>
              <div className="option-input-wrapper">
                <input 
                  type="text" 
                  value={opt}
                  placeholder={`Réponse ${String.fromCharCode(65 + idx)}`}
                  onChange={e => {
                    const newOpts = [...formData.options];
                    newOpts[idx] = e.target.value;
                    setFormData({...formData, options: newOpts});
                  }}
                  className="form-input"
                  required
                />
                <div className="radio-wrapper">
                  <input 
                    type="radio" 
                    id={`correct-${idx}`}
                    name="correctIndex" 
                    checked={formData.correctIndex === idx}
                    onChange={() => setFormData({...formData, correctIndex: idx})}
                    className="form-radio"
                  />
                  <label htmlFor={`correct-${idx}`} className="radio-label">Correcte</label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="explanation">Explication (optionnelle)</label>
          <textarea 
            id="explanation"
            rows={2} 
            placeholder="Pourquoi est-ce la bonne réponse ?"
            value={formData.explanation}
            onChange={e => setFormData({...formData, explanation: e.target.value})}
            className="form-textarea"
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <Undo2 size={18} /> Annuler
            </button>
          )}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : (
              <>
                {initialData ? <Save size={18} /> : <PlusCircle size={18} />}
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </PremiumCard>
  );
}
