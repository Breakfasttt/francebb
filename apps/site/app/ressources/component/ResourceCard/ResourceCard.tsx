"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { ExternalLink, Tag as TagIcon, Edit, Trash2 } from "lucide-react";
import "./ResourceCard.css";
import "./ResourceCard-mobile.css";


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

  useEffect(() => {
    setImgSrc(resource.imageUrl || FALLBACK_IMAGE);
  }, [resource.imageUrl]);

  if (viewMode === "list") {
    return (
      <PremiumCard 
        onClick={() => {
          if (isExternal) window.open(resource.link, '_blank');
          else window.location.href = resource.link;
        }}
        className={`resource-list-item clickable ${resource.isSystem ? 'system-resource' : ''}`}
        hoverEffect={true}
      >
        <div className="list-col-title">
          {resource.isSystem && <span className="system-badge-mini" title="Officiel">O</span>}
          <div className="list-resource-title">{resource.title}</div>
        </div>

        <div className="list-col-tags">
          {resource.tags.slice(0, 3).map(tag => (
            <span key={tag.id} className="tag-badge-mini">{tag.name}</span>
          ))}
        </div>

        <div className="list-col-actions">
           <ExternalLink size={14} className="link-icon" />
           {(canEdit || canDelete) && (
            <div className="mini-actions" onClick={e => e.stopPropagation()}>
              {canEdit && (
                <Link href={`/ressources/edit/${resource.id}`} className="mini-action edit" onClick={e => e.stopPropagation()}><Edit size={12} /></Link>
              )}
              {canDelete && !resource.isSystem && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }} 
                  className="mini-action delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
           )}
        </div>
      </PremiumCard>
    );
  }
  
  return (
    <PremiumCard className={`resource-card ${resource.isSystem ? 'system-resource' : ''}`} hoverEffect={true}>
      <Link 
        href={resource.link} 
        className="resource-card-link-wrapper" 
        target={isExternal ? '_blank' : '_self'}
      >
        <div className="resource-image">
          <img 
            src={imgSrc} 
            alt={resource.title} 
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
        </div>
        
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
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Edit size={14} />
            </Link>
          )}
          {(canDelete && !resource.isSystem) && (
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
    </PremiumCard>
  );
}
