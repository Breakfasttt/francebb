"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Paintbrush, Palette, Check } from "lucide-react";

const THEMES = [
  { id: "saison3", name: "Saison 3", color: "#ffd700" },
  { id: "default", name: "Default (Dark)", color: "#c21d1d" },
  { id: "light", name: "Light Mode", color: "#ffffff" },
  { id: "blood", name: "Blood theme", color: "#8d0000" },
  { id: "malpierre", name: "Malpierre", color: "#00ff00" },
  { id: "naf", name: "NAF theme", color: "#004175" },
  { id: "nehekhara", name: "Nehekhara", color: "#444444" },
];

export default function DebugThemeWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.2rem',
      right: '9.5rem', // Offset to be next to Dev Auth
      zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
          title="Switch de Thème Dev"
        >
          <Paintbrush size={16} />
          Dev Theme
        </button>
      )}

      {isOpen && (
        <div style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          width: '240px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} color="#a78bfa" />
              Thèmes
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem'}}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  // setIsOpen(false); // Optionnel: fermer après clic
                }}
                style={{
                  background: theme === t.id ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: theme === t.id ? '1px solid rgba(124, 58, 237, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: theme === t.id ? '#fff' : '#ccc',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: t.color,
                  border: '1px solid rgba(255,255,255,0.2)'
                }} />
                <span style={{ flex: 1 }}>{t.name}</span>
                {theme === t.id && <Check size={14} color="#a78bfa" />}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.7rem', opacity: 0.5, textAlign: 'center' }}>
            Mode Debug Thème Actif
          </div>
        </div>
      )}
    </div>
  );
}
