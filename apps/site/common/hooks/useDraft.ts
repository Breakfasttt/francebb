"use client";

/**
 * Brouillon d'un message gardé dans le navigateur (carte 181), pour qu'un geste de retour par erreur, un appel ou un
 * onglet rechargé par le téléphone ne fasse pas perdre un long texte.
 *
 * Le texte est enregistré dans le stockage du navigateur (`localStorage`) une seconde après la dernière frappe, et
 * tout de suite quand la page passe en arrière-plan. À l'ouverture de l'écran, un brouillon de moins de 7 jours,
 * non vide et différent du texte de départ est remis dans l'éditeur (`restored` vaut alors vrai, pour afficher le
 * bandeau `DraftBanner`). Un brouillon par membre, par écran et par sujet : `scope` vaut par exemple
 * `reply:<sujet>` ou `edit:<message>`. Les règles pures sont dans `common/utils/draftRules.ts`.
 *
 * Utilisation avec l'éditeur BBCode :
 * `<BBCodeEditor key={draft.editorKey} defaultValue={draft.value} onChange={draft.onChange} … />`, puis
 * `draft.forget()` après une publication réussie et `draft.discard()` pour « Effacer ».
 *
 * Toute lecture ou écriture du stockage est protégée : en navigation privée, ou quand le stockage est plein, le
 * brouillon n'est simplement pas gardé.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DRAFT_KEY_PREFIX,
  DRAFT_SAVE_DELAY_MS,
  draftStorageKey,
  draftToRestore,
  hasDraftChanges,
  isDraftExpired,
  parseStoredDraft,
  serializeDraft,
} from "@/common/utils/draftRules";

export type Draft = {
  /** Texte à donner à l'éditeur (`defaultValue`) : le texte de départ, ou le brouillon restauré. */
  value: string;
  /** Clé à poser sur l'éditeur : elle change quand le texte est remplacé (restauration, « Effacer », envoi). */
  editorKey: number;
  /** Vrai quand un brouillon a été remis dans l'éditeur. */
  restored: boolean;
  /** À brancher sur `onChange` de l'éditeur. */
  onChange: (text: string) => void;
  /** Vrai quand le texte en cours n'est ni vide ni identique au texte de départ. */
  hasChanges: () => boolean;
  /** Oublie le brouillon sans toucher à l'éditeur (après une publication réussie, juste avant de quitter l'écran). */
  forget: () => void;
  /** Oublie le brouillon et remet le texte de départ dans l'éditeur (« Effacer », réponse rapide envoyée). */
  discard: () => void;
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Navigation privée ou stockage plein : le brouillon n'est pas gardé
  }
}

function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Stockage inaccessible : rien à effacer
  }
}

/** Efface les brouillons expirés ou abîmés de tous les écrans, pour que le stockage ne grossisse pas sans fin. */
function purgeExpiredDrafts(now: number) {
  try {
    const storage = window.localStorage;
    const expired: string[] = [];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key?.startsWith(DRAFT_KEY_PREFIX)) continue;
      const draft = parseStoredDraft(storage.getItem(key));
      if (!draft || isDraftExpired(draft.savedAt, now)) expired.push(key);
    }
    expired.forEach((key) => storage.removeItem(key));
  } catch {
    // Stockage inaccessible : rien à nettoyer
  }
}

/**
 * `warnBeforeLeave` : sur un écran de rédaction plein écran, le navigateur demande confirmation avant de quitter la
 * page (fermeture de l'onglet, rechargement, adresse tapée) quand le texte n'est pas vide.
 */
export function useDraft(scope: string, initialValue = "", { warnBeforeLeave = false }: { warnBeforeLeave?: boolean } = {}): Draft {
  const { data: session, status } = useSession();
  // Tant que la session se charge, on ne sait pas à quel membre appartient le brouillon
  const storageKey = status === "loading" ? null : draftStorageKey(scope, session?.user?.id);

  const [value, setValue] = useState(initialValue);
  const [restored, setRestored] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const keyRef = useRef<string | null>(null);
  const initialRef = useRef(initialValue);
  const currentRef = useRef(initialValue);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initialRef.current = initialValue;
  }, [initialValue]);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  /** Écrit le texte en attente : un texte vide ou identique au départ efface le brouillon. */
  const flush = useCallback(() => {
    cancelTimer();
    const key = keyRef.current;
    if (!pendingRef.current || !key) return;
    pendingRef.current = false;
    if (hasDraftChanges(currentRef.current, initialRef.current)) {
      writeStorage(key, serializeDraft(currentRef.current, Date.now()));
    } else {
      removeStorage(key);
    }
  }, [cancelTimer]);

  // Lecture du brouillon à l'ouverture de l'écran (et nettoyage des brouillons expirés)
  useEffect(() => {
    if (!storageKey) return;
    keyRef.current = storageKey;
    const now = Date.now();
    purgeExpiredDrafts(now);
    // Le membre a déjà commencé à écrire pendant le chargement de la session : on garde son texte
    if (pendingRef.current) return;
    const text = draftToRestore(readStorage(storageKey), initialRef.current, now);
    if (text === null) return;
    currentRef.current = text;
    setValue(text);
    setRestored(true);
    setEditorKey((key) => key + 1);
  }, [storageKey]);

  // Page mise en arrière-plan (appel, changement d'application) ou quittée : enregistrement immédiat
  useEffect(() => {
    const handleHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", flush);
      // Écran quitté par la navigation du site moins d'une seconde après la dernière frappe
      flush();
    };
  }, [flush]);

  useEffect(() => {
    if (!warnBeforeLeave) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasDraftChanges(currentRef.current, initialRef.current)) return;
      event.preventDefault();
      // Anciens navigateurs : la demande de confirmation n'apparaît que si returnValue est rempli
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [warnBeforeLeave]);

  const onChange = useCallback(
    (text: string) => {
      currentRef.current = text;
      pendingRef.current = true;
      cancelTimer();
      timerRef.current = setTimeout(flush, DRAFT_SAVE_DELAY_MS);
    },
    [cancelTimer, flush]
  );

  const hasChanges = useCallback(() => hasDraftChanges(currentRef.current, initialRef.current), []);

  const forget = useCallback(() => {
    cancelTimer();
    pendingRef.current = false;
    if (keyRef.current) removeStorage(keyRef.current);
    currentRef.current = initialRef.current;
    setRestored(false);
  }, [cancelTimer]);

  const discard = useCallback(() => {
    forget();
    setValue(initialRef.current);
    setEditorKey((key) => key + 1);
  }, [forget]);

  return { value, editorKey, restored, onChange, hasChanges, forget, discard };
}
