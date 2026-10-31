/**
 * Petits textes communs à la liste et à la conversation (carte 093) : le nom affiché d'une conversation et l'aperçu
 * du dernier message.
 */

interface TitledConversation {
  name: string | null;
  isGroup: boolean;
  participants: { user: { id: string; name: string | null } }[];
}

/**
 * Nom affiché d'une conversation : le titre donné au groupe ; sinon, pour une conversation à deux, le nom de l'autre
 * membre ; sinon les noms des trois premiers participants.
 */
export function conversationTitle(conv: TitledConversation, currentUserId?: string): string {
  if (conv.name) return conv.name;
  const others = conv.participants.filter((p) => String(p.user.id) !== String(currentUserId));
  if (!conv.isGroup && others.length === 1) return others[0].user.name || "Inconnu";
  const names = conv.participants.map((p) => p.user.name || "Inconnu");
  return names.slice(0, 3).join(", ") + (names.length > 3 ? "…" : "") || "Conversation";
}

/** Aperçu d'un message sur une ligne : les balises BBCode (`[b]`, `[url=…]`…) sont retirées. */
export function plainPreview(content: string): string {
  return content.replace(/\[\/?[a-z*]+(=[^\]]*)?\]/gi, "").replace(/\s+/g, " ").trim();
}
