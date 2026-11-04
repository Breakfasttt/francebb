"use client";

/**
 * Validation des résultats d'un tournoi de la Coupe de France (CDF) par la modération (carte 162).
 * Les résultats d'un tournoi CDF ne comptent au classement national qu'une fois validés par un modérateur ou un
 * administrateur. Ce bloc dit à tout le monde où en sont les résultats (en attente ou validés) et, pour la modération
 * seulement, propose « Valider les résultats CDF » ou « Retirer la validation ». Le serveur revérifie le rôle
 * (`setCdfValidation`, app/tournois/actions.ts).
 * Affiché dans le bloc « Résultats du tournoi » du sujet et sur la page du classement final du tournoi.
 */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, ShieldCheck } from "lucide-react";
import { Button, cn, toast } from "@bbfrance/ui";
import { setCdfValidation } from "@/app/tournois/actions";

interface CdfValidationPanelProps {
  tournamentId: string;
  /** Date de validation, vide tant que la modération n'a pas validé les résultats. */
  validatedAt: Date | string | null;
  /** Vrai pour un modérateur ou un administrateur. */
  canValidate: boolean;
}

export default function CdfValidationPanel({ tournamentId, validatedAt, canValidate }: CdfValidationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isValidated = !!validatedAt;

  const toggle = () => {
    startTransition(async () => {
      const response = await setCdfValidation(tournamentId, !isValidated);
      if ("error" in response) {
        toast.error(response.error);
        return;
      }
      toast.success(isValidated ? "La validation des résultats CDF est retirée." : "Les résultats CDF sont validés : ils comptent au classement.");
      router.refresh();
    });
  };

  const date = validatedAt ? new Date(validatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-bb-md border px-3 py-3 lg:flex-row lg:items-center",
        isValidated ? "border-bb-border bg-bb-surface-2" : "border-bb-warning-text bg-bb-surface-2"
      )}
      data-testid="cdf-validation"
    >
      <p className="m-0 flex min-w-0 flex-1 items-start gap-2 text-[0.95rem] text-bb-text">
        {isValidated ? (
          <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text" />
        ) : (
          <Clock size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-warning-text" />
        )}
        <span>
          {isValidated
            ? `Résultats validés par la modération le ${date} : ils comptent au classement de la Coupe de France.`
            : "Résultats en attente de validation par la modération : ils ne comptent pas encore au classement de la Coupe de France."}
        </span>
      </p>
      {canValidate && (
        <Button
          type="button"
          variant={isValidated ? "secondary" : "primary"}
          size="tap"
          className="shrink-0 max-lg:w-full"
          onClick={toggle}
          disabled={isPending}
        >
          {isValidated ? "Retirer la validation" : "Valider les résultats CDF"}
        </Button>
      )}
    </div>
  );
}
