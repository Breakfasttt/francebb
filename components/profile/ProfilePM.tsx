"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";

export default function ProfilePM() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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
    />
  );
}
