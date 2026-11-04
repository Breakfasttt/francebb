"use client";

/**
 * Formulaire de création d'un sujet classique (/forum/new-topic), sorti de la page à la carte 181 pour garder le
 * message en brouillon dans le navigateur (crochet useDraft, un brouillon par forum) et demander confirmation avant
 * « Annuler ». Le reste est la mise en page de la carte 087 : sur ordinateur, une colonne « Publication » à droite
 * porte les cases de modération et les boutons ; sur téléphone, les cases passent sous le message et les boutons
 * dans la barre collée en bas de l'écran.
 * L'action createTopic redirige vers le nouveau sujet quand elle réussit : le brouillon est oublié quand le
 * formulaire disparaît après un envoi qui n'a pas été refusé.
 */
import { useEffect, useRef } from "react";
import { Lock, MessageSquarePlus, Pin } from "lucide-react";
import { Button, Card, Label } from "@bbfrance/ui";
import { createTopic } from "@/app/forum/actions";
import ActionForm from "@/common/components/Form/ActionForm";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import DraftBanner from "@/common/components/DraftBanner/DraftBanner";
import { useDraft } from "@/common/hooks/useDraft";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import CancelComposeButton from "@/app/forum/component/CancelComposeButton";

export default function NewTopicForm({ forumId, userCanStick, cancelHref }: { forumId: string; userCanStick: boolean; cancelHref: string }) {
  const draft = useDraft(`new-topic:${forumId}`, "", { warnBeforeLeave: true });
  const { forget } = draft;
  // Vrai entre l'envoi et la réponse de l'action ; remis à faux si l'action refuse (titre manquant…)
  const submittedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (submittedRef.current) forget();
    };
  }, [forget]);

  const submitTopic = async (formData: FormData) => {
    submittedRef.current = true;
    const result = await createTopic(formData);
    if (result && !result.success) submittedRef.current = false;
    return result;
  };

  const checkboxRow = "flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] text-bb-text";
  const checkbox = "size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]";

  return (
    <ActionForm action={submitTopic} fallbackError="La création du sujet a échoué.">
      <input type="hidden" name="forumId" value={forumId} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titre du sujet</Label>
            <TitleInputWithSmiley />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Message</Label>
            <DraftBanner draft={draft} />
            <BBCodeEditor
              key={draft.editorKey}
              id="content"
              name="content"
              defaultValue={draft.value}
              onChange={draft.onChange}
              placeholder="Tapez votre message ici... Utilisez les boutons ou les balises BBCode."
              rows={20}
              screen
            />
          </div>
        </div>

        {/* Colonne « Publication » (ordinateur) ; sur téléphone, seules les cases de modération restent ici */}
        <aside aria-label="Publication" className={userCanStick ? "" : "max-lg:hidden"}>
          <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
            <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              <MessageSquarePlus size={18} aria-hidden="true" className="text-bb-accent-text" />
              Publication
            </h2>

            {userCanStick && (
              <div className="flex flex-col border-y border-bb-border py-1">
                <label className={checkboxRow}>
                  <input type="checkbox" name="isSticky" value="on" className={checkbox} />
                  <Pin size={16} aria-hidden="true" className="text-bb-text-muted" />
                  <span>Épingler (Post-it)</span>
                </label>
                <label className={checkboxRow}>
                  <input type="checkbox" name="isLocked" value="on" className={checkbox} />
                  <Lock size={16} aria-hidden="true" className="text-bb-text-muted" />
                  <span>Verrouiller le sujet</span>
                </label>
              </div>
            )}

            <div className="hidden flex-col gap-2 lg:flex">
              <Button type="submit" variant="primary" size="tap" className="w-full">
                Créer le sujet
              </Button>
              <CancelComposeButton draft={draft} href={cancelHref} className="w-full" />
            </div>
          </Card>
        </aside>
      </div>

      <ComposeActionBar className="lg:hidden">
        <CancelComposeButton draft={draft} href={cancelHref} />
        <Button type="submit" variant="primary" size="tap" className="flex-1">
          <MessageSquarePlus size={18} aria-hidden="true" /> Créer le sujet
        </Button>
      </ComposeActionBar>
    </ActionForm>
  );
}
