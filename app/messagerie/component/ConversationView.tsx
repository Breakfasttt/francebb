"use client";

import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { LogOut, Send, Loader2, ChevronLeft, UserPlus, Edit3 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getConversationMessages, leaveConversation, sendMessage, renameConversation } from "../actions";
import ChatBubble from "./ChatBubble";
import CTAButton from "@/common/components/Button/CTAButton";
import InviteParticipantModal from "./InviteParticipantModal";
import RenameConversationModal from "./RenameConversationModal";

interface ConversationViewProps {
    conversationId: string;
    onBack: () => void;
    onUpdate?: () => void;
}

export default function ConversationView({ conversationId, onBack, onUpdate }: ConversationViewProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        // Optionnel: polling toutes les 10s pour rafraîchir
        const interval = setInterval(loadMessages, 10000);
        return () => clearInterval(interval);
    }, [conversationId]);

    async function loadMessages() {
        try {
            const data = await getConversationMessages(conversationId);
            setMessages(data.messages);
            setConversation(data.conversation);
        } catch (error: any) {
            toast.error(error.message);
            onBack();
        } finally {
            setLoading(false);
        }
    }

    const handleSend = async () => {
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            const res = await sendMessage(conversationId, content);
            if (res.success) {
                setContent("");
                loadMessages();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSending(false);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveConversation(conversationId);
            toast.success("Vous avez quitté la conversation");
            onBack();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading && messages.length === 0) return <div className="messagerie-chat-view">Chargement...</div>;

    const convTitle = conversation?.name || (conversation?.isGroup ? "Groupe" : conversation?.participants.find((p: any) => p.user.id !== session?.user?.id)?.user.name || "Chat");

    return (
        <div className="conversation-view-layout">
            {/* BLOC 1: DISCUSSION (Resizable & Scrollable) */}
            <div className="messagerie-chat-card conversation-block">
                {/* Bandeau Participants */}
                {conversation?.participants && (
                    <div className="participants-banner" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Tooltip content="Ajouter un participant" position="bottom">
                                <button
                                    className="nav-icon-capsule sm"
                                    onClick={() => setIsInviteModalOpen(true)}
                                    style={{ width: '32px', height: '32px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)' }}
                                >
                                    <UserPlus size={16} />
                                </button>
                            </Tooltip>
                            <div className="participants-list">
                                {conversation.participants.map((p: any) => (
                                    <Tooltip key={p.user.id} content={p.user.name} position="bottom">
                                        <Link href={`/profile/${p.user.id}`}>
                                            <img
                                                src={p.user.image || "/images/default-avatar.png"}
                                                alt={p.user.name}
                                                className="participant-avatar"
                                            />
                                        </Link>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {conversation.isGroup && (
                                <Tooltip content="Renommer le groupe" position="bottom">
                                    <button
                                        className="nav-icon-capsule sm"
                                        onClick={() => setIsRenameModalOpen(true)}
                                        style={{ width: '32px', height: '32px', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.1)' }}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </Tooltip>
                            )}

                            <Tooltip content="Quitter la conversation" position="bottom">
                                <button
                                    className="nav-icon-capsule danger sm"
                                    onClick={() => setIsLeaveModalOpen(true)}
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    <LogOut size={16} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                )}

                {/* Zone des messages Redimensionnable */}
                <div className="chat-messages-resizable-wrapper">
                    <div className="chat-messages">
                        <div ref={messagesEndRef} />
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                message={msg}
                                isSelf={msg.authorId === session?.user?.id}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* BLOC 2: EDITION */}
            <div className="messagerie-chat-card input-block">
                <div className="chat-input-area">
                    <BBCodeEditor 
                        name="message"
                        defaultValue={content}
                        onChange={setContent} 
                        placeholder="Écrivez votre message..."
                        maxLength={500}
                        rows={5}
                    />
                    <div style={{ marginTop: '1.2rem' }}>
                        <CTAButton 
                            onClick={handleSend}
                            isLoading={sending}
                            disabled={!content.trim()}
                            icon={<Send size={18} />}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Envoyer le message
                        </CTAButton>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleLeave}
                title="Quitter la conversation ?"
                message="Si vous quittez cette conversation, elle sera supprimée de votre liste. Si c'est un groupe et qu'il ne reste plus personne, elle sera définitivement supprimée."
                confirmLabel="Quitter"
                isDanger={true}
            />

            {isInviteModalOpen && (
                <InviteParticipantModal 
                    conversationId={conversationId}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={loadMessages}
                    existingUserIds={conversation.participants.map((p: any) => p.user.id)}
                />
            )}

            {isRenameModalOpen && (
                <RenameConversationModal
                    conversationId={conversationId}
                    currentName={conversation.name}
                    onClose={() => setIsRenameModalOpen(false)}
                    onSuccess={() => {
                        loadMessages();
                        if (onUpdate) onUpdate();
                    }}
                />
            )}
        </div>
    );
}
