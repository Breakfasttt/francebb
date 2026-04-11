"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import SmileyGrid from "@/common/components/SmileyGrid/SmileyGrid";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";

interface SmileyPickerProps {
  onSelect: (code: string) => void;
}

export default function SmileyPicker({ onSelect }: SmileyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="smiley-picker-container" ref={pickerRef} style={{ position: "relative", display: "inline-block" }}>
      <ClassicButton
        type="button"
        style={{ padding: "0.4rem" }}
        onClick={() => setIsOpen(!isOpen)}
        title="Insérer un smiley"
        icon={Smile}
      />

      {isOpen && (
        <PremiumCard
          className="smiley-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "0.5rem",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
            gap: "0.5rem",
            zIndex: 50,
            width: "280px",
            background: "rgba(20, 20, 25, 0.95)", // More opaque background
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <SmileyGrid onSelect={(code) => {
            onSelect(code);
            setIsOpen(false);
          }} />
        </PremiumCard>
      )}
    </div>
  );
}

