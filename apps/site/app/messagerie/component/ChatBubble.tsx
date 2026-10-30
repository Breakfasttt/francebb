"use client";

import React from "react";
import { parseBBCode } from "@/lib/bbcode";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";

interface ChatBubbleProps {
    message: any;
    isSelf: boolean;
}

export default function ChatBubble({ message, isSelf }: ChatBubbleProps) {
    return (
        <div className={`message-row ${isSelf ? 'is-self' : ''}`}>
            {!isSelf && (
                <MemberAvatarImage
                    image={message.author.image}
                    alt={message.author.name}
                    className="msg-avatar"
                />
            )}
            <div className="message-bubble">
                {!isSelf && (
                    <div className="msg-author-name">{message.author.name}</div>
                )}
                <div 
                    className="msg-content"
                    dangerouslySetInnerHTML={{ __html: parseBBCode(message.content) }}
                />
                <span className="msg-time">
                    {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
                </span>
            </div>
        </div>
    );
}
