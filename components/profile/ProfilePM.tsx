"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";

export default function ProfilePM() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("recipientId");

  if (activeConversationId) {
    return (
      <ConversationView 
        conversationId={activeConversationId} 
        onBack={() => setActiveConversationId(null)} 
      />
    );
  }

  return (
    <ConversationList 
      onSelectConversation={(id: string) => setActiveConversationId(id)} 
      initialRecipientId={recipientId}
    />
  );
}
