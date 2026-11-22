"use client";

/**
 * Fenêtres « Scinder le sujet » et « Fusionner avec un autre sujet » (carte 169), ouvertes par un modérateur depuis les
 * outils du sujet (TopicTools.tsx). Les deux sont des `ConfirmDialog` de @bbfrance/ui : panneau qui monte du bas sur
 * téléphone, fenêtre centrée sur ordinateur, avec leurs champs entre la phrase d'explication et les boutons.
 * - Scinder : les messages ont été cochés dans la page (mode « scission », barre collée en bas) ; la fenêtre demande
 *   le titre et le forum du nouveau sujet, puis ouvre ce nouveau sujet.
 * - Fusionner : le modérateur cherche le sujet d'arrivée par son titre ou son identifiant, le choisit dans la liste,
 *   puis confirme ; il arrive sur le sujet d'arrivée.
 * Carte 221 : les résultats de la fusion donnent l'auteur, la date du dernier message et le début de l'identifiant ;
 * les forums de la scission sont groupés par catégorie quand la page la fournit (`categoryName`).
 * Les règles et les vérifications sont dans app/forum/topicSplitMergeActions.ts.
 */
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button, ConfirmDialog, Field, Input, Select, cn, toast } from "@bbfrance/ui";
import { useDebounce } from "@/common/hooks/useDebounce";
import { mergeTopics, searchMergeTargets, splitTopic } from "@/app/forum/topicSplitMergeActions";
import { TOPIC_TITLE_MAX_LENGTH } from "@/lib/forumWriteRules";
import { fullFrenchDateTime } from "@/common/components/RelativeTime/RelativeTime";

export interface SplitForumOption {
  id: string;
  name: string;
  isTournamentForum?: boolean;
  /** Catégorie du forum : les choix de la scission sont groupés par catégorie quand elle est connue. */
  categoryName?: string | null;
}

/** Forums groupés par catégorie, dans l'ordre de leur première apparition ; un seul groupe sans nom sinon. */
function groupByCategory(forums: SplitForumOption[]): { name: string | null; forums: SplitForumOption[] }[] {
  const groups = new Map<string | null, SplitForumOption[]>();
  for (const forum of forums) {
    const key = forum.categoryName ?? null;
    groups.set(key, [...(groups.get(key) ?? []), forum]);
  }
  return [...groups].map(([name, list]) => ({ name, forums: list }));
}

export function SplitTopicDialog({
  open,
  onOpenChange,
  topicId,
  postIds,
  forums,
  defaultForumId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  postIds: string[];
  forums: SplitForumOption[];
  defaultForumId: string;
  /** Appelée après la scission réussie, avant d'ouvrir le nouveau sujet (pour quitter le mode « scission »). */
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  // Un forum de tournois ne reçoit que des annonces de tournoi : il n'est pas proposé
  const choices = forums.filter((forum) => !forum.isTournamentForum);
  const [forumId, setForumId] = useState(choices.some((forum) => forum.id === defaultForumId) ? defaultForumId : "");
  const count = postIds.length;
  // Erreurs de saisie, affichées sous le champ concerné (carte 194)
  const [errors, setErrors] = useState<{ title?: string; forum?: string }>({});

  const handleConfirm = () => {
    const nextErrors = {
      title: title.trim() ? undefined : "Donne un titre au nouveau sujet.",
      forum: forumId ? undefined : "Choisis le forum du nouveau sujet.",
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.forum) {
      document.getElementById(nextErrors.title ? "split-topic-title" : "split-topic-forum")?.focus();
      return;
    }
    startTransition(async () => {
      const res = await splitTopic(topicId, postIds, title, forumId);
      if (!res.success || !res.topicId) {
        toast.error(res.error || "La scission a échoué.");
        return;
      }
      toast.success(`${count} message${count > 1 ? "s" : ""} déplacé${count > 1 ? "s" : ""} vers le nouveau sujet.`);
      onDone();
      onOpenChange(false);
      router.push(`/forum/topic/${res.topicId}`);
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Scinder le sujet"
      message={`${count} message${count > 1 ? "s" : ""} choisi${count > 1 ? "s" : ""} partir${count > 1 ? "ont" : "a"} dans un nouveau sujet, rangé${count > 1 ? "s" : ""} à leur date. L'auteur du nouveau sujet est celui du plus ancien message déplacé.`}
      confirmLabel="Créer le nouveau sujet"
      pending={isPending}
      onConfirm={handleConfirm}
    >
      <div className="flex flex-col gap-4">
        <Field label="Titre du nouveau sujet" htmlFor="split-topic-title" error={errors.title}>
          <Input
            id="split-topic-title"
            value={title}
            maxLength={TOPIC_TITLE_MAX_LENGTH}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Ex : Suite de la discussion sur…"
          />
        </Field>
        <Field label="Forum du nouveau sujet" htmlFor="split-topic-forum" error={errors.forum}>
          <Select
            id="split-topic-forum"
            value={forumId}
            onChange={(event) => {
              setForumId(event.target.value);
              setErrors((prev) => ({ ...prev, forum: undefined }));
            }}
          >
            <option value="" disabled>
              Choisir un forum…
            </option>
            {groupByCategory(choices).map((group) =>
              group.name ? (
                <optgroup key={group.name} label={group.name}>
                  {group.forums.map((forum) => (
                    <option key={forum.id} value={forum.id}>
                      {forum.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                group.forums.map((forum) => (
                  <option key={forum.id} value={forum.id}>
                    {forum.name}
                  </option>
                ))
              )
            )}
          </Select>
        </Field>
      </div>
    </ConfirmDialog>
  );
}

type MergeTarget = Awaited<ReturnType<typeof searchMergeTargets>>[number];

export function MergeTopicDialog({
  open,
  onOpenChange,
  topicId,
  topicTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  topicTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  // Résultats de la dernière recherche, avec le texte cherché : ils ne s'affichent que pour le texte en cours
  const [found, setFound] = useState<{ query: string; topics: MergeTarget[] }>({ query: "", topics: [] });
  const [selected, setSelected] = useState<MergeTarget | null>(null);
  // Erreur affichée sous le champ de recherche (carte 194)
  const [selectedError, setSelectedError] = useState<string>();
  const searching = debouncedQuery.trim().length >= 2;
  const results = searching && found.query === debouncedQuery ? found.topics : [];

  // Recherche des sujets d'arrivée possibles, à chaque pause dans la saisie
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) return;
    let current = true;
    searchMergeTargets(topicId, debouncedQuery).then((topics) => {
      if (current) setFound({ query: debouncedQuery, topics });
    });
    return () => {
      current = false;
    };
  }, [debouncedQuery, topicId]);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setSelected(null);
      setSelectedError(undefined);
    }
  };

  const handleConfirm = () => {
    if (!selected) {
      setSelectedError("Choisis le sujet qui recevra les messages.");
      document.getElementById("merge-topic-search")?.focus();
      return;
    }
    startTransition(async () => {
      const res = await mergeTopics(topicId, selected.id);
      if (!res.success || !res.topicId) {
        toast.error(res.error || "La fusion a échoué.");
        return;
      }
      toast.success(`Sujets fusionnés dans « ${selected.title} ».`);
      close(false);
      router.push(`/forum/topic/${res.topicId}`);
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={close}
      title="Fusionner avec un autre sujet"
      message={`Tous les messages de « ${topicTitle} » rejoindront le sujet choisi, rangés à leur date. Ce sujet, vidé, sera ensuite supprimé.`}
      confirmLabel={selected ? `Fusionner dans « ${selected.title} »` : "Fusionner"}
      danger
      pending={isPending}
      onConfirm={handleConfirm}
    >
      <div className="flex flex-col gap-3">
        <Field label="Sujet d'arrivée" htmlFor="merge-topic-search" hint="Tape au moins deux lettres du titre, ou l'identifiant du sujet." error={selectedError}>
          <Input
            id="merge-topic-search"
            type="search"
            value={query}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
          />
        </Field>
        {searching && found.query === debouncedQuery && results.length === 0 && (
          <p className="m-0 text-sm text-bb-text-muted">Aucun sujet trouvé (les sujets de tournoi ne peuvent pas être fusionnés).</p>
        )}
        {results.length > 0 && (
          <ul aria-label="Sujets trouvés" className="m-0 flex max-h-64 list-none flex-col gap-1.5 overflow-y-auto p-0">
            {results.map((topic) => {
              const isSelected = selected?.id === topic.id;
              return (
                <li key={topic.id}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="tap"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelected(topic);
                      setSelectedError(undefined);
                    }}
                    className={cn("h-auto w-full flex-col items-start gap-0.5 py-2 text-left whitespace-normal", isSelected && "border-bb-accent text-bb-accent-text")}
                  >
                    <span className="flex w-full items-start gap-2 font-semibold break-words">
                      {isSelected && <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0" />}
                      {topic.title}
                    </span>
                    <span className="text-sm font-normal text-bb-text-muted">
                      {topic.forum.name} · par {topic.author?.name ?? "un ancien membre"} · {topic._count.posts} message{topic._count.posts > 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-normal text-bb-text-muted tabular-nums">
                      Dernier message le {fullFrenchDateTime(topic.lastPostAt)} · n° {topic.id.slice(-6)}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ConfirmDialog>
  );
}
