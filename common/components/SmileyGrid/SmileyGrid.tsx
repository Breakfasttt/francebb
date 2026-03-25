"use client";

import { smileysMap } from "@/lib/bbcode";

interface SmileyGridProps {
  onSelect: (code: string) => void;
}

export default function SmileyGrid({ onSelect }: SmileyGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
        gap: "0.5rem",
        maxHeight: "200px",
        overflowY: "auto",
        width: "100%",
        padding: "0.5rem"
      }}
    >
      {Object.entries(smileysMap).map(([code, emoji]) => (
        <button
          key={code}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onSelect(code);
          }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "4px",
            padding: "0.4rem",
            cursor: "pointer",
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            minHeight: "36px"
          }}
          title={code}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
