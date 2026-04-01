"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface ReportArticleButtonProps {
  articleId: string;
  articleTitle: string;
}

export default function ReportArticleButton({ articleId, articleTitle }: ReportArticleButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="action-button report" onClick={() => setShowModal(true)}>
        <Flag size={18} /> Signaler l'article
      </button>

      <ReportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        targetId={articleId}
        targetType="ARTICLE"
        itemTitle={articleTitle}
      />
    </>
  );
}
