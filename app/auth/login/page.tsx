import { signIn } from "@/auth";
import "./page.css";
import { Mail, LogIn } from "lucide-react";

export const metadata = {
  title: "Connexion - BBFrance",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams.callbackUrl || "/";
  const error = searchParams.error;

  const isDiscordEnabled = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  const isGoogleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isEmailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

  const hasAnyMethod = isDiscordEnabled || isGoogleEnabled || isEmailEnabled;

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
            <div className="dev-login-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, textAlign: 'center', marginBottom: '1rem' }}>Mode Développement</p>
              <form
                action={async () => {
                  "use server";
                  // On tente de se connecter avec l'admin par défaut
                  await signIn("dev-login", { userId: "user_test_admin", redirectTo: callbackUrl });
                }}
              >
                <button type="submit" className="login-method-button" style={{ background: 'linear-gradient(135deg, #ff0055, #ff5500)', border: 'none' }}>
                  🚀 Connexion Dev (Admin)
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="login-footer">
          En vous connectant, vous acceptez nos mentions légales.
        </p>
      </div>
    </main>
  );
}
