"use client";

/**
 * Carte d'identité d'un membre (refonte, carte 092, ADR 0006), affichée sur son propre profil `/profile` et sur le
 * profil vu par un autre membre `/spy/[id]`. Colonne de gauche sur ordinateur, en haut de la page sur téléphone.
 * - Avatar avec le cadre de son rang, pseudo, rôle (libellé lisible, rôles personnalisés compris), badge « Banni ».
 * - Numéro NAF (lien vers sa fiche sur le site de la NAF) et nombre de messages, puis région, équipe et ligues.
 *   Sans numéro, la case affiche « Non renseigné » ; sur son propre profil, le membre lit en plus à quoi sert ce
 *   numéro et un lien l'emmène au formulaire pour l'ajouter (carte 190).
 * - Sur le profil d'un autre membre : « Message privé », « Signaler », « Bloquer » ou « Débloquer » (pas sur un
 *   modérateur) et, pour un modérateur, « Bannir » ou « Débannir ». Chaque action demande une confirmation.
 * Les onglets ne sont plus ici : chaque page les affiche au-dessus de son contenu (composant LinkTabs).
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Ban, MapPin, MessageSquare, Shield, Trophy, UserCheck, UserX } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, toast } from "@bbfrance/ui";
import { toggleBlockUser } from "@/app/profile/actions";
import { toggleBanUser } from "@/app/membres/actions";
import UserAvatar, { type Rank } from "@/common/components/UserAvatar/UserAvatar";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import BanUserDialog from "@/common/components/BanUserDialog/BanUserDialog";
import { getRoleLabel, isModerator as checkIsModerator } from "@/lib/roles";

const REGION_LABELS: Record<string, string> = {
  "IDF": "R1 - Île-de-France",
  "Nord-Ouest": "R2 - Nord-Ouest",
  "Nord-Est": "R3 - Nord-Est",
  "Sud-Est": "R4 - Sud-Est",
  "Sud-Ouest": "R5 - Sud-Ouest",
};

export interface ProfileUser {
  id: string;
  name: string;
  image?: string | null;
  role?: string | null;
  isBanned?: boolean;
  avatarFrame?: string | null;
  nafNumber?: string | null;
  region?: string | null;
  equipe?: string | null;
  ligueCustom?: string | null;
  ligues?: { id: string; name: string; acronym?: string | null }[];
}

interface ProfileSidebarProps {
  user: ProfileUser;
  postCount: number;
  isOwnProfile: boolean;
  /** Le visiteur est modérateur : il peut bannir ou débannir. */
  isModerator?: boolean;
  /** Libellés des rôles lus dans la table RoleConfig (action getRoleLabels). */
  roleLabels?: Record<string, string>;
  isBlockedInitial?: boolean;
  onRefresh?: () => void;
}

export default function ProfileSidebar({
  user,
  postCount,
  isOwnProfile,
  isModerator = false,
  roleLabels,
  isBlockedInitial = false,
  onRefresh,
}: ProfileSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  // État de blocage choisi ici ; tant que le membre n'a rien changé, on suit celui fourni par la page
  const [blockedChoice, setIsBlocked] = useState<boolean | null>(null);
  const isBlocked = blockedChoice ?? isBlockedInitial;

  const targetIsModerator = checkIsModerator(user.role);
  const customLigues = (user.ligueCustom ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const hasLigues = (user.ligues?.length ?? 0) > 0 || customLigues.length > 0;

  const handleToggleBan = (reason: string) => {
    if (!user.isBanned && !reason.trim()) {
      toast.error("Une raison est obligatoire pour bannir un utilisateur.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await toggleBanUser(user.id, !user.isBanned, reason);
        if (res.success) {
          toast.success(!user.isBanned ? "Utilisateur banni" : "Utilisateur débanni");
          setShowBanModal(false);
          router.refresh();
          onRefresh?.();
        } else {
          toast.error(res.error || "Erreur de bannissement");
        }
      } catch {
        toast.error("Erreur de bannissement");
      }
    });
  };

  const handleToggleBlock = () => {
    startTransition(async () => {
      try {
        const res = await toggleBlockUser(user.id);
        setShowBlockModal(false);
        if (!res.success) {
          toast.error(res.error || "Erreur de blocage");
          return;
        }
        setIsBlocked(!!res.isBlocked);
        router.refresh();
        onRefresh?.();
      } catch {
        toast.error("Erreur de blocage");
        setShowBlockModal(false);
      }
    });
  };

  const detailRow = "flex items-start gap-2.5 text-[0.95rem]";
  const detailIcon = "mt-0.5 shrink-0 text-bb-text-muted";

  return (
    <aside aria-label={isOwnProfile ? "Ma carte de profil" : `Carte de profil de ${user.name}`}>
      <Card className="flex flex-col gap-4 p-4 lg:p-5">
        {/* Identité : avatar à gauche sur téléphone, au-dessus sur ordinateur */}
        <div className="flex items-center gap-4 lg:flex-col lg:text-center">
          <div className="shrink-0">
            <UserAvatar
              image={user.image}
              name={user.name}
              postCount={postCount}
              size={96}
              isBanned={user.isBanned}
              selectedRank={user.avatarFrame as Rank}
              isModerator={targetIsModerator}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 lg:items-center">
            <h2 className="m-0 border-0 p-0 text-xl leading-tight font-bold tracking-normal break-words text-bb-text normal-case not-italic">
              {user.name}
            </h2>
            <div className="flex flex-wrap gap-1.5 lg:justify-center">
              <Badge variant={targetIsModerator ? "outline" : "neutral"}>{getRoleLabel(user.role || "COACH", roleLabels)}</Badge>
              {user.isBanned && (
                <Badge variant="danger"><Ban size={12} aria-hidden="true" /> Banni</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions sur un autre membre, juste sous son nom */}
        {!isOwnProfile && (
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="primary" size="tap" className="col-span-2">
              <Link href={`/messagerie?userId=${user.id}`}>
                <MessageSquare size={18} aria-hidden="true" /> Message privé
              </Link>
            </Button>
            <Button type="button" variant="secondary" size="tap" onClick={() => setShowReportModal(true)}>
              <AlertTriangle size={18} aria-hidden="true" /> Signaler
            </Button>
            {!targetIsModerator && (
              <Button type="button" variant="secondary" size="tap" disabled={isPending} onClick={() => setShowBlockModal(true)}>
                {isBlocked ? <UserCheck size={18} aria-hidden="true" /> : <UserX size={18} aria-hidden="true" />}
                {isBlocked ? "Débloquer" : "Bloquer"}
              </Button>
            )}
            {isModerator && !targetIsModerator && (
              <Button
                type="button"
                variant={user.isBanned ? "secondary" : "danger"}
                size="tap"
                className="col-span-2"
                disabled={isPending}
                onClick={() => setShowBanModal(true)}
              >
                {user.isBanned ? <UserCheck size={18} aria-hidden="true" /> : <Ban size={18} aria-hidden="true" />}
                {user.isBanned ? "Débannir" : "Bannir"}
              </Button>
            )}
          </div>
        )}
        {/* NAF et nombre de messages */}
        <dl className="m-0 grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center gap-0.5 rounded-bb-md bg-bb-surface-2 px-2 py-2.5">
            <dt className="text-xs font-semibold tracking-wide text-bb-text-muted uppercase">NAF</dt>
            <dd className="m-0 text-base font-bold text-bb-text">
              {user.nafNumber ? (
                <a
                  href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${user.nafNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bb-accent-text underline-offset-2 hover:underline"
                >
                  {user.nafNumber}
                </a>
              ) : (
                <span className="text-sm font-normal text-bb-text-muted">Non renseigné</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-bb-md bg-bb-surface-2 px-2 py-2.5">
            <dt className="text-xs font-semibold tracking-wide text-bb-text-muted uppercase">Messages</dt>
            <dd className="m-0 text-base font-bold text-bb-text">{postCount}</dd>
          </div>
        </dl>
        {isOwnProfile && !user.nafNumber && (
          <p className="m-0 text-sm text-bb-text-muted">
            Le numéro NAF est celui de l&apos;association internationale des joueurs de tournoi.{" "}
            <Link href="/profile?tab=edit" className="inline-flex min-h-11 items-center font-semibold text-bb-accent-text underline underline-offset-2">
              Ajouter mon numéro
            </Link>
          </p>
        )}

        {/* Région, équipe, ligues */}
        {(user.region || user.equipe || hasLigues) && (
          <dl className="m-0 flex flex-col gap-2.5">
            {user.region && (
              <div className={detailRow}>
                <MapPin size={16} className={detailIcon} aria-hidden="true" />
                <dt className="sr-only">Région</dt>
                <dd className="m-0 min-w-0 text-bb-text">{REGION_LABELS[user.region] || user.region}</dd>
              </div>
            )}
            {user.equipe && (
              <div className={detailRow}>
                <Trophy size={16} className={detailIcon} aria-hidden="true" />
                <dt className="sr-only">Équipe</dt>
                <dd className="m-0 min-w-0 break-words text-bb-text">{user.equipe}</dd>
              </div>
            )}
            {hasLigues && (
              <div className={detailRow}>
                <Shield size={16} className={detailIcon} aria-hidden="true" />
                <dt className="sr-only">Ligues</dt>
                <dd className="m-0 flex min-w-0 flex-wrap gap-1.5">
                  {user.ligues?.map((ligue) => (
                    <Link
                      key={ligue.id}
                      href={`/ligue/${ligue.id}`}
                      title={ligue.name}
                      className="inline-flex min-h-8 items-center rounded-bb-sm border border-bb-accent-text px-2 text-sm font-bold text-bb-accent-text no-underline hover:bg-bb-accent-soft"
                    >
                      {ligue.acronym || ligue.name}
                    </Link>
                  ))}
                  {customLigues.map((custom) => (
                    <span key={custom} className="inline-flex min-h-8 items-center rounded-bb-sm border border-bb-border px-2 text-sm text-bb-text-muted italic">
                      {custom}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}

      </Card>

      {!isOwnProfile && (
        <>
          <BanUserDialog
            open={showBanModal}
            onOpenChange={setShowBanModal}
            userName={user.name}
            isBanned={!!user.isBanned}
            pending={isPending}
            onConfirm={handleToggleBan}
          />

          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            targetId={user.id}
            targetType="USER"
            itemTitle={user.name}
          />

          <ConfirmDialog
            open={showBlockModal}
            onOpenChange={setShowBlockModal}
            title={isBlocked ? `Débloquer ${user.name}` : `Bloquer ${user.name}`}
            message={isBlocked
              ? `Ses messages seront de nouveau visibles et ${user.name} pourra de nouveau vous contacter.`
              : `Ses messages seront masqués et ${user.name} ne pourra plus vous contacter.`}
            confirmLabel={isBlocked ? "Débloquer" : "Bloquer"}
            pending={isPending}
            onConfirm={handleToggleBlock}
          />
        </>
      )}
    </aside>
  );
}
