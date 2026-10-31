/**
 * Liste des questions du quizz pour la modération (`/bbquizz/editer`, refonte, carte 098) : recherche dans le texte
 * et la catégorie, lien « Proposer » vers le formulaire de proposition, puis, pour chaque question, « Éditer » (ouvre
 * `?edit=<identifiant>`) et « Supprimer », après confirmation dans `ConfirmDialog` (avant la refonte : la fenêtre
 * `confirm()` du navigateur).
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Input, toast } from "@bbfrance/ui";
import { deleteQuizQuestion } from "../actions";
import { translateCategory } from "../utils";

interface QuestionRow {
  id: string;
  category: string;
  question: string;
}

export default function EditerContent({ initialQuestions }: { initialQuestions: QuestionRow[] }) {
  const [questions, setQuestions] = useState<QuestionRow[]>(initialQuestions);
  const [searchTerm, setSearchTerm] = useState("");
  const [toDelete, setToDelete] = useState<QuestionRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteQuizQuestion(toDelete.id);
    setDeleting(false);
    if (res) {
      toast.success("Question supprimée");
      setQuestions((prev) => prev.filter((q) => q.id !== toDelete.id));
      setToDelete(null);
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredQuestions = questions.filter(
    (q) => q.question.toLowerCase().includes(term) || translateCategory(q.category).toLowerCase().includes(term)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
          <Input
            type="text"
            enterKeyHint="search"
            aria-label="Rechercher une question"
            placeholder="Rechercher…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild variant="secondary" size="tap" className="shrink-0">
          <Link href="/bbquizz/proposer">
            <Plus size={18} aria-hidden="true" /> Proposer
          </Link>
        </Button>
      </div>

      {filteredQuestions.length === 0 ? (
        <EmptyState icon={<Search size={32} />} title="Aucune question trouvée">
          Essayez un autre terme de recherche ou proposez une nouvelle question.
        </EmptyState>
      ) : (
        <Card>
          <ul className="m-0 list-none p-0">
            {filteredQuestions.map((q) => (
              <li key={q.id} className="flex items-start gap-2 border-b border-bb-border py-3 pr-2 pl-4 last:border-b-0">
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 pt-1">
                  <Badge variant="neutral">{translateCategory(q.category)}</Badge>
                  <p className="m-0 text-[0.95rem] break-words text-bb-text">{q.question}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button asChild variant="quiet" size="tap-icon">
                    <Link href={`/bbquizz/editer?edit=${q.id}`} aria-label={`Éditer la question « ${q.question} »`} title="Éditer">
                      <Pencil size={18} aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="quiet"
                    size="tap-icon"
                    className="text-bb-danger-text hover:text-bb-danger-text"
                    aria-label={`Supprimer la question « ${q.question} »`}
                    title="Supprimer"
                    onClick={() => setToDelete(q)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cette question ?"
        message={`« ${toDelete?.question ?? ""} » sera supprimée définitivement du quizz.`}
        confirmLabel="Supprimer"
        danger
        pending={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
