import { signIn } from "@/auth";
import "./page.css";
import { Mail, LogIn } from "lucide-react";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams.callbackUrl || "/";
  const error = searchParams.error;

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
          {/* Discord */}
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

          {/* Google */}
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

          <div className="login-divider">
            <span>OU</span>
          </div>

          {/* Magic Link */}
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
            <div className="input-group">
              <label htmlFor="email">Adresse email</label>
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
        </div>

        <p className="login-footer">
          En vous connectant, vous acceptez nos mentions légales.
        </p>
      </div>
    </main>
  );
}
