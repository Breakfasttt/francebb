"use client";

/**
 * Onglet « Utilisateurs bloqués » du profil (refonte, carte 092) : les membres que l'on a bloqués, avec leur rôle
 * (libellé lisible) et un bouton « Débloquer ». Les actions `getBlockedUsers` et `toggleBlockUser` sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { Info, UserX } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState, Skeleton, toast } from "@bbfrance/ui";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { getBlockedUsers, toggleBlockUser } from "@/app/profile/actions";
import { getRoleLabel } from "@/lib/roles";

type BlockedUser = { id: string; name: string | null; image: string | null; role: string };

export default function ProfileBlockedUsers({ roleLabels }: { roleLabels?: Record<string, string> }) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[] | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getBlockedUsers()
      .then((users) => setBlockedUsers(users as BlockedUser[]))
      .catch((err) => {
        console.error("Failed to load blocked users:", err);
        setBlockedUsers([]);
      });
  }, []);

  const handleUnblock = (userId: string) => {
    startTransition(async () => {
      try {
        const res = await toggleBlockUser(userId);
        if (!res.success) {
          toast.error(res.error || "Erreur lors du déblocage");
          return;
        }
        setBlockedUsers((prev) => (prev ?? []).filter((u) => u.id !== userId));
        toast.success("Utilisateur débloqué");
      } catch {
        toast.error("Erreur lors du déblocage");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <UserX size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Utilisateurs bloqués</CardTitle>
        </CardHeader>
        {blockedUsers === null ? (
          <div className="flex flex-col gap-3 p-4">
            {[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : blockedUsers.length === 0 ? (
          <EmptyState icon={<UserX size={32} />} title="Aucun utilisateur bloqué">
            Vous pouvez bloquer un membre depuis son profil.
          </EmptyState>
        ) : (
          <ul className="m-0 list-none p-0">
            {blockedUsers.map((user) => (
              <li key={user.id} className="flex min-h-16 items-center gap-3 border-b border-bb-border px-4 py-2.5 last:border-b-0">
                <UserAvatar image={user.image} name={user.name} size={40} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-bb-text">{user.name}</span>
                  <span className="text-sm text-bb-text-muted">{getRoleLabel(user.role || "COACH", roleLabels)}</span>
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="tap"
                  disabled={isPending}
                  aria-label={`Débloquer ${user.name ?? ""}`.trim()}
                  onClick={() => handleUnblock(user.id)}
                >
                  Débloquer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardBody className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-bb-text-muted" aria-hidden="true" />
          <p className="m-0 text-sm leading-relaxed text-bb-text-muted">
            Le blocage est à sens unique : vous ne voyez plus les messages de ces membres et ils ne peuvent plus vous
            contacter. Ils voient toujours vos messages publics, sauf s&apos;ils vous ont bloqué à leur tour.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
