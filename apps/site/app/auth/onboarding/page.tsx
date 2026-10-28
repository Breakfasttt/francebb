import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";
import OnboardingSuccess from "./OnboardingSuccess";
import "../login/page.css";
import "./onboarding.css";

export const metadata = {
  title: "Bienvenue - BBFrance",
};

export default async function OnboardingPage() {
  const session = await auth();

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
    <main className="login-container">
      <div className="onboarding-wrapper">
        <h1 className="login-title">Bienvenue Coach !</h1>
        {user.hasFinishedOnboarding ? (
          <OnboardingSuccess />
        ) : (
          <>
            <p className="onboarding-subtitle">
              Dernière étape avant de fouler le gazon : personnalisez votre profil complet.
            </p>
            <OnboardingForm user={user} />
          </>
        )}
      </div>
    </main>
  );
}
