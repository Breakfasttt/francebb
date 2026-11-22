import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeCallbackUrl } from "@/lib/safeRedirect";
import OnboardingForm from "./OnboardingForm";
import OnboardingSuccess from "./OnboardingSuccess";
import LogoutButton from "@/common/components/LogoutButton/LogoutButton";

export const metadata = {
  title: "Bienvenue - BBFrance",
};

/**
 * Page d'inscription (onboarding) d'un nouveau membre. Refonte (carte 091, ADR 0006) : une seule colonne de blocs,
 * titre en tête, avec les composants et les couleurs v2 de packages/ui.
 * Carte 133 : la page que le membre voulait ouvrir arrive dans `?callbackUrl=` (posé par auth.config.ts). Seule une
 * adresse du site est gardée (safeCallbackUrl), et le membre y est envoyé à la fin de l'inscription.
 */
export default async function OnboardingPage(props: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await getActiveSession();
  const { callbackUrl: requestedUrl } = await props.searchParams;
  const callbackUrl = safeCallbackUrl(requestedUrl);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ligues: true }
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex justify-center px-3 py-6 font-bb-sans text-base text-bb-text lg:py-12">
      <section aria-labelledby="onboarding-title" className="flex w-full max-w-2xl flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 id="onboarding-title" className="font-bb-display text-[1.75rem] lg:text-[2.25rem] text-bb-text">
            Bienvenue Coach !
          </h1>
          {!user.hasFinishedOnboarding && (
            <p className="m-0 text-bb-text-muted">
              Dernière étape avant de fouler le gazon : personnalise ton profil. Seul le pseudo est obligatoire : le reste peut être rempli plus tard depuis ton profil.
            </p>
          )}
        </header>
        {user.hasFinishedOnboarding ? <OnboardingSuccess callbackUrl={callbackUrl} /> : <OnboardingForm user={user} callbackUrl={callbackUrl} />}
        {/* La page n'a pas de navigation (carte 221) : la déconnexion reste possible ici */}
        <div className="flex justify-center">
          <LogoutButton hubLogout={!!session.hubLogout} variant="quiet" />
        </div>
      </section>
    </div>
  );
}
