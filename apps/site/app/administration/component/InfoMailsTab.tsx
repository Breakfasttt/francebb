"use client";

/**
 * Onglet « Annonces par e-mail » de l'administration (refonte, carte 099) : envoyer une annonce aux coachs non bannis
 * qui acceptent la préférence « Newsletter et annonces » de leur profil (carte 167). L'envoi est confirmé dans une
 * fenêtre (« Oui, diffuser »), puis l'écran « Diffusion terminée » donne le nombre d'e-mails réellement partis.
 */
import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, EmptyState, Field, Input, Label, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { sendGlobalInfoMail } from "../actions";

export default function InfoMailsTab() {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; total: number } | null>(null);

  const handleSend = () => {
    if (!subject || !content) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        const res = await sendGlobalInfoMail(subject, content);
        if (res.success) {
          setResult({ success: true, count: res.count || 0, total: res.total || 0 });
          toast.success(`Mail envoyé à ${res.count} utilisateurs !`);
          setSubject("");
          setContent("");
        } else {
          toast.error(res.error || "Erreur lors de l'envoi.");
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Erreur critique.");
      }
    });
  };

  if (result) {
    return (
      <Card>
        <EmptyState
          icon={<CheckCircle2 size={48} className="text-bb-success-text" />}
          title="Diffusion terminée !"
          action={
            <Button type="button" variant="secondary" size="tap" onClick={() => setResult(null)}>
              Envoyer une autre annonce
            </Button>
          }
        >
          L&apos;e-mail a été envoyé à <strong className="text-bb-text">{result.count} / {result.total}</strong> utilisateurs.
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Mail size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Annonces par e-mail</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div role="note" className="flex gap-3 rounded-bb-md border border-bb-warning-text px-3 py-2.5 text-[0.95rem] text-bb-text">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-bb-warning-text" aria-hidden="true" />
          <p className="m-0">
            <strong>Attention :</strong> ces e-mails partent à tous les coachs qui acceptent « Newsletter et annonces »
            dans leur profil. À réserver aux informations importantes.
          </p>
        </div>

        <Field label="Objet du mail" htmlFor="info-mail-subject">
          <Input id="info-mail-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet de l'e-mail" />
        </Field>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="info-mail-content">Message (BBCode)</Label>
          <BBCodeEditor
            name="mail-content"
            id="info-mail-content"
            defaultValue={content}
            onChange={(value) => setContent(value)}
            placeholder="Message..."
            rows={10}
          />
        </div>

        <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto lg:self-end" disabled={!subject || !content || isPending} onClick={handleSend}>
          {isPending ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {isPending ? "Diffusion en cours…" : "Diffuser aux coachs"}
        </Button>
      </CardBody>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Diffuser l'annonce ?"
        message="Tous les coachs non bannis recevront cet e-mail. L'envoi ne peut pas être annulé."
        confirmLabel="Oui, diffuser"
        danger
        onConfirm={confirmSend}
      />
    </Card>
  );
}
