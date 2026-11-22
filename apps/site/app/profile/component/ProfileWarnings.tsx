"use client";

/**
 * Avertissements de la modération reçus par un membre (carte 222), en tête de la colonne de contenu. Le membre voit les
 * siens sur `/profile` (ancre `#avertissements`, où mène la notification) ; la modération les voit sur sa fiche
 * `/spy/[id]`, avec le pseudo du modérateur. Rien n'est affiché tant qu'il n'y en a aucun. L'action serveur refuse tout
 * autre lecteur.
 */
import { useEffect, useState } from "react";
import { Card } from "@bbfrance/ui";
import RelativeTime from "@/common/components/RelativeTime/RelativeTime";
import { getMemberWarnings, type MemberWarning } from "@/app/membres/actions";

export default function ProfileWarnings({ userId, isOwnProfile, refreshKey = 0 }: {
  userId: string;
  isOwnProfile: boolean;
  /** Change après un nouvel avertissement, pour relire la liste. */
  refreshKey?: number;
}) {
  const [warnings, setWarnings] = useState<MemberWarning[]>([]);

  useEffect(() => {
    let cancelled = false;
    getMemberWarnings(userId)
      .then((list) => {
        if (!cancelled) setWarnings(list);
      })
      .catch(() => {
        if (!cancelled) setWarnings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  if (warnings.length === 0) return null;

  return (
    <Card id="avertissements" className="flex scroll-mt-20 flex-col gap-1 px-4 pt-4 pb-1.5 lg:px-5">
      <h2 className="font-bb-heading text-base text-bb-text">Avertissements ({warnings.length})</h2>
      {isOwnProfile && <p className="m-0 text-sm text-bb-text-muted">Visible par toi et par l&apos;équipe de modération seulement.</p>}
      <ul className="m-0 flex list-none flex-col divide-y divide-bb-border p-0">
        {warnings.map((warning) => (
          <li key={warning.id} className="flex flex-col gap-1 py-2.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
            <p className="m-0 min-w-0 break-words text-bb-text">{warning.reason}</p>
            <p className="m-0 shrink-0 text-sm text-bb-text-muted">
              <RelativeTime date={warning.createdAt} />
              {warning.moderatorName && <> · par {warning.moderatorName}</>}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
