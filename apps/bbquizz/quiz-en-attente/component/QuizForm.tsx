/**
 * Formulaire d'une question de BBQuizz (refonte, carte 098, ADR 0006), partagé par la proposition d'une question
 * (`/bbquizz/proposer`) et sa modification par la modération (`/bbquizz/editer?edit=…`), sur le modèle des formulaires
 * d'une ligue, d'un article et d'une ressource (cartes 094 à 096). Il est découpé en blocs lisibles sur téléphone :
 * la question (catégorie et texte), les quatre réponses (avec le choix de la bonne), puis l'explication facultative.
 * Sur ordinateur, la colonne « Envoi » à droite porte les boutons et rappelle ce qui se passe ensuite ; sur téléphone,
 * les boutons sont dans la barre collée en bas de l'écran (`ComposeActionBar`) et l'écran n'a pas la barre de
 * navigation du bas (`isComposePath`).
 * Les données envoyées (`category`, `question`, `options`, `correctIndex`, `explanation`) sont celles d'avant la
 * refonte.
 */
"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { HelpCircle, Info, ListChecks, Loader2, MessageSquareText, Save, Send } from "lucide-react";
import { Button, Card, Field, Input, Label, Select, Textarea, cn } from "@bbfrance/ui";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { translateCategory } from "../utils";

/** Ce que le formulaire envoie, comme avant la refonte. */
export interface QuizFormData {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizFormProps {
  /** Question à modifier ; absente pour une nouvelle proposition. */
  initialData?: {
    category: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  };
  onSubmit: (data: QuizFormData) => Promise<void>;
  isLoading?: boolean;
  /** Libellé complet du bouton d'envoi (ordinateur) et libellé court (barre du bas, téléphone). */
  submitLabel: string;
  shortSubmitLabel: string;
  /** Adresse de « Annuler ». */
  cancelHref: string;
  /** Phrase de la colonne « Envoi » : ce qui se passe après l'envoi. */
  note: string;
}

const CATEGORIES = ["Règles", "Lore / Univers", "Compétences", "Équipes", "Star Players", "Autre"];
const LETTERS = ["A", "B", "C", "D"];

/** Un bloc du formulaire : carte avec un titre et son icône. */
function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4 p-4 lg:p-5">
      <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
        <span aria-hidden="true" className="text-bb-accent-text">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

const hint = "m-0 flex items-start gap-1.5 text-sm text-bb-text-muted";

export default function QuizForm({ initialData, onSubmit, isLoading, submitLabel, shortSubmitLabel, cancelHref, note }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    category: initialData?.category ? translateCategory(initialData.category) : "Règles",
    question: initialData?.question || "",
    options: initialData?.options || ["", "", "", ""],
    correctIndex: initialData?.correctIndex || 0,
    explanation: initialData?.explanation || "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const submitIcon = isLoading
    ? <Loader2 size={18} aria-hidden="true" className="animate-spin" />
    : initialData ? <Save size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />;
  // Une question déjà en base peut avoir une catégorie hors de la liste (« Positionnels ») : elle reste proposée
  const categories = CATEGORIES.includes(formData.category) ? CATEGORIES : [...CATEGORIES, formData.category];

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Block icon={<HelpCircle size={18} />} title="La question">
            <Field label="Catégorie" htmlFor="category">
              <Select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Question (obligatoire)" htmlFor="question">
              <Textarea
                id="question"
                rows={3}
                placeholder="Posez votre question ici…"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="min-h-24 font-bb-sans"
                required
              />
            </Field>
          </Block>

          <Block icon={<ListChecks size={18} />} title="Les quatre réponses">
            <p className={hint}>
              <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              Remplissez les quatre réponses et cochez « Bonne réponse » à côté de la bonne.
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {formData.options.map((opt, idx) => {
                const isCorrect = formData.correctIndex === idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-bb-md border p-3",
                      isCorrect ? "border-bb-success-text bg-bb-success-text/10" : "border-bb-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={`option-${idx}`}>Réponse {LETTERS[idx]}</Label>
                      {/* Toute la ligne « Bonne réponse » répond à l'appui : 44 pixels de haut pour le pouce */}
                      <label
                        htmlFor={`correct-${idx}`}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-2 px-1 text-sm font-semibold",
                          isCorrect ? "text-bb-success-text" : "text-bb-text-muted"
                        )}
                      >
                        <input
                          type="radio"
                          id={`correct-${idx}`}
                          name="correctIndex"
                          aria-label={`Bonne réponse : ${LETTERS[idx]}`}
                          checked={isCorrect}
                          onChange={() => setFormData({ ...formData, correctIndex: idx })}
                          className="size-5 cursor-pointer accent-[var(--bb-accent)]"
                        />
                        Bonne réponse
                      </label>
                    </div>
                    <Input
                      id={`option-${idx}`}
                      type="text"
                      value={opt}
                      placeholder={`Réponse ${LETTERS[idx]}`}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      required
                    />
                  </div>
                );
              })}
            </div>
          </Block>

          <Block icon={<MessageSquareText size={18} />} title="Explication (facultatif)">
            <Field label="Explication" htmlFor="explanation" hint="Elle s'affiche avec la correction, juste après la réponse du joueur.">
              <Textarea
                id="explanation"
                rows={3}
                placeholder="Pourquoi est-ce la bonne réponse ?"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="min-h-24 font-bb-sans"
              />
            </Field>
          </Block>

          {/* Téléphone : ce qui se passe après l'envoi (sur ordinateur, dans la colonne « Envoi ») */}
          <p className={cn(hint, "lg:hidden")}>
            <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {note}
          </p>
        </div>

        {/* Colonne « Envoi » (ordinateur) */}
        <aside aria-label="Envoi" className="hidden lg:block">
          <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
            <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              <span aria-hidden="true" className="text-bb-accent-text">{initialData ? <Save size={18} /> : <Send size={18} />}</span>
              Envoi
            </h2>
            <p className="m-0 text-sm text-bb-text-muted">{note}</p>
            <Button type="submit" variant="primary" size="tap" className="w-full" disabled={isLoading}>
              {submitIcon} {submitLabel}
            </Button>
            <Button asChild variant="secondary" size="tap" className="w-full">
              <Link href={cancelHref}>Annuler</Link>
            </Button>
          </Card>
        </aside>
      </div>

      <ComposeActionBar className="lg:hidden">
        <Button asChild variant="secondary" size="tap">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
        <Button type="submit" variant="primary" size="tap" className="flex-1" disabled={isLoading}>
          {submitIcon} {shortSubmitLabel}
        </Button>
      </ComposeActionBar>
    </form>
  );
}
