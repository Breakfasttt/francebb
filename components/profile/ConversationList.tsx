"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MessageSquare, AlertCircle, Inbox, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { getConversations, startConversation, searchUsersForPm } from "@/app/profile/pmActions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [page]);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await getConversations(page);
      setConversations(data.conversations);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleSearch() {
    setSearching(true);
    try {
      const results = await searchUsersForPm(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function handleStartConversation(userId: string) {
    try {
      const result = await startConversation(userId);
      if (result.success) {
        setSearchQuery("");
        setSearchResults([]);
        onSelectConversation(result.conversationId);
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible de démarrer la conversation");
    }
  }

  return (
    <div className="conversation-list-container fade-in">
      <div className="pm-search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher un coach pour discuter..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {searchResults.length > 0 && (
          <div className="search-results premium-card">
            {searchResults.map(user => (
              <div key={user.id} className="search-result-item">
                <div className="user-info">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="user-avatar-sm" />
                  ) : (
                    <div className="user-avatar-sm-placeholder">{user.name?.[0]}</div>
                  )}
                  <span>{user.name}</span>
                  {user.isFull && (
                    <span className="mailbox-full-badge" title="Boîte de réception pleine (200/200)">
                      <Inbox size={14} /> Full
                    </span>
                  )}
                </div>
                <button 
                  disabled={user.isFull}
                  onClick={() => handleStartConversation(user.id)}
                  className="start-btn"
                >
                  <Plus size={14} /> {user.isFull ? "Pleine" : "Discuter"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="conversations-wrapper">
        <h3 className="section-title">Mes Conversations</h3>
        
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state premium-card">
            <MessageSquare size={48} />
            <p>Aucune conversation en cours.</p>
            <p className="sub-text">Recherchez un profil ci-dessus pour commencer à discuter.</p>
          </div>
        ) : (
          <div className="conversation-grid">
            {conversations.map(conv => {
              const otherUser = conv.user1Id === session?.user?.id ? conv.user2 : conv.user1;
              const lastMessage = conv.messages[0];
              const unreadCount = conv._count.messages;

              return (
                <div 
                  key={conv.id} 
                  className={`conversation-card premium-card ${unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="conv-user-img">
                    {otherUser.image ? (
                      <img src={otherUser.image} alt={otherUser.name} />
                    ) : (
                      <div className="avatar-placeholder">{otherUser.name?.[0]}</div>
                    )}
                    {unreadCount > 0 && <div className="unread-dot"><Bell size={10} fill="currentColor" /></div>}
                  </div>
                  
                  <div className="conv-content">
                    <div className="conv-header">
                      <span className="user-name">{otherUser.name}</span>
                      <span className="last-time">
                        {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="last-message">
                      {lastMessage ? (
                         lastMessage.authorId === session?.user?.id ? `Vous : ${lastMessage.content}` : lastMessage.content
                      ) : (
                        <span className="no-msgs">Aucun message</span>
                      )}
                    </p>
                  </div>
                  
                  <ChevronRight size={18} className="arrow-icon" />
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} /> Précédent
            </button>
            <span>Page {page} sur {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .conversation-list-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .pm-search-bar {
          position: relative;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: #666;
        }
        .search-input-wrapper input {
          width: 100%;
          padding: 1.2rem 1.25rem 1.2rem 3.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .search-input-wrapper input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(194, 29, 29, 0.1);
        }
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          z-index: 100;
          padding: 0.5rem;
          max-height: 350px;
          overflow-y: auto;
          background: #15151a; /* Solid dark background */
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 15px 40px rgba(0,0,0,0.8);
        }
        .search-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .search-result-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .user-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-avatar-sm-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .mailbox-full-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(194, 29, 29, 0.15);
          color: var(--primary);
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .start-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          background: var(--primary);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .start-btn:hover:not(:disabled) {
          filter: brightness(1.2);
          transform: translateY(-2px);
        }
        .start-btn:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }
        .conversation-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .conversation-card {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          gap: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .conversation-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--primary);
          transform: translateX(5px);
        }
        .conversation-card.has-unread {
          border-left: 4px solid var(--primary);
        }
        .conv-user-img {
          position: relative;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
        }
        .conv-user-img img, .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          object-fit: cover;
        }
        .avatar-placeholder {
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #666;
        }
        .unread-dot {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1a1a20;
          box-shadow: 0 0 10px rgba(194, 29, 29, 0.5);
        }
        .conv-content {
          flex: 1;
          min-width: 0;
        }
        .conv-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.4rem;
        }
        .user-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
        }
        .last-time {
          font-size: 0.75rem;
          color: #666;
        }
        .last-message {
          margin: 0;
          font-size: 0.9rem;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .no-msgs {
          font-style: italic;
          color: #444;
        }
        .arrow-icon {
          color: #444;
          transition: transform 0.2s;
        }
        .conversation-card:hover .arrow-icon {
          color: var(--primary);
          transform: translateX(3px);
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .pagination button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .pagination button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #888;
        }
        .pagination button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .section-title {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #444;
        }
        .empty-state p {
          margin: 0;
          font-weight: 600;
          color: #666;
        }
        .sub-text {
          font-size: 0.85rem;
          font-weight: 400 !important;
        }
      `}</style>
    </div>
  );
}
