"use client";

import { useSearchParams } from "next/navigation";
import "./page.css";

const ROLES = [
  { id: "user_test_superadmin", name: "SuperAdmin", icon: "👑" },
  { id: "user_test_admin", name: "Administrateur", icon: "🛡️" },
  { id: "user_test_moderator", name: "Modérateur", icon: "⚔️" },
  { id: "user_test_rtc", name: "RTC", icon: "🎯" },
  { id: "user_test_chefligue", name: "Chef de Ligue", icon: "🚩" },
  { id: "user_test_breakyt", name: "Breakyt (Admin)", icon: "🦖" },
  { id: "user_test_coach1", name: "Coach Blood Bowl", icon: "🏈" },
];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback") || "/";

  const handleConnect = (userId: string) => {
    document.cookie = `simulated_user_id=${userId}; path=/; max-age=31536000`;
    window.location.href = callbackUrl;
  };

  return (
    <main className="login-container">
      <div className="login-card">
        <h1 className="login-title">Connexion</h1>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Choisissez un compte pour simuler une connexion.<br/>
          <i>Mode Simulation Activé</i>
        </p>
        
        <div className="role-list">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleConnect(role.id)}
              className="role-button"
            >
              <div className="role-icon">{role.icon}</div>
              <span>{role.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
