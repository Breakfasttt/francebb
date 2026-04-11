"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import ClassicButton from "@/common/components/Button/ClassicButton";

interface ReportArticleButtonProps {
  articleId: string;
  articleTitle: string;
}

export default function ReportArticleButton({ articleId, articleTitle }: ReportArticleButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ClassicButton onClick={() => setShowModal(true)} icon={Flag} fullWidth>
        Signaler l'article
      </ClassicButton>

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
