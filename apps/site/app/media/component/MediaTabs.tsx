"use client";

/** Onglets « YouTube » et « Twitch » de la page `/media`, liés à l'adresse (`?onglet=`), navigation sans rechargement. */
import Link from "next/link";
import { LinkTabs } from "@bbfrance/ui";

export default function MediaTabs({ active }: { active: "youtube" | "twitch" }) {
  return (
    <LinkTabs
      label="Plateformes"
      linkComponent={Link}
      tabs={[
        { label: "YouTube", href: "/media", active: active === "youtube" },
        { label: "Twitch", href: "/media?onglet=twitch", active: active === "twitch" },
      ]}
    />
  );
}
