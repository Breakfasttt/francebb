/**
 * Liste des propositions de questions en attente (`/bbquizz/valider`, refonte, carte 098). Chaque proposition est une
 * carte : auteur, date et catégorie, la question, ses quatre réponses (la bonne est marquée en vert, avec le mot
 * « Bonne réponse » pour les lecteurs d'écran), l'explication, puis « Rejeter » et « Approuver ». Une proposition
 * traitée disparaît de la liste. L'action serveur `handleQuizSuggestion` est celle d'avant la refonte.
 */
"use client";

import { useState } from "react";
import { Calendar, Check, CheckCircle2, Inbox, User, X } from "lucide-react";
import { Badge, Button, Card, EmptyState, cn, toast } from "@bbfrance/ui";
import { handleQuizSuggestion } from "../actions";
import { translateCategory } from "../utils";

interface QuizSuggestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  authorName: string | null;
  /** Date d'envoi au format ISO. */
  createdAt: string;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });

export default function ValiderContent({ initialSuggestions }: { initialSuggestions: QuizSuggestion[] }) {
  const [suggestions, setSuggestions] = useState<QuizSuggestion[]>(initialSuggestions);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleModeration = async (id: string, approve: boolean) => {
    setIsProcessing(id);
    const res = await handleQuizSuggestion(id, approve);
    setIsProcessing(null);

    if (res.success) {
      toast.success(approve ? "Question approuvée et publiée" : "Question rejetée");
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  };

  if (suggestions.length === 0) {
    return (
      <EmptyState icon={<Inbox size={40} />} title="Aucune proposition en attente">
        Tout est à jour ! Revenez plus tard.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm text-bb-text-muted">
        {suggestions.length} proposition{suggestions.length > 1 ? "s" : ""} en attente.
      </p>
      {suggestions.map((s) => (
        <Card key={s.id} className="flex flex-col gap-4 p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-bb-text-muted">
            <span className="flex items-center gap-1.5">
              <User size={14} aria-hidden="true" /> {s.authorName || "Anonyme"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" /> {formatDate(s.createdAt)}
            </span>
            <Badge variant="outline">{translateCategory(s.category)}</Badge>
          </div>

          <h2 className="m-0 border-0 p-0 text-lg leading-snug font-bold tracking-normal break-words text-bb-text normal-case not-italic">
            {s.question}
          </h2>

          <ol className="m-0 grid list-none gap-2 p-0 lg:grid-cols-2">
            {s.options.map((opt, idx) => {
              const isCorrect = idx === s.correctIndex;
              return (
                <li
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 rounded-bb-md border px-3 py-2",
                    isCorrect ? "border-bb-success-text bg-bb-success-text/10" : "border-bb-border bg-bb-surface-2"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                      isCorrect ? "border-bb-success-text text-bb-success-text" : "border-bb-border text-bb-text-muted"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{opt}</span>
                  {isCorrect && (
                    <>
                      <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-bb-success-text" />
                      <span className="sr-only">(bonne réponse)</span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {s.explanation && (
            <p className="m-0 rounded-bb-md border-l-4 border-bb-accent-text bg-bb-surface-2 px-3 py-2 text-[0.95rem] text-bb-text">
              <strong>Explication : </strong>
              {s.explanation}
            </p>
          )}

          <div className="flex gap-2 lg:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="tap"
              className="flex-1 text-bb-danger-text lg:flex-none"
              onClick={() => handleModeration(s.id, false)}
              disabled={isProcessing === s.id}
              aria-label={`Rejeter la question « ${s.question} »`}
            >
              <X size={18} aria-hidden="true" /> Rejeter
            </Button>
            <Button
              type="button"
              variant="primary"
              size="tap"
              className="flex-1 lg:flex-none"
              onClick={() => handleModeration(s.id, true)}
              disabled={isProcessing === s.id}
              aria-label={`Approuver la question « ${s.question} »`}
            >
              <Check size={18} aria-hidden="true" /> Approuver
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
