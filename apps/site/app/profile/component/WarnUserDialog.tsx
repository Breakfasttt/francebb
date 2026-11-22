"use client";

/**
 * Fenêtre « Avertir » un membre (carte 222), ouverte depuis sa fiche par un modérateur qui peut le bannir. Le motif est
 * obligatoire ; le membre le lira sur son profil, après une notification qui ne nomme pas le modérateur. Panneau qui
 * monte du bas sur téléphone, fenêtre centrée sur ordinateur.
 */
import { useState, useTransition } from "react";
import { Button, DESKTOP_QUERY, Field, Sheet, SheetContent, Textarea, toast, useMediaQuery } from "@bbfrance/ui";
import { warnUser } from "@/app/membres/actions";

export default function WarnUserDialog({ open, onOpenChange, userId, userName, onWarned }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onWarned: () => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={`Avertir ${userName}`}
        side={isDesktop ? "center" : "bottom"}
        description={`${userName} recevra une notification et lira ce motif sur son profil, sans voir ton pseudo.`}
        onInteractOutside={(event) => event.preventDefault()}
      >
        {/* Le formulaire n'existe que pendant que la fenêtre est ouverte : chaque ouverture repart de zéro */}
        <WarnForm userId={userId} onCancel={() => onOpenChange(false)} onWarned={onWarned} />
      </SheetContent>
    </Sheet>
  );
}

function WarnForm({ userId, onCancel, onWarned }: { userId: string; onCancel: () => void; onWarned: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!reason.trim()) {
      setError("Écris le motif de l'avertissement.");
      document.getElementById("warn-reason")?.focus();
      return;
    }
    startTransition(async () => {
      const res = await warnUser(userId, reason);
      if (!res.success) {
        toast.error(res.error || "L'avertissement n'est pas parti.");
        return;
      }
      toast.success("Avertissement envoyé.");
      onWarned();
    });
  };

  return (
    <div className="flex flex-col gap-4 pt-1 pb-2">
      <Field label="Motif de l'avertissement" htmlFor="warn-reason" error={error}>
        <Textarea
          id="warn-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError(undefined);
          }}
          placeholder="Ex. : insultes répétées dans le sujet de la CDF"
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
      </Field>
      <div className="flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
        <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={submit}>
          Envoyer l&apos;avertissement
        </Button>
        <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
