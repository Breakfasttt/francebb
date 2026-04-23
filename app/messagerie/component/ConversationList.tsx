"use client";

import React, { useEffect, useState } from "react";
import { getConversations } from "../actions";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default function ConversationList() {
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
                    
                    // Pour les 1v1, on affiche le nom de l'autre participant
                    // Pour les groupes, le nom du groupe ou la liste des membres
                    const displayName = conv.isGroup 
                        ? (conv.name || conv.participants.map((p: any) => p.user.name).join(", "))
                        : conv.participants.find((p: any) => p.user.id !== conv.participants[0].user.id)?.user.name // Approximation simple
                        || "Inconnu";

                    // En réalité, pour 1v1, on veut l'autre personne par rapport à NOUS.
                    // Mais ici on n'a pas forcément notre propre ID facilement sans repasser par session.
                    // On va simplifier : si c'est un 1v1, on prend le premier qui n'est pas nous (on le fera plus proprement si besoin).

                    return (
                        <Link 
                            key={conv.id} 
                            href={`/messagerie?id=${conv.id}`}
                            style={{ textDecoration: "none" }}
                        >
                            <PremiumCard className={`conversation-card ${unreadCount > 0 ? 'unread' : ''}`}>
                                <div className="conv-avatar-box">
                                    <img 
                                        src={conv.participants[0]?.user.image || "/images/default-avatar.png"} 
                                        alt="" 
                                        className="conv-avatar-img"
                                    />
                                    {unreadCount > 0 && (
                                        <span className="conv-unread-badge">{unreadCount}</span>
                                    )}
                                </div>
                                <div className="conv-info">
                                    <div className="conv-name-row">
                                        <span className="conv-name">{displayName}</span>
                                        <span className="conv-time">
                                            {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                    <div className="conv-last-msg">
                                        {lastMsg ? (
                                            <>
                                                <strong>{lastMsg.author.name}:</strong> {lastMsg.content}
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
