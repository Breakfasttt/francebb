"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`toast-container ${isVisible ? 'fade-in' : 'fade-out'}`}>
      <div className={`toast ${type}`}>
        <div className="toast-icon">
          {type === "success" ? "✓" : "!"}
        </div>
        <div className="toast-message">{message}</div>
      </div>

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: rgba(26, 26, 32, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          color: white;
          min-width: 300px;
        }

        .toast.success {
          border-left: 4px solid #4CAF50;
        }

        .toast.error {
          border-left: 4px solid #f44336;
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          flex-shrink: 0;
        }

        .toast.success .toast-icon {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
        }

        .toast.error .toast-icon {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .fade-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        .fade-out {
          animation: slideOut 0.3s ease-in forwards;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>,
    document.body
  );
}
