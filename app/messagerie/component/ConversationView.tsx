"use client";

import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { LogOut, Send, Loader2, ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getConversationMessages, leaveConversation, sendMessage } from "../actions";
import ChatBubble from "./ChatBubble";
import CTAButton from "@/common/components/Button/CTAButton";

interface ConversationViewProps {
    conversationId: string;
    onBack: () => void;
}

export default function ConversationView({ conversationId, onBack }: ConversationViewProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
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
            <div className="messagerie-chat-card input-block" style={{ height: 'auto', minHeight: 'min-content' }}>
                <div className="chat-input-area" style={{ padding: '1rem', height: 'auto', display: 'block' }}>
                    <BBCodeEditor 
                        name="message"
                        defaultValue={content}
                        onChange={setContent} 
                        placeholder="Écrivez votre message..."
                        maxLength={500}
                        rows={5}
                        style={{ height: 'auto' }}
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
                confirmText="Quitter"
                variant="danger"
            />
        </div>
    );
}
