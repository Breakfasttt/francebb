"use client";

/**
 * Fenêtre d'aide de BBScheme (carte 100) : comment se servir du plateau et de chaque outil. Panneau qui monte du bas
 * sur téléphone, fenêtre centrée sur ordinateur (composant Sheet de packages/ui).
 */
import type { ReactNode } from "react";
import { Sheet, SheetContent, useMediaQuery, DESKTOP_QUERY } from "@bbfrance/ui";
import {
  CircleDot, Clock, Copy, Download, Eraser, Info, MousePointer2, Pencil, PlusCircle, RotateCw, Share2, Trash2, Undo2, Users, Wand2,
} from "lucide-react";

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Item({ icon, title, children }: { icon?: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3 py-1.5">
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-bb-accent-text">{icon}</span>
      <span className="text-[0.95rem] leading-snug">
        <strong className="font-semibold text-bb-text">{title}</strong>
        <span className="text-bb-text-muted"> : {children}</span>
      </span>
    </li>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-bb-border py-3 last:border-b-0">
      <h3 className="m-0 mb-1 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">{title}</h3>
      <ul className="m-0 list-none p-0">{children}</ul>
    </section>
  );
}

export default function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isDesktop ? "center" : "bottom"} title="Guide de BBScheme" description="Préparez une action de Blood Bowl image par image, puis partagez-la.">
        <Section title="Placer les joueurs">
          <Item icon={<Users size={18} />} title="Rosters">choisissez le roster de chaque équipe dans sa réserve (sur téléphone, boutons « Bleue » et « Rouge » en bas de l&apos;écran).</Item>
          <Item icon={<MousePointer2 size={18} />} title="Déplacer">touchez un pion (sur le terrain ou dans la réserve), puis la case où il doit aller. Touchez de nouveau le pion pour le désélectionner.</Item>
          <Item icon={<CircleDot size={18} />} title="Ballon">pour le donner à un joueur, choisissez le ballon puis le joueur. « Lâcher le ballon » le pose sur une case libre voisine.</Item>
          <Item title="Star Players">choisissez un pion « Star Player » de la réserve, puis le joueur précis dans la liste qui apparaît.</Item>
        </Section>
        <Section title="Outils">
          <Item icon={<Pencil size={18} />} title="Crayon">tracer des flèches et des annotations sur le terrain.</Item>
          <Item icon={<Wand2 size={18} />} title="État du joueur">chaque appui sur un pion change son état : debout, à terre, sonné, bonehead, stupid, fourchette.</Item>
          <Item icon={<Eraser size={18} />} title="Gomme">un appui sur un pion le retire du plateau ; un appui sur une case efface aussi tous les dessins. « Effacer les dessins » les efface sans toucher aux pions.</Item>
          <Item icon={<Undo2 size={18} />} title="Annuler">revenir sur la dernière action.</Item>
          <Item icon={<Trash2 size={18} />} title="Tout vider">retirer tous les joueurs et les dessins ; le ballon revient au centre.</Item>
        </Section>
        <Section title="Animation">
          <Item icon={<PlusCircle size={18} />} title="Ajouter une image">sur la dernière image, le bouton « suivante » en crée une nouvelle (50 images au plus).</Item>
          <Item icon={<Copy size={18} />} title="Dupliquer">copier l&apos;image affichée juste après elle, pratique pour un petit mouvement.</Item>
          <Item icon={<Clock size={18} />} title="Vitesse">délai entre deux images pendant la lecture, en millisecondes.</Item>
          <Item icon={<Download size={18} />} title="GIF">exporter l&apos;animation en image animée à télécharger.</Item>
        </Section>
        <Section title="Affichage et partage">
          <Item icon={<Info size={18} />} title="Infos des joueurs">afficher ou masquer la fiche d&apos;un joueur au survol de son pion.</Item>
          <Item icon={<RotateCw size={18} />} title="Rotation">mettre le terrain à l&apos;horizontale ou à la verticale. Le zoom se règle avec le curseur, la molette de la souris ou en pinçant le terrain à deux doigts.</Item>
          <Item icon={<Share2 size={18} />} title="Partager">enregistrer le plateau et copier son lien. Collé entre les balises [bbscheme] et [/bbscheme] d&apos;un message, il affiche l&apos;animation.</Item>
        </Section>
        <p className="m-0 py-3 text-sm text-bb-text-muted">
          Inspiré par BBPusher, d&apos;
          <a href="https://www.teamfrancebb.fr/bbpusher/" target="_blank" rel="noopener noreferrer" className="text-bb-accent-text underline">Elyoukey et Thot</a>.
        </p>
      </SheetContent>
    </Sheet>
  );
}
