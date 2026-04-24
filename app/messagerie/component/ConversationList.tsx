"use client";

import React, { useEffect, useState } from "react";
import { getConversations } from "../actions";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Search, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Tooltip from "@/common/components/Tooltip/Tooltip";

export default function ConversationList() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getConversations();
                setConversations(data.conversations);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return <div className="messagerie-list-view">Chargement...</div>;
    }

    return (
        <div className="messagerie-list-view">

            {conversations.length === 0 ? (
                <PremiumCard>
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p>Aucune conversation pour le moment.</p>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                            Commencez à discuter avec d'autres coachs !
                        </p>
                    </div>
                </PremiumCard>
            ) : (
                conversations.map((conv) => {
                    const lastMsg = conv.messages[0];
                    const unreadCount = conv._count?.messages || 0;
                    
                    // On filtre l'utilisateur actuel pour les noms/avatars
                    const otherParticipants = conv.participants.filter((p: any) => String(p.user.id) !== String(currentUserId));
                    const targetUser = otherParticipants.length > 0 ? otherParticipants[0].user : null;
                    const isOneOnOne = conv.participants.length === 2;

                    const displayName = !isOneOnOne
                        ? (conv.name || conv.participants.map((p: any) => p.user.name).slice(0, 3).join(", ") + (conv.participants.length > 3 ? "..." : ""))
                        : (targetUser?.name || "Inconnu");

                    return (
                        <Link 
                            key={conv.id} 
                            href={`/messagerie?id=${conv.id}`}
                            style={{ textDecoration: "none" }}
                        >
                            <PremiumCard className={`conversation-card ${unreadCount > 0 ? 'unread' : ''}`}>
                                <div className="conv-avatar-box">
                                    {!isOneOnOne ? (
                                        <div className="conv-avatar-group-placeholder">
                                            <Users size={24} />
                                        </div>
                                    ) : (
                                        <img 
                                            src={targetUser?.image || "/images/default-avatar.png"} 
                                            alt="" 
                                            className="conv-avatar-img"
                                        />
                                    )}
                                    {unreadCount > 0 && (
                                        <span className="conv-unread-badge">{unreadCount}</span>
                                    )}
                                </div>
                                <div className="conv-info">
                                    <div className="conv-name-row">
                                        <span className="conv-name">
                                            {displayName}
                                        </span>
                                        <span className="conv-time">
                                            {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                    
                                    {!isOneOnOne && (
                                        <div className="conv-participants-row">
                                            {conv.participants.map((p: any) => (
                                                <Tooltip key={p.user.id} content={p.user.name}>
                                                    <img 
                                                        src={p.user.image || "/images/default-avatar.png"} 
                                                        alt={p.user.name} 
                                                        className="mini-participant-avatar"
                                                        style={{ 
                                                            borderColor: p.user.id === currentUserId ? 'var(--primary)' : 'var(--glass-border)'
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </div>
                                    )}

                                    <div className="conv-last-msg">
                                        {lastMsg ? (
                                            <>
                                                <span className="last-msg-author">{lastMsg.authorId === currentUserId ? "Vous" : lastMsg.author.name}:</span>
                                                <span className="last-msg-content">{lastMsg.content}</span>
                                            </>
                                        ) : (
                                            <em>Aucun message</em>
                                        )}
                                    </div>
                                </div>
                            </PremiumCard>
                        </Link>
                    );
                })
            )}

        </div>
    );
}
