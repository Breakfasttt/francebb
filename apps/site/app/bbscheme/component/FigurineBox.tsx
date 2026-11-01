"use client";

/**
 * Réserve des pions d'une équipe de BBScheme : choix du roster, puis les pions encore hors du terrain, rangés par
 * poste. Refaite par la carte 100 avec les composants de packages/ui et les variables de couleur v2 : sur ordinateur,
 * c'est une colonne de chaque côté du terrain ; sur téléphone, elle s'affiche dans un panneau qui monte du bas.
 *
 * Un appui sur un pion le choisit (puis un appui sur une case du terrain l'y place). Un appui ailleurs dans la réserve
 * y range le pion choisi : les zones marquées `data-no-box-click` (en-tête, rangées de pions) ne déclenchent pas ce
 * rangement.
 * Les couleurs des deux équipes (bleu, rouge) sont celles des pions du terrain, les mêmes dans tous les thèmes.
 */
import React from "react";
import { Token, type PlayerRosterInfo, type TokenData } from "@bbfrance/bbscheme-player";
import { Loader2 } from "lucide-react";
import { Select, cn } from "@bbfrance/ui";

interface FigurineBoxProps {
  team: "blue" | "red";
  roster: PlayerRosterInfo[];
  tokens: TokenData[];
  rosterList: { name: string; file: string }[];
  onRosterSelect: (file: string) => void;
  onTokenClick: (id: string) => void;
  onBoxClick: () => void;
  selectedId: string | null;
  rosterFile?: string;
  isLoading?: boolean;
  showTooltips?: boolean;
  allTokens?: TokenData[];
  /** Masque le titre de la réserve (déjà donné par le panneau qui la contient, sur téléphone). */
  hideTitle?: boolean;
  className?: string;
}

const TEAM = {
  blue: { title: "Réserve de l'équipe bleue", roster: "Roster de l'équipe bleue", bar: "border-t-blue-500", dot: "bg-blue-500" },
  red: { title: "Réserve de l'équipe rouge", roster: "Roster de l'équipe rouge", bar: "border-t-red-500", dot: "bg-red-500" },
} as const;

/** Quantité maximale d'un poste (« 0-16 » donne 16), pour ranger les postes du plus rare au plus courant. */
const maxQty = (player: PlayerRosterInfo) => Math.max(...player.qty.split("-").map(Number));

const FigurineBox: React.FC<FigurineBoxProps> = ({
  team,
  roster,
  tokens,
  rosterList,
  onRosterSelect,
  onTokenClick,
  onBoxClick,
  selectedId,
  rosterFile,
  isLoading,
  showTooltips,
  allTokens = [],
  hideTitle,
  className,
}) => {
  const colors = TEAM[team];
  const selectId = `bbscheme-roster-${team}`;
  return (
    <div
      role="region"
      aria-label={colors.title}
      aria-busy={isLoading || undefined}
      className={cn(
        "flex min-h-0 flex-col rounded-bb-lg border border-t-4 border-bb-border bg-bb-surface text-bb-text",
        colors.bar,
        isLoading && "pointer-events-none opacity-60",
        className
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-no-box-click]")) return;
        onBoxClick();
      }}
    >
      <div data-no-box-click="" className="flex shrink-0 flex-col gap-2 border-b border-bb-border p-3">
        {!hideTitle && (
          <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-sm font-bold text-bb-text normal-case not-italic">
            <span aria-hidden="true" className={cn("size-3 rounded-full", colors.dot)} />
            {colors.title}
            {isLoading && <Loader2 size={16} className="animate-spin text-bb-text-muted" aria-label="Chargement du roster" />}
          </h2>
        )}
        <Select id={selectId} aria-label={colors.roster} value={rosterFile || ""} onChange={(e) => onRosterSelect(e.target.value)}>
          <option value="">Aucun roster</option>
          {rosterList.map((r) => (
            <option key={`${team}-${r.file}`} value={r.file}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {roster.length === 0 ? (
          <p className="m-0 px-2 py-6 text-center text-sm text-bb-text-muted">Choisissez un roster pour afficher les pions de l&apos;équipe.</p>
        ) : (
          [...roster].sort((a, b) => maxQty(a) - maxQty(b)).map((player, idx) => {
            // Pions de ce poste qui ne sont pas sur le terrain (la fonction « fosses » est désactivée : tout ce qui
            // n'est pas sur le terrain est en réserve)
            const playerTokens = tokens.filter((t) => t.type === team && t.location !== "pitch" && t.playerInfo?.name === player.name);
            return (
              <div key={`${player.name}-${idx}`} className="flex flex-col gap-1.5 border-b border-bb-border pb-3 last:border-b-0">
                <div className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                  <span>{player.name}</span>
                  <span className="text-xs font-normal text-bb-text-muted">{player.qty}</span>
                </div>
                <div data-no-box-click="" role="list" aria-label={player.name} className="flex min-h-10 flex-wrap items-center gap-2">
                  {playerTokens.map((token) => {
                    const carriedBall = allTokens.find((t) => t.type === "ball" && t.attachedToId === token.id);
                    return (
                      <div key={token.id} role="listitem" aria-label={`${player.name} n° ${token.number}`}>
                        <Token
                          token={token}
                          showTooltip={showTooltips}
                          onClick={() => onTokenClick(token.id)}
                          isSelected={selectedId === token.id}
                          hasBall={!!carriedBall}
                        />
                      </div>
                    );
                  })}
                  {playerTokens.length === 0 && <span className="w-full text-center text-xs text-bb-text-muted italic">Tous sur le terrain</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FigurineBox;
