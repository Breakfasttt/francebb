"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConversationList from "./component/ConversationList";
import ConversationView from "./component/ConversationView";
import { startConversation, getConversationMessages } from "./actions";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Plus, LogOut } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import NewConversationModal from "./component/NewConversationModal";
import { useSession } from "next-auth/react";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import "./page.css";

function MessagerieContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const [initializing, setInitializing] = React.useState(!!userId);
    const [showModal, setShowModal] = React.useState(false);

    React.useEffect(() => {
        if (userId) {
            const start = async () => {
                try {
                    const res = await startConversation([userId]);
                    if (res.success) {
                        router.replace(`/messagerie?id=${res.conversationId}`);
                    }
                } catch (error: any) {
                    console.error(error);
                    router.replace("/messagerie");
                } finally {
                    setInitializing(false);
                }
            };
            start();
        }
    }, [userId]);

    const [convInfo, setConvInfo] = React.useState<any>(null);

    const fetchInfo = async () => {
        if (!activeId) return;
        try {
            const data = await getConversationMessages(activeId);
            setConvInfo(data.conversation);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        if (activeId) {
            fetchInfo();
        } else {
            setConvInfo(null);
        }
    }, [activeId]);

    const handleUpdate = () => {
        fetchInfo();
        router.refresh();
    };

    const handleBack = () => {
        router.push("/messagerie");
    };

    if (initializing) return <div className="messagerie-container">Initialisation...</div>;

    const convTitle = convInfo?.name || (convInfo?.isGroup ? "Groupe" : convInfo?.participants.find((p: any) => p.user.id !== session?.user?.id)?.user.name || "Chat");

    return (
        <>
            <PageHeader 
                title={activeId ? (convTitle || "Chargement...") : "Messagerie"}
                subtitle={activeId 
                    ? (convInfo?.isGroup ? "Conversation de groupe" : "Discussion privée")
                    : "Discutez avec les autres coachs de la communauté"
                }
                backHref={activeId ? "/messagerie" : "/"}
                backTitle={activeId ? "Retour à la liste" : "Retour"}
            />
            
            <div className={`messagerie-container ${activeId ? 'has-active-chat' : ''}`}>
                {!activeId && (
                     <div style={{ padding: '0 1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <CTAButton 
                            icon={<Plus size={18} />}
                            onClick={() => setShowModal(true)}
                        >
                            Nouvelle conversation
                        </CTAButton>
                    </div>
                )}
                
                {activeId ? (
                    <ConversationView conversationId={activeId} onBack={handleBack} onUpdate={handleUpdate} />
                ) : (
                    <ConversationList />
                )}
            </div>

            {showModal && (
                <NewConversationModal onClose={() => setShowModal(false)} />
            )}
        </>
    );
}

export default function MessageriePage() {
    return (
        <Suspense fallback={<div className="messagerie-container">Chargement...</div>}>
            <MessagerieContent />
        </Suspense>
    );
}
