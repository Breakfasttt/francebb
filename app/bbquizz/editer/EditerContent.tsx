/**
 * Contenu client pour la page d'édition des questions.
 */
"use client";

import React, { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { updateQuizQuestion, deleteQuizQuestion } from "../actions";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Brain, Search, Plus } from "lucide-react";
import QuizForm from "../component/QuizForm/QuizForm";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import Link from "next/link";
import { translateCategory } from "../utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string;
  correctIndex: number;
  explanation: string | null;
  createdAt: Date;
}

export default function EditerContent({ initialQuestions }: { initialQuestions: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Synchroniser l'état local avec l'URL pour l'édition
  useEffect(() => {
    if (editId) {
      const q = questions.find(item => item.id === editId);
      if (q) setEditingQuestion(q);
      else setEditingQuestion(null);
    } else {
      setEditingQuestion(null);
    }
  }, [editId, questions]);

  const handleEdit = (q: QuizQuestion) => {
    router.push(`/bbquizz/editer?edit=${q.id}`);
  };

  const handleCancel = () => {
    router.push("/bbquizz/editer");
  };

  const handleUpdate = async (formData: any) => {
    if (!editingQuestion) return;
    
    setIsLoading(true);
    const res = await updateQuizQuestion(editingQuestion.id, formData);
    setIsLoading(false);

    if (res) {
      toast.success("Question mise à jour");
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, ...formData, options: JSON.stringify(formData.options) } : q));
      handleCancel();
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette question définitivement ?")) return;
    
    const res = await deleteQuizQuestion(id);
    if (res) {
      toast.success("Question supprimée");
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    translateCategory(q.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (editingQuestion) {
    return (
      <QuizForm 
        title="Édition de question"
        submitLabel="Sauvegarder les modifications"
        initialData={{
          category: editingQuestion.category,
          question: editingQuestion.question,
          options: JSON.parse(editingQuestion.options),
          correctIndex: editingQuestion.correctIndex,
          explanation: editingQuestion.explanation || ""
        }}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="editer-content">
      <div className="admin-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une question..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/bbquizz/proposer" className="btn-add">
          <Plus size={18} /> Proposer
        </Link>
      </div>

      {filteredQuestions.length === 0 ? (
        <EmptyState 
          title="Aucune question trouvée" 
          subtitle="Essayez un autre terme de recherche ou proposez une nouvelle question." 
        />
      ) : (
        <div className="questions-grid">
          {filteredQuestions.map((q) => (
            <PremiumCard key={q.id} className="question-item-card">
              <div className="question-info">
                <div className="category-tag">
                  <Brain size={12} />
                  {translateCategory(q.category)}
                </div>
                <p className="question-text">{q.question}</p>
              </div>
              <div className="question-actions">
                <button 
                  className="btn-icon edit" 
                  onClick={() => handleEdit(q)}
                  title="Éditer"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="btn-icon delete" 
                  onClick={() => handleDelete(q.id)}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
}
