/**
 * Types du plateau BBScheme (pions, images, rosters, dessins), partagés par le lecteur et par l'éditeur /bbscheme du site.
 * Déplacés tels quels depuis apps/site/app/bbscheme/page.tsx (carte 024).
 */
export type TokenType = 'blue' | 'red' | 'ball';
export type ToolType = 'select' | 'draw' | 'player' | 'ball' | 'status' | 'eraser';
export type TokenStatus = 'up' | 'prone' | 'stunned' | 'bonehead' | 'stupid' | 'fourchette';
export type TokenLocation = 'box' | 'pitch' | 'reserve' | 'ko' | 'injured' | 'expelled';

export interface BoardFrame {
  tokens: TokenData[];
  blueRosterFile?: string | null;
  redRosterFile?: string | null;
}

export interface PlayerRosterInfo {
  name: string;
  qty: string;
  ma: string;
  st: string;
  ag: string;
  pa: string;
  av: string;
  skills: string[];
  primary: string;
  secondary: string;
  cost: number;
  acronym?: string;
  parentRoster?: any;
}

export interface RosterData {
  name: string;
  roster: PlayerRosterInfo[];
  specialRules?: string[];
}

export interface TokenData {
  id: string;
  type: TokenType;
  x: number;
  y: number;
  status: TokenStatus;
  location: TokenLocation;
  attachedToId?: string; // Pour le ballon
  number?: number;
  playerInfo?: PlayerRosterInfo; // Added for roster integration
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
}
