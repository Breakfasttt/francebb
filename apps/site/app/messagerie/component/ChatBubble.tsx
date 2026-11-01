"use client";

/**
 * Une bulle de message (refonte, carte 093) : ses propres messages à droite, sur la couleur douce de l'accent ; ceux
 * des autres à gauche, avec l'avatar de l'auteur. Le texte est du BBCode converti en HTML (styles des blocs dans
 * common/components/BBCodeContent/bbcode.css, chargé pour tout le site). L'heure est suivie de la date si le message n'est pas du jour.
 */
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, cn } from "@bbfrance/ui";
import { parseBBCode } from "@/lib/bbcode";

interface ChatBubbleProps {
  message: {
    content: string;
    createdAt: Date | string;
    author: { id: string; name: string | null; image: string | null };
  };
  isSelf: boolean;
  /** Nom de l'auteur au-dessus de la bulle (premier message d'une suite, dans un groupe). */
  showName: boolean;
  /** Avatar à côté de la bulle (dernier message d'une suite) ; sinon, une place vide garde l'alignement. */
  showAvatar: boolean;
}

/** Mise en forme du HTML produit par le BBCode, dans une bulle étroite. */
const bbcodeClass =
  "min-w-0 break-words [overflow-wrap:anywhere] [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_p]:my-1 [&_blockquote]:my-1";

export default function ChatBubble({ message, isSelf, showName, showAvatar }: ChatBubbleProps) {
  const date = new Date(message.createdAt);
  const time = isToday(date) ? format(date, "HH:mm", { locale: fr }) : format(date, "d MMM, HH:mm", { locale: fr });

  return (
    <div className={cn("flex items-end gap-2", isSelf ? "justify-end" : "justify-start")}>
      {!isSelf && (
        <span className="w-8 shrink-0">
          {showAvatar && <Avatar name={message.author.name} src={message.author.image} size={32} />}
        </span>
      )}
      <div
        className={cn(
          "flex max-w-[85%] min-w-0 flex-col gap-0.5 rounded-[18px] px-3.5 py-2 text-[0.98rem] leading-snug lg:max-w-[70%]",
          isSelf
            ? "rounded-br-[6px] border border-bb-accent-text/30 bg-bb-accent-soft text-bb-text"
            : "rounded-bl-[6px] border border-bb-border bg-bb-surface-2 text-bb-text"
        )}
      >
        {showName && !isSelf && <span className="text-xs font-bold text-bb-accent-text">{message.author.name}</span>}
        <div className={bbcodeClass} dangerouslySetInnerHTML={{ __html: parseBBCode(message.content) }} />
        <time dateTime={date.toISOString()} className="self-end text-[0.75rem] text-bb-text-muted">
          {time}
        </time>
      </div>
    </div>
  );
}
