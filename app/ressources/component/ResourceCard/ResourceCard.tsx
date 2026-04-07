"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { ExternalLink, Tag as TagIcon, Edit, Trash2 } from "lucide-react";
import "./ResourceCard.css";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    link: string;
    isSystem?: boolean;
    authorId?: string;
    tags: { id: string; name: string }[];
  };
  viewMode?: "grid" | "list";
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FALLBACK_IMAGE = "/images/resource-placeholder.png";

export default function ResourceCard({ 
  resource, 
  viewMode = "grid",
  canEdit,
  canDelete,
  onEdit,
  onDelete
}: ResourceCardProps) {
  const isExternal = resource.link.startsWith('http');
  const [imgSrc, setImgSrc] = useState<string>(resource.imageUrl || FALLBACK_IMAGE);

  // Sync state if prop changes (e.g. after editing)
  useEffect(() => {
    setImgSrc(resource.imageUrl || FALLBACK_IMAGE);
  }, [resource.imageUrl]);
  
  return (
    <PremiumCard className={`resource-card ${viewMode} ${resource.isSystem ? 'system-resource' : ''}`}>
      <div className="resource-card-inner">
        <Link 
          href={resource.link} 
          className="resource-card-link-wrapper" 
          target={isExternal ? '_blank' : '_self'}
        >
          {viewMode === "grid" && (
            <div className="resource-image">
              <img 
                src={imgSrc} 
                alt={resource.title} 
                onError={() => setImgSrc(FALLBACK_IMAGE)}
              />
            </div>
          )}
          
          <div className="resource-content">
            <div className="resource-header">
              {resource.isSystem && <span className="system-badge">Officiel</span>}
              <h3>{resource.title}</h3>
            </div>
            
            <p className="resource-description">{resource.description}</p>
            
            <div className="resource-tags">
              {resource.tags.map(tag => (
                <span key={tag.id} className="tag-badge">
                  <TagIcon size={10} /> {tag.name}
                </span>
              ))}
            </div>
            
            <div className="resource-footer">
              <span className="resource-link-label">
                Accéder <ExternalLink size={14} />
              </span>
            </div>
          </div>
        </Link>

        {(canEdit || canDelete) && (
          <div className="resource-actions-overlay">
            {canEdit && (
              <Link 
                href={`/ressources/edit/${resource.id}`}
                className="action-btn edit"
                title="Éditer"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit size={14} />
              </Link>
            )}
            {canDelete && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }}
                className="action-btn delete"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
