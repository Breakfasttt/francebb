"use client";

import { User as UserIcon, Ban } from "lucide-react";
import "./UserAvatar.css";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  postCount?: number;
  size?: number;
  className?: string; 
  isBanned?: boolean;
  selectedRank?: Rank | null;
  isModerator?: boolean;
}

export type Rank = "auto" | "none" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grand-master";

export const RANK_REQUIREMENTS: Record<Rank, number> = {
  "auto": 0,
  "none": 0,
  "bronze": 100,
  "silver": 300,
  "gold": 700,
  "platinum": 1000,
  "diamond": 2000,
  "master": 4000,
  "grand-master": 10000
};

export const getRank = (postCount: number): Rank => {
  if (postCount >= 10000) return "grand-master";
  if (postCount >= 4000) return "master";
  if (postCount >= 2000) return "diamond";
  if (postCount >= 1000) return "platinum";
  if (postCount >= 700) return "gold";
  if (postCount >= 300) return "silver";
  if (postCount >= 100) return "bronze";
  return "none";
};

export default function UserAvatar({ 
  image, 
  name, 
  postCount = 0, 
  size = 48, 
  className = "", 
  isBanned, 
  selectedRank,
  isModerator = false 
}: UserAvatarProps) {
  let rank = (!selectedRank || selectedRank === "auto") ? getRank(postCount) : selectedRank;
  
  // Si ce n'est pas automatique/aucun et que l'utilisateur n'est pas modo, 
  // on vérifie si le rang est débloqué.
  if (rank !== "none" && rank !== "auto" && !isModerator) {
    const minPosts = RANK_REQUIREMENTS[rank] || 0;
    if (postCount < minPosts) {
      rank = getRank(postCount);
    }
  }

  const containerSize = size + 12; 

  return (
    <div 
      className={`user-avatar-wrapper rank-${rank} ${isBanned ? 'is-banned' : ''} ${className}`} 
      style={{ width: containerSize, height: containerSize }}
    >
      {image ? (
        <img 
          src={image} 
          alt={name || "Avatar"} 
          className="user-avatar-img" 
          style={{ width: size, height: size }} 
        />
      ) : (
        <div className="user-avatar-placeholder" style={{ width: size, height: size }}>
          <UserIcon size={size * 0.6} />
        </div>
      )}
      <div className={`avatar-frame-border rank-${rank}`} />
      
    </div>
  );
}
