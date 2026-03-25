"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function DeletionToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deletedTopic = searchParams.get("deletedTopic");
  const deletedForum = searchParams.get("deletedForum");
  const [show, setShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");

  useEffect(() => {
    if (deletedTopic || deletedForum) {
      setShow(true);
      if (deletedTopic) {
        setToastMessage("Sujet supprimé avec succès :");
        setToastTitle(decodeURIComponent(deletedTopic));
      } else if (deletedForum) {
        setToastMessage("Forum supprimé avec succès :");
        setToastTitle(decodeURIComponent(deletedForum));
      }

      const timer = setTimeout(() => {
        setShow(false);
        // Clean up the URL by removing the parameters
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("deletedTopic");
        currentParams.delete("deletedForum");
        const newUrl = window.location.pathname + (currentParams.toString() ? `?${currentParams.toString()}` : "");
        router.replace(newUrl, { scroll: false });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [deletedTopic, deletedForum, router]);

  if (!show || (!deletedTopic && !deletedForum)) return null;

  return (
    <div className="deletion-toast-container">
      <div className="deletion-toast">
        <div className="toast-icon">
          <Check size={18} />
        </div>
        <div className="toast-content">
          <p>{toastMessage}</p>
          <strong title={toastTitle}>{toastTitle}</strong>
        </div>
        <button onClick={() => setShow(false)} className="toast-close">
          <X size={14} />
        </button>
      </div>

      <style jsx>{`
        .deletion-toast-container {
          position: fixed;
          top: 8rem;
          right: 2rem;
          z-index: 9999;
          animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .deletion-toast {
          background: #1a1a20;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 197, 94, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          min-width: 300px;
          max-width: 450px;
          color: white;
          backdrop-filter: blur(8px);
        }

        .toast-icon {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
          font-size: 0.9rem;
          overflow: hidden;
        }

        .toast-content p {
          margin: 0;
          color: #aaa;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .toast-content strong {
          display: block;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
          margin-top: 1px;
        }

        .toast-close {
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
