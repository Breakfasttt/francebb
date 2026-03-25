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
}

export type Rank = "auto" | "none" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grand-master";

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

export default function UserAvatar({ image, name, postCount = 0, size = 48, className = "", isBanned, selectedRank }: UserAvatarProps) {
  const rank = (!selectedRank || selectedRank === "auto") ? getRank(postCount) : selectedRank;
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
      
      {isBanned && (
        <div className="avatar-banned-overlay">
          BAN
        </div>
      )}
    </div>
  );
}
