import { signIn, isHubAuthMode } from "@/auth";
import { getSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/safeRedirect";
import "./page.css";
import "./page-mobile.css";
import { Mail, LogIn } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DevLoginSection from "./DevLoginSection";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { DiscordIcon, GoogleIcon } from "@/common/components/Icons/SocialIcons";

export const metadata = {
  title: "Connexion - BBFrance",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  // Session brute (bannis compris) : un membre déjà connecté, même banni, n'a rien à faire sur cette page.
  const session = await getSession();
  const searchParams = await props.searchParams;
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);

  if (session) {
    redirect(callbackUrl);
  }

  const error = searchParams.error;

  const isDiscordEnabled = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  const isGoogleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isEmailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

  const isHubEnabled = isHubAuthMode;
  const hasAnyMethod = isHubEnabled || isDiscordEnabled || isGoogleEnabled || isEmailEnabled;
  
  // Récupération des comptes de test en mode dev (aligné avec DebugAuthWidget)
  const devUsers = process.env.NODE_ENV === "development" 
    ? await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: "system" } },
            {
              OR: [
                { email: { contains: "@test.com" } },
                { id: { startsWith: "test_" } },
                { id: { startsWith: "user_test_" } },
                { role: { in: ["SUPERADMIN", "ADMIN", "MODERATOR"] } }
              ]
            }
          ]
        },
        select: { id: true, name: true, email: true, role: true, image: true },
        take: 10,
        orderBy: { name: "asc" }
      })
    : [];

  return (
    <main className="login-container">
      <PremiumCard className="login-card">
        <h1 className="login-title">Connexion</h1>
        
        {error === "OAuthAccountNotLinked" && (
          <div className="auth-error">
            Cet email est déjà lié à un autre mode de connexion.
          </div>
        )}

        <div className="login-methods">
          {!hasAnyMethod && (
            <div className="auth-error">
              L'authentification n'est pas encore configurée sur ce serveur.
            </div>
          )}

          {/* Hub d'identité (AUTH_MODE=hub) */}
          {isHubEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("hub", { redirectTo: callbackUrl });
              }}
            >
              <CTAButton type="submit" fullWidth>
                Se connecter avec le compte BBFrance
              </CTAButton>
            </form>
          )}

          {/* Discord */}
          {isDiscordEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: callbackUrl });
              }}
            >
              <ClassicButton type="submit" fullWidth className="discord-btn" icon={<DiscordIcon size={20} />}>
                Se connecter avec Discord
              </ClassicButton>
            </form>
          )}

          {/* Google */}
          {isGoogleEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <ClassicButton type="submit" fullWidth className="google-btn" icon={<GoogleIcon size={20} />}>
                Se connecter avec Google
              </ClassicButton>
            </form>
          )}

          {hasAnyMethod && isEmailEnabled && (isDiscordEnabled || isGoogleEnabled) && (
            <div className="login-divider">
              <span>OU</span>
            </div>
          )}

          {/* Magic Link */}
          {isEmailEnabled && (
            <form
              className="magic-link-form"
              action={async (formData) => {
                "use server";
                const email = formData.get("email");
                if (email) {
                  await signIn("nodemailer", { email, redirectTo: callbackUrl });
                }
              }}
            >
              <div className="input-with-icon-wrapper">
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nom@exemple.fr"
                    required
                  />
                </div>
              </div>
              <CTAButton type="submit" fullWidth icon={<LogIn size={18} />}>
                Recevoir un lien magique
              </CTAButton>
            </form>
          )}

          {/* Dev Login (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <DevLoginSection 
              initialUsers={devUsers} 
              callbackUrl={callbackUrl} 
            />
          )}
        </div>

        <p className="login-footer">
          En vous connectant, vous acceptez nos mentions légales.
        </p>
      </PremiumCard>
    </main>
  );
}
