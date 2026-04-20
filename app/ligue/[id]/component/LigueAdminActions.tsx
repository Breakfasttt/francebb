"use client";

import React from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import { Settings, ArrowLeftRight, Trash2 } from "lucide-react";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";

interface LigueAdminActionsProps {
  ligueId: string;
  canManage: boolean;
}

export default function LigueAdminActions({ ligueId, canManage }: LigueAdminActionsProps) {
  return (
    <MobilePortal>
      <PremiumCard className="admin-actions-card">
        <h3>Gestion Ligue</h3>
        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <AdminButton 
            href={`/ligue/edit/${ligueId}`} 
            fullWidth 
            icon={<Settings size={18} />}
          >
            Modifier les infos
          </AdminButton>

          {canManage && (
            <>
              <AdminButton 
                fullWidth 
                icon={<ArrowLeftRight size={18} />}
              >
                Transférer propriété
              </AdminButton>
              <DangerButton 
                fullWidth 
                icon={<Trash2 size={18} />}
              >
                Supprimer la ligue
              </DangerButton>
            </>
          )}
        </div>
      </PremiumCard>
    </MobilePortal>
  );
}
