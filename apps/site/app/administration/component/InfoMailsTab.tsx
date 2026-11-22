"use client";

/**
 * Onglet « Annonces par e-mail » de l'administration (refonte, carte 099) : envoyer une annonce aux coachs non bannis
 * qui acceptent la préférence « Newsletter et annonces » de leur profil (carte 167). L'envoi est confirmé dans une
 * fenêtre qui donne le vrai nombre de destinataires (carte 221), puis l'écran « Diffusion terminée » donne le nombre
 * d'e-mails réellement partis. L'envoi se fait par lots de 20 (carte 145) : l'écran les enchaîne et affiche l'avancement,
 * pour qu'aucun appel au serveur ne dépasse la durée maximale d'une fonction Vercel. Le texte accepte gras, italique et liens (lib/announcementMail.ts) ; « M'envoyer un
 * essai » l'envoie d'abord à l'admin.
 */
import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, EmptyState, Field, Input, Textarea, toast } from "@bbfrance/ui";
import { ANNOUNCEMENT_FORMAT_HELP } from "@/lib/announcementMail";
import { countAnnouncementRecipients, sendAnnouncementBatch, sendTestAnnouncement } from "../actions";

export default function InfoMailsTab() {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  // Erreurs de saisie, affichées sous le champ concerné (carte 194)
  const [errors, setErrors] = useState<{ subject?: string; content?: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);
  const [isTesting, startTest] = useTransition();
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);
  // Avancement de l'envoi en cours : e-mails traités (partis ou non) sur le nombre annoncé dans la confirmation
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const checkFields = () => {
    const nextErrors = {
      subject: subject.trim() ? undefined : "Indique l'objet du mail.",
      content: content.trim() ? undefined : "Écris le texte du mail.",
    };
    setErrors(nextErrors);
    if (nextErrors.subject || nextErrors.content) {
      document.getElementById(nextErrors.subject ? "info-mail-subject" : "info-mail-content")?.focus();
      return false;
    }
    return true;
  };

  const handleSend = () => {
    if (!checkFields()) return;
    setRecipients(null);
    setShowConfirm(true);
    void countAnnouncementRecipients().then(setRecipients);
  };

  const handleTest = () => {
    if (!checkFields()) return;
    startTest(async () => {
      const res = await sendTestAnnouncement(subject, content);
      if (res.success) toast.success("Essai envoyé sur ton adresse e-mail.");
      else toast.error(res.error || "L'essai n'est pas parti.");
    });
  };

  const confirmSend = () => {
    setShowConfirm(false);
    const total = recipients ?? 0;
    startTransition(async () => {
      const startedAt = new Date().toISOString();
      let afterId: string | null = null;
      let sent = 0;
      let handled = 0;
      setProgress({ done: 0, total });
      try {
        for (;;) {
          const res = await sendAnnouncementBatch(subject, content, afterId, startedAt);
          if (!res.success) {
            toast.error(sent ? `${res.error} ${sent} e-mails étaient déjà partis.` : res.error);
            return;
          }
          sent += res.sent;
          handled += res.sent + res.failed;
          afterId = res.lastId;
          setProgress({ done: handled, total: Math.max(total, handled) });
          if (res.done) break;
        }
        setResult({ count: sent, total: handled });
        toast.success(`Annonce envoyée à ${sent} coach${sent > 1 ? "s" : ""}.`);
        setSubject("");
        setContent("");
      } catch {
        toast.error(`L'envoi s'est arrêté après ${sent} e-mail${sent > 1 ? "s" : ""}. Regarde le journal de modération avant de relancer.`);
      } finally {
        setProgress(null);
      }
    });
  };

  if (result) {
    return (
      <Card>
        <EmptyState
          icon={<CheckCircle2 size={48} className="text-bb-success-text" />}
          title="Diffusion terminée"
          action={
            <Button type="button" variant="secondary" size="tap" onClick={() => setResult(null)}>
              Envoyer une autre annonce
            </Button>
          }
        >
          L&apos;e-mail est parti pour <strong className="text-bb-text">{result.count} coachs sur {result.total}</strong>.
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
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

        <Field label="Objet du mail" htmlFor="info-mail-subject" error={errors.subject}>
          <Input
            id="info-mail-subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setErrors((prev) => ({ ...prev, subject: undefined }));
            }}
            placeholder="Ex. : Inscriptions ouvertes pour la CDF"
          />
        </Field>

        <Field
          label="Texte du mail"
          htmlFor="info-mail-content"
          error={errors.content}
          hint={`Les liens en https:// deviennent cliquables. Mise en forme possible : ${ANNOUNCEMENT_FORMAT_HELP}.`}
        >
          <Textarea
            id="info-mail-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors((prev) => ({ ...prev, content: undefined }));
            }}
            rows={10}
          />
        </Field>

        <div className="flex flex-col gap-2 lg:flex-row lg:justify-end">
          <Button type="button" variant="secondary" size="tap" disabled={isTesting || isPending} onClick={handleTest}>
            {isTesting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            M&apos;envoyer un essai
          </Button>
          <Button type="button" variant="primary" size="tap" disabled={!subject || !content || isPending} onClick={handleSend}>
            {isPending ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            {isPending ? "Diffusion en cours…" : "Diffuser aux coachs"}
          </Button>
        </div>

        {progress && (
          <div role="status" className="flex flex-col gap-2">
            <p className="m-0 text-bb-text">
              Envoi en cours : <strong>{progress.done.toLocaleString("fr-FR")} / {progress.total.toLocaleString("fr-FR")}</strong>.
              Garde cette page ouverte jusqu&apos;à la fin.
            </p>
            <progress className="h-2 w-full accent-bb-accent" max={Math.max(progress.total, 1)} value={progress.done} />
          </div>
        )}
      </CardBody>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Diffuser l'annonce ?"
        message={
          recipients === null
            ? "Calcul du nombre de destinataires…"
            : `${recipients.toLocaleString("fr-FR")} coach${recipients > 1 ? "s" : ""} (non bannis, qui acceptent « Newsletter et annonces ») recevr${recipients > 1 ? "ont" : "a"} cet e-mail. L'envoi ne peut pas être annulé.`
        }
        confirmLabel={recipients ? `Envoyer à ${recipients.toLocaleString("fr-FR")} coach${recipients > 1 ? "s" : ""}` : "Oui, diffuser"}
        danger
        onConfirm={confirmSend}
      />
    </Card>
  );
}
