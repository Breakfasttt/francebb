import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import "./page.css";
import { Mail, LogIn } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DevLoginSection from "./DevLoginSection";

export const metadata = {
  title: "Connexion - BBFrance",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams.callbackUrl || "/";

  if (session) {
    redirect(callbackUrl);
  }

  const error = searchParams.error;

  const isDiscordEnabled = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  const isGoogleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isEmailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

  const hasAnyMethod = isDiscordEnabled || isGoogleEnabled || isEmailEnabled;
  
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
      <div className="login-card">
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

          {/* Discord */}
          {isDiscordEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: callbackUrl });
              }}
            >
              <button type="submit" className="login-method-button discord">
                <span className="method-icon">🎮</span>
                Se connecter avec Discord
              </button>
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
              <button type="submit" className="login-method-button google">
                <span className="method-icon">📧</span>
                Se connecter avec Google
              </button>
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
              <button type="submit" className="login-method-button email">
                <LogIn size={18} />
                Recevoir un lien magique
              </button>
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
      </div>
    </main>
  );
}
