"use client";

/**
 * « Fiche coach » de l'auteur d'un message (refonte, carte 086). Elle s'ouvre par un appui sur l'avatar ou le nom,
 * dans l'en-tête du message : un panneau qui monte du bas sur téléphone, une fenêtre centrée sur ordinateur.
 * Elle reprend ce qu'affichait la colonne de l'auteur avant la refonte : avatar avec son cadre de rang, rôle,
 * statistiques renseignées (numéro NAF avec lien vers le site de la NAF, équipe, région, ligues et ligue saisie à la
 * main), puis, pour un membre connecté, les boutons « Profil » et « MP » (pas de « MP » vers soi-même).
 */
import Link from "next/link";
import { Mail, MapPin, Shield, Trophy, User, Users } from "lucide-react";
import { Badge, Button, DESKTOP_QUERY, Sheet, SheetContent, useMediaQuery } from "@bbfrance/ui";
import UserAvatar, { type Rank } from "@/common/components/UserAvatar/UserAvatar";

export interface PostAuthor {
  id: string;
  name: string | null;
  image?: string | null;
  role?: string | null;
  isBanned?: boolean;
  avatarFrame?: string | null;
  nafNumber?: string | null;
  equipe?: string | null;
  region?: string | null;
  ligueCustom?: string | null;
  ligues?: { id: string; name: string; acronym?: string | null }[];
  _count?: { posts: number };
}

interface PostAuthorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: PostAuthor;
  roleLabel: string;
  rankLabel?: string;
  regionLabel?: string;
  isAuthorModerator: boolean;
  currentUserId?: string;
}

/** Une ligne de statistique : icône discrète, puis la valeur. */
function StatRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-h-11 items-center gap-3 border-b border-bb-border last:border-b-0">
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-bb-md bg-bb-surface-2 text-bb-text-muted">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col py-1.5">
        <span className="text-xs text-bb-text-muted">{label}</span>
        <span className="min-w-0 break-words text-[0.95rem] text-bb-text">{children}</span>
      </span>
    </li>
  );
}

export default function PostAuthorSheet({ open, onOpenChange, author, roleLabel, rankLabel, regionLabel, isAuthorModerator, currentUserId }: PostAuthorSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const hasLigues = (author.ligues?.length ?? 0) > 0 || !!author.ligueCustom;
  const hasStats = !!(author.nafNumber || author.equipe || author.region || hasLigues);
  const name = author.name || "Coach";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={`Fiche de ${name}`} side={isDesktop ? "center" : "bottom"}>
        <div className="flex items-center gap-3 pb-4">
          <UserAvatar
            image={author.image}
            name={author.name}
            postCount={author._count?.posts || 0}
            size={64}
            isBanned={author.isBanned}
            selectedRank={author.avatarFrame as Rank | null}
            isModerator={isAuthorModerator}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-lg font-bold break-words text-bb-text">{name}</span>
            <span className="flex flex-wrap items-center gap-1.5 text-sm text-bb-text-muted">
              {roleLabel}
              {rankLabel && <Badge variant="rank">{rankLabel}</Badge>}
              {author.isBanned && <Badge variant="danger">Banni</Badge>}
            </span>
          </div>
        </div>

        {hasStats ? (
          <ul className="m-0 list-none p-0">
            {author.nafNumber && (
              <StatRow icon={<Trophy size={16} />} label="Numéro NAF">
                <a
                  href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${author.nafNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-bb-accent-text underline-offset-2 hover:underline"
                >
                  {author.nafNumber}
                </a>
              </StatRow>
            )}
            {author.equipe && (
              <StatRow icon={<Users size={16} />} label="Équipe">
                {author.equipe}
              </StatRow>
            )}
            {author.region && (
              <StatRow icon={<MapPin size={16} />} label="Région">
                {regionLabel || author.region}
              </StatRow>
            )}
            {hasLigues && (
              <StatRow icon={<Shield size={16} />} label="Ligues">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {author.ligues?.map((ligue) => (
                    <Link
                      key={ligue.id}
                      href={`/ligue/${ligue.id}`}
                      title={ligue.name}
                      className="inline-flex min-h-11 items-center font-semibold text-bb-accent-text underline-offset-2 hover:underline lg:min-h-0"
                    >
                      {ligue.acronym || ligue.name}
                    </Link>
                  ))}
                  {author.ligueCustom && <span>{author.ligueCustom}</span>}
                </span>
              </StatRow>
            )}
          </ul>
        ) : (
          <p className="m-0 text-sm text-bb-text-muted">Ce coach n&apos;a pas renseigné de statistiques.</p>
        )}

        {currentUserId && (
          <div className="flex gap-2 pt-4 pb-2">
            <Button asChild variant="secondary" size="tap" className="flex-1">
              <Link href={`/spy/${author.id}`}>
                <User size={18} aria-hidden="true" /> Profil
              </Link>
            </Button>
            {author.id !== currentUserId && (
              <Button asChild variant="primary" size="tap" className="flex-1">
                <Link href={`/messagerie?userId=${author.id}`}>
                  <Mail size={18} aria-hidden="true" /> MP
                </Link>
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
