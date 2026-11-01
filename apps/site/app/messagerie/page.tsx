"use client";

/**
 * Messagerie privée (refonte, carte 093, ADR 0006).
 * - Ordinateur : deux colonnes de la hauteur de l'écran, la liste des conversations à gauche et la conversation
 *   ouverte à droite (ou une invitation à en choisir une).
 * - Téléphone : comme une application de messagerie, la liste seule, puis la conversation en plein écran
 *   (voir ConversationView). La conversation n'a pas sa propre adresse : c'est le paramètre `?id=` qui l'ouvre.
 * Les adresses n'ont pas changé : `?id=` ouvre une conversation, `?userId=` ouvre ou reprend une conversation à deux
 * avec ce membre (lien « MP » du forum, des profils et de l'annuaire).
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, MessagesSquare, Plus } from "lucide-react";
import { Button, Card, EmptyState, Skeleton, toast } from "@bbfrance/ui";
import ConversationList from "./component/ConversationList";
import ConversationView from "./component/ConversationView";
import NewConversationModal, { ENCRYPTION_NOTE } from "./component/NewConversationModal";
import { startConversation } from "./actions";

function MessagerieContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams.get("id");
  const userId = searchParams.get("userId");
  const [showNew, setShowNew] = useState(false);
  // Change à chaque événement qui modifie la liste (message envoyé, groupe renommé…) : la liste se recharge
  const [listVersion, setListVersion] = useState(0);
  const refreshList = useCallback(() => setListVersion((version) => version + 1), []);

  // ?userId= : ouvre ou reprend la conversation à deux avec ce membre, puis remplace l'adresse par ?id=
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    startConversation([userId])
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          router.replace(`/messagerie?id=${res.conversationId}`);
        } else {
          toast.error(res.error || "Impossible de démarrer la conversation");
          router.replace("/messagerie");
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) router.replace("/messagerie");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, router]);

  if (userId) {
    return (
      <div className="mx-auto w-full max-w-[1232px] px-4 py-10 font-bb-sans text-bb-text">
        <EmptyState icon={<MessagesSquare size={32} />} title="Ouverture de la conversation…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pt-3 font-bb-sans text-base text-bb-text lg:grid lg:h-[calc(100dvh-8.5rem)] lg:min-h-[480px] lg:grid-cols-[minmax(300px,360px)_1fr] lg:gap-4 lg:px-6 lg:pt-4">
      {/* Colonne de la liste ; sur téléphone, cachée quand une conversation est ouverte */}
      <section aria-labelledby="messagerie-title" className={activeId ? "max-lg:hidden lg:flex lg:min-h-0 lg:flex-col" : "lg:flex lg:min-h-0 lg:flex-col"}>
        {/* Titre et sous-titre sur toute la largeur, puis le bouton « Nouvelle conversation » sur toute la largeur */}
        <header className="flex flex-col gap-3 pb-3">
          <div>
            <h1 id="messagerie-title" className="m-0 border-0 p-0 text-2xl leading-tight font-bold tracking-normal text-bb-text normal-case not-italic">
              Messagerie
            </h1>
            <p className="m-0 mt-0.5 text-sm text-bb-text-muted">Vos discussions privées avec les autres coachs</p>
          </div>
          <Button type="button" variant="primary" size="tap" onClick={() => setShowNew(true)} className="w-full gap-1.5">
            <Plus size={18} aria-hidden="true" />
            Nouvelle conversation
          </Button>
        </header>
        <Card className="overflow-hidden lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <ConversationList activeId={activeId} version={listVersion} />
        </Card>
      </section>

      {/* Conversation ouverte (plein écran sur téléphone), ou invitation à en choisir une sur ordinateur */}
      {activeId ? (
        <Card className="max-lg:contents lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
          <ConversationView key={activeId} conversationId={activeId} onChange={refreshList} onClose={() => router.push("/messagerie")} />
        </Card>
      ) : (
        <Card className="hidden lg:flex lg:min-h-0 lg:flex-col lg:items-center lg:justify-center">
          <EmptyState icon={<MessagesSquare size={40} />} title="Choisissez une conversation">
            <p className="m-0">Ou commencez-en une nouvelle avec le bouton « Nouvelle conversation ».</p>
            <p className="m-0 mt-4 flex items-start justify-center gap-2 text-left">
              <Lock size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>{ENCRYPTION_NOTE}</span>
            </p>
          </EmptyState>
        </Card>
      )}

      {showNew && <NewConversationModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function LoadingList() {
  return (
    <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-3 px-3 pt-3 lg:px-6 lg:pt-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export default function MessageriePage() {
  return (
    <Suspense fallback={<LoadingList />}>
      <MessagerieContent />
    </Suspense>
  );
}
