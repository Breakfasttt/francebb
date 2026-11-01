"use client";

/**
 * Onglet « Configuration » de l'administration (refonte, carte 099) : les réglages généraux du site, aujourd'hui le
 * lien d'invitation au serveur Discord de la communauté. Les actions `getSiteSetting` et `updateSiteSetting` sont
 * inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { Globe, Save } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, Input, Skeleton, toast } from "@bbfrance/ui";
import { getSiteSetting, updateSiteSetting } from "../actions";

export default function GeneralTab() {
  const [discordInvite, setDiscordInvite] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const invite = await getSiteSetting("discord_invite");
        setDiscordInvite(invite || "");
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSiteSetting("discord_invite", discordInvite);
        toast.success("Paramètres mis à jour !");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Globe size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Paramètres généraux</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="m-0 text-[0.95rem] text-bb-text-muted">Configuration globale du site BBFrance.</p>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <Field
            label="Lien d'invitation Discord"
            htmlFor="discord-invite"
            hint="L'adresse d'invitation pour rejoindre le serveur Discord de la communauté."
          >
            <Input
              id="discord-invite"
              type="text"
              inputMode="url"
              value={discordInvite}
              onChange={(e) => setDiscordInvite(e.target.value)}
              placeholder="https://discord.gg/..."
            />
          </Field>
        )}
        <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto lg:self-end" disabled={isPending || isLoading} onClick={handleSave}>
          <Save size={18} aria-hidden="true" />
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </CardBody>
    </Card>
  );
}
