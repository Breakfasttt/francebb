import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";
import "../login/page.css";
import "./onboarding.css";

export const metadata = {
  title: "Bienvenue - BBFrance",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.hasFinishedOnboarding) {
    redirect("/");
  }

  return (
    <main className="login-container">
      <div className="login-card onboarding-card">
        <h1 className="login-title">Bienvenue Coach !</h1>
        <p className="onboarding-subtitle">
          Dernière étape avant de fouler le gazon : personnalisez votre profil.
        </p>

        <OnboardingForm defaultName={session.user.name || ""} />

        <p className="login-footer">
          Vous pourrez modifier tout cela plus tard dans votre profil.
        </p>
      </div>
    </main>
  );
}
