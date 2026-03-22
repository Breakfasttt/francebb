"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { seedMockUsers } from "@/app/debugActions";

// Only render in dev
if (process.env.NODE_ENV !== "development") {
  // We export a dummy component if not in dev, but ideally it's conditionally included
}

const ROLES = [
  { id: "user_test_superadmin", name: "SuperAdmin" },
  { id: "user_test_admin", name: "Admin" },
  { id: "user_test_conseil", name: "Conseil Orga" },
  { id: "user_test_moderator", name: "Modérateur" },
  { id: "user_test_orga", name: "Orga" },
  { id: "user_test_breakyt", name: "Breakyt (Admin)" }, // Legacy from original script
  { id: "user_test_coach1", name: "Coach 1" },
  { id: "user_test_coach2", name: "Coach 2" },
];

export default function DebugAuthWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (process.env.NODE_ENV !== "development") return null;

  const handleSwitch = (userId: string) => {
    document.cookie = `simulated_user_id=${userId}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  const handleSeed = async () => {
    const res = await seedMockUsers();
    alert(res.message);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif'
    }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            background: '#ff0055',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
          title="Debug Auth Switcher"
        >
          🐛
        </button>
      )}

      {isOpen && (
        <div style={{
          background: '#1a1a20',
          border: '1px solid #ff0055',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          width: '250px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Auth Simulateur</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem'}}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleSwitch(role.id)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eee',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,85,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {role.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSeed}
            style={{
              marginTop: '1rem',
              width: '100%',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}
          >
            Créer comptes de Test
          </button>
        </div>
      )}
    </div>
  );
}

