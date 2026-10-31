"use client";

/**
 * Une conversation (refonte, carte 093) : en-tête, fil des 30 derniers messages et zone de saisie.
 *
 * - Sur ordinateur, elle remplit la colonne de droite de la messagerie.
 * - Sur téléphone, elle couvre tout l'écran, comme une application de messagerie : en-tête avec le bouton retour à
 *   la liste, messages au milieu, zone de saisie collée en bas. L'attribut data-fullscreen retire la barre de
 *   navigation du bas pendant ce temps (AppShell.css) : elle ne peut donc plus réapparaître sous le doigt juste après
 *   une saisie. La conversation n'a pas sa propre adresse (paramètre `?id=`), d'où ce repère posé par l'écran
 *   lui-même plutôt qu'une règle sur l'adresse comme pour les écrans de rédaction du forum (`isComposePath`).
 * - Le cadre suit la partie visible de l'écran (`visualViewport`, voir useVisibleViewport) : quand le clavier du
 *   téléphone s'ouvre, la zone de saisie remonte juste au-dessus de lui.
 *
 * Les messages arrivent du plus récent au plus ancien ; le fil est affiché en `flex-col-reverse` : le plus récent
 * est en bas, et le navigateur garde le fil calé en bas sans calcul de défilement. Il se rafraîchit toutes les
 * 10 secondes, et chaque chargement marque les messages comme lus (action getConversationMessages).
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, LogOut, Pencil, Send, UserPlus, Users } from "lucide-react";
import { ActionMenu, Avatar, Button, ConfirmDialog, DESKTOP_QUERY, EmptyState, Sheet, SheetContent, Skeleton, toast, useMediaQuery } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { getConversationMessages, leaveConversation, sendMessage } from "../actions";
import ChatBubble from "./ChatBubble";
import InviteParticipantModal from "./InviteParticipantModal";
import RenameConversationModal from "./RenameConversationModal";
import { conversationTitle } from "./conversationText";

type ConversationData = NonNullable<Awaited<ReturnType<typeof getConversationMessages>>>;

const REFRESH_DELAY = 10_000;
const MAX_LENGTH = 500;

interface ConversationViewProps {
  conversationId: string;
  /** Retour à la liste (après un départ, ou si la conversation n'est pas accessible). */
  onClose: () => void;
  /** Signale un changement visible dans la liste (message envoyé, groupe renommé, participants ajoutés, lus). */
  onChange?: () => void;
}

/**
 * Sur téléphone, recopie la position et la hauteur de la partie visible de l'écran (qui rétrécit quand le clavier
 * s'ouvre) dans les variables --chat-top et --chat-height du cadre. Sans `visualViewport`, le cadre garde toute la
 * hauteur de l'écran (100dvh).
 */
function useVisibleViewport(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const viewport = window.visualViewport;
    const element = ref.current;
    if (!viewport || !element) return;
    const update = () => {
      element.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
      element.style.setProperty("--chat-height", `${viewport.height}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [ref]);
}

export default function ConversationView({ conversationId, onClose, onChange }: ConversationViewProps) {
  const { data: session } = useSession();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const myId = session?.user?.id;
  const frameRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ConversationData | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  useVisibleViewport(frameRef);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const loadMessages = useCallback(async () => {
    try {
      const result = await getConversationMessages(conversationId);
      if (!result) {
        toast.error("Accès refusé");
        onCloseRef.current();
        return;
      }
      setData(result);
    } catch {
      toast.error("Impossible de charger la conversation");
      onCloseRef.current();
    }
  }, [conversationId]);

  // Premier chargement (les non-lus disparaissent alors de la liste), puis rafraîchissement toutes les 10 secondes
  useEffect(() => {
    loadMessages().then(() => onChange?.());
    const interval = setInterval(loadMessages, REFRESH_DELAY);
    return () => clearInterval(interval);
    // onChange n'est appelé qu'à l'ouverture : inutile de relancer le rafraîchissement s'il change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessages]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(conversationId, content);
      if (res.success) {
        setContent("");
        await loadMessages();
        onChange?.();
      } else {
        toast.error(res.error || "Erreur lors de l'envoi du message");
      }
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await leaveConversation(conversationId);
      if (!res.success) {
        toast.error(res.error || "Impossible de quitter la conversation");
        return;
      }
      toast.success("Vous avez quitté la conversation");
      setLeaveOpen(false);
      onChange?.();
      onClose();
    } catch {
      toast.error("Impossible de quitter la conversation");
    } finally {
      setLeaving(false);
    }
  };

  const conversation = data?.conversation;
  const messages = data?.messages ?? [];
  const isGroup = !!conversation?.isGroup;
  const title = conversation ? conversationTitle(conversation, myId) : "Chargement…";
  const participants = conversation?.participants ?? [];
  const others = participants.filter((p) => p.user.id !== myId);

  return (
    <div
      ref={frameRef}
      data-fullscreen=""
      className="flex flex-col bg-bb-surface max-lg:fixed max-lg:inset-x-0 max-lg:top-[var(--chat-top,0px)] max-lg:z-[5001] max-lg:h-[var(--chat-height,100dvh)] lg:h-full lg:min-h-0"
    >
      {/* En-tête : retour (téléphone), avatar, titre, participants et menu « ⋯ » */}
      <header className="flex shrink-0 items-center gap-2 border-b border-bb-border bg-bb-surface px-2 py-2 lg:px-4">
        <Button asChild variant="quiet" size="tap-icon" className="lg:hidden">
          <Link href="/messagerie" aria-label="Retour à la liste">
            <ArrowLeft size={22} aria-hidden="true" />
          </Link>
        </Button>
        {conversation &&
          (isGroup || others.length !== 1 ? (
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-bb-border bg-bb-surface-2 text-bb-text-muted">
              <Users size={20} />
            </span>
          ) : (
            <Avatar name={others[0].user.name} src={others[0].user.image} size={40} />
          ))}
        <div className="min-w-0 flex-1">
          <h2 className="m-0 truncate border-0 p-0 text-lg leading-tight font-bold tracking-normal text-bb-text normal-case not-italic">{title}</h2>
          {conversation && (
            <p className="m-0 truncate text-sm text-bb-text-muted">{isGroup ? `Groupe · ${participants.length} participants` : "Discussion privée"}</p>
          )}
        </div>
        {conversation && (
          <>
            <Button type="button" variant="quiet" size="tap" aria-label={`Participants (${participants.length})`} onClick={() => setParticipantsOpen(true)} className="shrink-0 gap-1.5 px-2.5">
              <Users size={20} aria-hidden="true" />
              <span className="text-sm font-semibold">{participants.length}</span>
            </Button>
            <ActionMenu
              label="Actions de la conversation"
              linkComponent={Link}
              items={[
                { label: "Ajouter des participants", icon: <UserPlus size={18} aria-hidden="true" />, onSelect: () => setInviteOpen(true), hidden: !isGroup },
                { label: "Renommer le groupe", icon: <Pencil size={18} aria-hidden="true" />, onSelect: () => setRenameOpen(true), hidden: !isGroup },
                { label: "Quitter la conversation", icon: <LogOut size={18} aria-hidden="true" />, onSelect: () => setLeaveOpen(true), danger: true },
              ]}
            />
          </>
        )}
      </header>

      {/* Fil des messages : le plus récent en bas */}
      <div className="flex min-h-0 flex-1 flex-col-reverse gap-1.5 overflow-y-auto overscroll-contain bg-bb-bg px-3 py-3 lg:px-5" aria-label="Messages" role="log">
        {!data ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-12 w-1/2" />
            <Skeleton className="h-12 w-3/5" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState title="Aucun message pour l'instant">Écrivez le premier message ci-dessous.</EmptyState>
        ) : (
          messages.map((msg, index) => {
            // La liste va du plus récent au plus ancien : index + 1 est le message d'avant, index - 1 celui d'après
            const older = messages[index + 1];
            const newer = messages[index - 1];
            return (
              <ChatBubble
                key={msg.id}
                message={msg}
                isSelf={msg.authorId === myId}
                showName={isGroup && older?.authorId !== msg.authorId}
                showAvatar={newer?.authorId !== msg.authorId}
              />
            );
          })
        )}
      </div>

      {/* Zone de saisie, collée en bas ; data-page-bottom-bar fait monter les notifications au-dessus d'elle */}
      <div
        data-page-bottom-bar="always"
        className="shrink-0 border-t border-bb-border bg-bb-surface px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:px-4 lg:pb-3 [&_textarea]:min-h-20 max-lg:[&_textarea]:max-h-32 max-lg:[&_textarea]:min-h-16"
      >
        <BBCodeEditor
          name="message"
          defaultValue={content}
          onChange={setContent}
          placeholder="Écrivez votre message..."
          maxLength={MAX_LENGTH}
          rows={2}
        />
        <div className="mt-2 flex justify-end">
          <Button type="button" variant="primary" size="tap" onClick={handleSend} disabled={!content.trim() || sending} className="gap-1.5 max-lg:w-full">
            <Send size={18} aria-hidden="true" />
            {sending ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      </div>

      {/* Participants : nom et lien vers le profil de chacun ; dans un groupe, accès à l'ajout */}
      <Sheet open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <SheetContent title={`Participants (${participants.length})`} side={isDesktop ? "center" : "bottom"}>
          <ul className="m-0 list-none p-0 pb-2">
            {participants.map((p) => (
              <li key={p.user.id} className="border-b border-bb-border last:border-b-0">
                <Link href={`/spy/${p.user.id}`} className="flex min-h-14 items-center gap-3 px-1 text-bb-text no-underline hover:text-bb-accent-text">
                  <Avatar name={p.user.name} src={p.user.image} size={36} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.user.name}</span>
                  {p.user.id === myId && <span className="text-sm text-bb-text-muted">(vous)</span>}
                </Link>
              </li>
            ))}
          </ul>
          {isGroup && (
            <Button
              type="button"
              variant="secondary"
              size="tap"
              className="mb-2 w-full gap-1.5"
              onClick={() => {
                setParticipantsOpen(false);
                setInviteOpen(true);
              }}
            >
              <UserPlus size={18} aria-hidden="true" />
              Ajouter des participants
            </Button>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Quitter la conversation ?"
        message="Si vous quittez cette conversation, elle sera supprimée de votre liste. S'il ne reste alors qu'un seul participant, elle sera définitivement supprimée, avec tous ses messages."
        confirmLabel="Quitter"
        danger
        pending={leaving}
        onConfirm={handleLeave}
      />

      {inviteOpen && conversation && (
        <InviteParticipantModal
          conversationId={conversationId}
          onClose={() => setInviteOpen(false)}
          onSuccess={() => {
            loadMessages();
            onChange?.();
          }}
          existingUserIds={participants.map((p) => p.user.id)}
        />
      )}

      {renameOpen && conversation && (
        <RenameConversationModal
          conversationId={conversationId}
          currentName={conversation.name}
          onClose={() => setRenameOpen(false)}
          onSuccess={() => {
            loadMessages();
            onChange?.();
          }}
        />
      )}
    </div>
  );
}
