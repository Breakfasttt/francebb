"use client";

/**
 * Choix de coachs pour la messagerie (carte 093), partagé par « Nouvelle discussion » et « Ajouter des
 * participants » : un champ de recherche par pseudo (300 ms après la dernière frappe, 2 lettres au moins), la liste
 * des résultats (un appui choisit ou retire le coach, l'état est annoncé par aria-pressed) et les coachs choisis,
 * rappelés en pastilles qu'un appui retire.
 */
import { useEffect, useId, useState, type Ref } from "react";
import { Check, Search, X } from "lucide-react";
import { Button, Field, Input, cn } from "@bbfrance/ui";
import { useDebounce } from "@/common/hooks/useDebounce";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import { searchUsers } from "../actions";

export type PickedMember = Awaited<ReturnType<typeof searchUsers>>[number];

interface MemberPickerProps {
  selected: PickedMember[];
  onChange: (selected: PickedMember[]) => void;
  /** Membres à ne pas proposer (déjà dans le groupe). */
  excludeIds?: string[];
  inputRef?: Ref<HTMLInputElement>;
}

export default function MemberPicker({ selected, onChange, excludeIds = [], inputRef }: MemberPickerProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedMember[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  // Recherche après 300 ms sans frappe ; une réponse arrivée après une frappe plus récente est ignorée
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) return;
    let cancelled = false;
    searchUsers(debouncedQuery)
      .then((users) => {
        if (!cancelled) setResults(users);
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) setResults([]);
  };

  const isSelected = (id: string) => selected.some((user) => user.id === id);
  const toggle = (user: PickedMember) =>
    onChange(isSelected(user.id) ? selected.filter((u) => u.id !== user.id) : [...selected, user]);

  const visibleResults = results.filter((user) => !excludeIds.includes(user.id));

  return (
    <div className="flex flex-col gap-3">
      <Field label="Rechercher un coach" htmlFor={inputId}>
        <div className="relative">
          <Input
            id={inputId}
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tapez un nom..."
            autoComplete="off"
            className="pr-10"
          />
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-bb-text-muted" />
        </div>
      </Field>

      {selected.length > 0 && (
        <ul aria-label="Coachs choisis" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {selected.map((user) => (
            // Pastille : le nom, puis une croix « Retirer » (son nom accessible ne répète pas le pseudo, déjà lu juste avant)
            <li key={user.id} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-bb-accent-text bg-bb-accent-soft pl-3 text-[0.95rem] font-semibold text-bb-accent-text">
              {user.name}
              <Button
                type="button"
                variant="quiet"
                size="tap-icon"
                aria-label="Retirer"
                title={`Retirer ${user.name}`}
                onClick={() => toggle(user)}
                className="rounded-full text-bb-accent-text hover:bg-transparent hover:text-bb-text"
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {query.trim().length >= 2 && (
        <div className="overflow-hidden rounded-bb-md border border-bb-border">
          {visibleResults.length === 0 ? (
            <p className="m-0 p-4 text-center text-sm text-bb-text-muted">Aucun résultat</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {visibleResults.map((user) => {
                const picked = isSelected(user.id);
                return (
                  <li key={user.id} className="border-b border-bb-border last:border-b-0">
                    <Button
                      type="button"
                      variant="quiet"
                      aria-pressed={picked}
                      onClick={() => toggle(user)}
                      className={cn(
                        "flex min-h-12 w-full justify-start gap-3 rounded-none px-3 text-left text-base font-normal text-bb-text",
                        picked && "bg-bb-accent-soft hover:bg-bb-accent-soft"
                      )}
                    >
                      <MemberAvatarImage image={user.image} className="size-8 shrink-0 rounded-full" />
                      <span className="min-w-0 flex-1 truncate">{user.name}</span>
                      {picked && <Check size={18} aria-hidden="true" className="shrink-0 text-bb-accent-text" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
