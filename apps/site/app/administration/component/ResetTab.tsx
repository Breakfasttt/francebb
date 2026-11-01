"use client";

/**
 * Onglet « Zone de danger » de l'administration (refonte, carte 099), réservé au super administrateur : la remise à
 * zéro du site, qui efface tout le contenu. Elle reste protégée comme avant la refonte : trois cases à cocher et la
 * phrase « JE COMPRENDS LES RISQUES » à recopier exactement ; tant que ce n'est pas fait, le bouton reste désactivé.
 * Le serveur vérifie de nouveau le rôle et la phrase. L'action `resetDatabase` est inchangée.
 */
import { useState, useTransition } from "react";
import { OctagonAlert, Trash2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, DESKTOP_QUERY, Field, Input, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import { resetDatabase } from "../actions";

const CONFIRM_PHRASE = "JE COMPRENDS LES RISQUES";

const CHECKS = [
  "Je comprends que tous les messages, sujets et conversations privées seront détruits.",
  "Je comprends que les données des coachs seront perdues.",
  "J'ai fait une sauvegarde de la base.",
];

export default function ResetTab() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // Les trois cases et la phrase de confirmation
  const [checks, setChecks] = useState([false, false, false]);
  const [confirmText, setConfirmText] = useState("");

  const isNukeReady = checks.every(Boolean) && confirmText === CONFIRM_PHRASE;

  const openModal = () => {
    setChecks([false, false, false]);
    setConfirmText("");
    setShowModal(true);
  };

  const handleNuke = () => {
    startTransition(async () => {
      const res = await resetDatabase(confirmText);
      if (res.success) {
        toast.success("Site réinitialisé !");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        toast.error("Échec : " + res.error);
        setShowModal(false);
      }
    });
  };

  return (
    <Card className="overflow-hidden border-bb-danger-text">
      <CardHeader>
        <OctagonAlert size={18} className="text-bb-danger-text" aria-hidden="true" />
        <CardTitle className="text-bb-danger-text">Zone de danger</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="m-0 text-[0.95rem] leading-relaxed text-bb-text">
          La remise à zéro <strong className="text-bb-danger-text">supprime tout le contenu du site</strong> : messages, sujets,
          forums, tournois, conversations privées et comptes des membres (sauf les super administrateurs). Elle ne peut pas
          être annulée.
        </p>
        <Button type="button" variant="danger" size="tap" className="w-full lg:w-auto lg:self-start" onClick={openModal}>
          <Trash2 size={18} aria-hidden="true" />
          Remise à zéro du site
        </Button>
      </CardBody>

      <Sheet open={showModal} onOpenChange={(open) => { if (!isPending) setShowModal(open); }}>
        <SheetContent
          title="Remise à zéro du site"
          description="Cochez les trois cases puis recopiez la phrase de confirmation."
          side={isDesktop ? "center" : "bottom"}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex flex-col gap-4 pt-2 pb-2">
            <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
              <legend className="sr-only">Confirmations</legend>
              {CHECKS.map((text, i) => (
                <label key={text} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] text-bb-text">
                  <input
                    type="checkbox"
                    checked={checks[i]}
                    onChange={(e) => setChecks((prev) => prev.map((value, j) => (j === i ? e.target.checked : value)))}
                    className="size-5 shrink-0 cursor-pointer accent-[var(--bb-danger)]"
                  />
                  {text}
                </label>
              ))}
            </fieldset>

            <div className="rounded-bb-md border border-dashed border-bb-danger-text p-3">
              <Field label="Phrase de confirmation" htmlFor="reset-phrase" hint={`Recopiez exactement : ${CONFIRM_PHRASE}`}>
                <Input
                  id="reset-phrase"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="font-bold"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row-reverse">
              <Button type="button" variant="danger" size="tap" className="w-full lg:w-auto" disabled={!isNukeReady || isPending} onClick={handleNuke}>
                {isPending ? "Remise à zéro…" : "Remettre le site à zéro"}
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={() => setShowModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
