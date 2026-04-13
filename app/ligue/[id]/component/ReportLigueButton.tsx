"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface ReportLigueButtonProps {
  ligueId: string;
  ligueName: string;
}

export default function ReportLigueButton({ ligueId, ligueName }: ReportLigueButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ClassicButton 
        fullWidth 
        onClick={() => setShowModal(true)} 
        icon={<AlertTriangle size={18} />}
      >
        Signaler la ligue
      </ClassicButton>

      <ReportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        targetId={ligueId}
        targetType="LIGUE"
        itemTitle={ligueName}
      />
    </>
  );
}
