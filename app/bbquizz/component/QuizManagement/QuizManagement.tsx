/**
 * Composant de gestion du Quizz.
 * Permet de suggérer des questions, de les modérer et de les éditer.
 */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/common/components/Modal/Modal";
import TabSystem from "@/common/components/TabSystem/TabSystem";
import { 
  suggestQuizQuestion, 
  getQuizSuggestions, 
  handleQuizSuggestion, 
  getAllQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion
} from "../../actions";
import { toast } from "react-hot-toast";
import { Plus, Check, X, Edit2, Trash2, Send, HelpCircle } from "lucide-react";

interface QuizManagementProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "suggest" | "validate" | "edit";
  isModo: boolean;
}

export default function QuizManagement({ isOpen, onClose, initialMode, isModo }: QuizManagementProps) {
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Formulaire de suggestion / édition
  const [formData, setFormData] = useState({
    category: "Règles",
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isModo) {
        loadData();
      }
    }
  }, [isOpen, isModo]);

  const loadData = async () => {
    setIsLoading(true);
    const [suggs, questList] = await Promise.all([
      getQuizSuggestions(),
      getAllQuizQuestions()
    ]);
    setSuggestions(suggs || []);
    setQuestions(questList || []);
    setIsLoading(false);
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || formData.options.some(o => !o)) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const res = await suggestQuizQuestion(formData);
    setIsLoading(false);

    if (res) {
      toast.success("Question proposée avec succès ! Merci de votre contribution.");
      setFormData({
        category: "Règles",
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: ""
      });
      onClose();
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsLoading(true);
    const res = await updateQuizQuestion(editingId, formData);
    setIsLoading(false);

    if (res) {
      toast.success("Question mise à jour");
      setEditingId(null);
      loadData();
    }
  };

  const handleModeration = async (id: string, approve: boolean) => {
    const res = await handleQuizSuggestion(id, approve);
    if (res) {
      toast.success(approve ? "Question approuvée" : "Question rejetée");
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    const res = await deleteQuizQuestion(id);
    if (res) {
      toast.success("Question supprimée");
      loadData();
    }
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setFormData({
      category: q.category,
      question: q.question,
      options: JSON.parse(q.options),
      correctIndex: q.correctIndex,
      explanation: q.explanation || ""
    });
    setActiveTab(0); // On retourne sur le formulaire
  };

  const tabs = [
    { id: "suggest", label: "Proposer", icon: <Plus size={18} /> },
    ...(isModo ? [
      { id: "validate", label: "Validation", icon: <Check size={18} /> },
      { id: "edit", label: "Gestion questions", icon: <Edit2 size={18} /> }
    ] : [])
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion du Quizz" size="large">
      <div className="quiz-management-content">
        <TabSystem 
          items={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <div className="tab-panel mt-6">
          {activeTab === "suggest" && (
            <form onSubmit={editingId ? handleUpdate : handleSuggest} className="quiz-form">
              <h3>{editingId ? "Éditer la question" : "Nouvelle proposition"}</h3>
              
              <div className="form-group">
                <label>Catégorie</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Règles</option>
                  <option>Lore / Univers</option>
                  <option>Compétences</option>
                  <option>Équipes</option>
                  <option>Star Players</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea 
                  rows={3} 
                  placeholder="Posez votre question ici..."
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
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
                        onChange={e => {
                          const newOpts = [...formData.options];
                          newOpts[idx] = e.target.value;
                          setFormData({...formData, options: newOpts});
                        }}
                      />
                      <input 
                        type="radio" 
                        name="correctIndex" 
                        checked={formData.correctIndex === idx}
                        onChange={() => setFormData({...formData, correctIndex: idx})}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Explication (optionnelle)</label>
                <textarea 
                  rows={2} 
                  placeholder="Pourquoi est-ce la bonne réponse ?"
                  value={formData.explanation}
                  onChange={e => setFormData({...formData, explanation: e.target.value})}
                />
              </div>

              <div className="form-actions mt-4">
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={() => {
                    setEditingId(null);
                    setFormData({
                      category: "Règles",
                      question: "",
                      options: ["", "", "", ""],
                      correctIndex: 0,
                      explanation: ""
                    });
                  }}>Annuler</button>
                )}
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {editingId ? "Enregistrer" : "Envoyer la proposition"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "validate" && isModo && (
            <div className="moderation-list">
              {suggestions.length === 0 ? (
                <p className="empty-msg">Aucune suggestion en attente.</p>
              ) : (
                suggestions.map(s => (
                  <div key={s.id} className="moderation-item">
                    <div className="item-info">
                      <span className="item-author">Par {s.author.name}</span>
                      <p className="item-question"><strong>[{s.category}]</strong> {s.question}</p>
                    </div>
                    <div className="item-actions">
                      <button className="btn-approve" onClick={() => handleModeration(s.id, true)}><Check /></button>
                      <button className="btn-reject" onClick={() => handleModeration(s.id, false)}><X /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "edit" && isModo && (
            <div className="questions-list">
              {questions.map(q => (
                <div key={q.id} className="question-list-item">
                  <div className="item-info">
                    <p><strong>[{q.category}]</strong> {q.question}</p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEdit(q)}><Edit2 size={18} /></button>
                    <button className="btn-delete" onClick={() => handleDelete(q.id)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .quiz-management-content {
          min-height: 500px;
        }
        .form-group {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        input[type="text"], textarea, select {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 0.8rem;
          border-radius: 8px;
          color: #fff;
          width: 100%;
        }
        .option-input-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .options-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .btn-primary {
          background: var(--primary);
          color: #fff;
          padding: 0.8rem 2rem;
          border-radius: 8px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-secondary {
          background: var(--glass-bg);
          color: #fff;
          padding: 0.8rem 2rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          margin-right: 1rem;
        }
        .moderation-item, .question-list-item {
          background: var(--glass-bg);
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .item-author {
          font-size: 0.75rem;
          color: var(--primary);
          text-transform: uppercase;
          font-weight: 800;
        }
        .item-actions {
          display: flex;
          gap: 0.5rem;
        }
        .item-actions button {
          padding: 0.5rem;
          background: var(--theme-overlay);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
        }
        .btn-approve:hover { color: #22c55e; border-color: #22c55e; }
        .btn-reject:hover { color: #ef4444; border-color: #ef4444; }
        .btn-delete:hover { border-color: #ef4444; color: #ef4444; }
        .empty-msg {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
      `}</style>
    </Modal>
  );
}
