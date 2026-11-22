/**
 * Page affichée à un membre banni (refonte, carte 090, ADR 0006 ; carte 221) : raison du bannissement, comment le
 * contester, et « Me déconnecter », la seule sortie (toute autre rubrique le renvoie ici, et la coquille n'affiche pas
 * de navigation sur cette page). Le lien Discord vient du réglage `discord_invite` de l'administration ; sans lui, une
 * phrase générique. Un bannissement temporaire (carte 222) affiche sa date de fin.
 */
import { getSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { Card } from "@bbfrance/ui";
import { redirect } from "next/navigation";
import LogoutButton from "@/common/components/LogoutButton/LogoutButton";
import { formatBanEnd } from "@/lib/banDuration";

export const dynamic = "force-dynamic";

export default async function BannedPage() {
  // Session brute : getActiveSession() renverrait null pour un banni, or cette page lui est justement destinée.
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const [user, discord] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBanned: true, banReason: true, bannedUntil: true }
    }),
    prisma.siteSetting.findUnique({ where: { key: "discord_invite" }, select: { value: true } })
  ]);

  if (!user?.isBanned) {
    redirect("/");
  }

  const discordUrl = discord?.value && /^https:\/\//.test(discord.value) ? discord.value : null;

  return (
    <div className="flex justify-center px-4 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <section aria-labelledby="banned-title" className="w-full max-w-xl">
        <Card className="flex flex-col gap-4 p-5 lg:p-8">
          <h1 id="banned-title" className="font-bb-display text-[1.75rem] text-bb-text lg:text-[2.25rem]">
            {user.bannedUntil ? "Compte suspendu" : "Compte banni"}
          </h1>
          {user.bannedUntil ? (
            <p className="m-0 text-bb-text">
              La modération a suspendu ton compte jusqu’au <strong>{formatBanEnd(user.bannedUntil)}</strong>.
              D’ici là, tu ne peux ni lire ni écrire sur le site. À cette date, reviens : ton accès revient tout seul.
            </p>
          ) : (
            <p className="m-0 text-bb-text">
              L’équipe de modération a suspendu ton compte. Tu ne peux plus lire ni écrire sur le site avec ce compte.
            </p>
          )}

          <div className="rounded-bb-md border border-bb-border bg-bb-surface-2 p-4">
            <h2 className="text-sm font-semibold text-bb-text-muted">{user.bannedUntil ? "Raison de la suspension" : "Raison du bannissement"}</h2>
            <p className="m-0 mt-1 break-words text-bb-text">
              {user.banReason ? `« ${user.banReason} »` : "L’équipe n’a pas donné de raison."}
            </p>
          </div>

          <p className="m-0 text-bb-text-muted">
            {discordUrl ? (
              <>
                Pour contester, contacte l’équipe sur le{" "}
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-bb-accent-text underline underline-offset-2">
                  serveur Discord de la communauté
                </a>
                .
              </>
            ) : (
              "Pour contester, contacte un membre de l’équipe de modération sur les réseaux de la communauté."
            )}
          </p>

          <div>
            <LogoutButton hubLogout={!!session.hubLogout} />
          </div>
        </Card>
      </section>
    </div>
  );
}
