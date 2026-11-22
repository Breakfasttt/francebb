"use client";

/**
 * Onglet « Médias » de l'administration : les chaînes YouTube et Twitch de la page `/media` et du bloc Médias de
 * l'accueil. On colle l'adresse d'une chaîne, le site retrouve son identifiant et son nom (YouTube) ; on ordonne ou
 * retire les chaînes, puis « Enregistrer les chaînes » écrit les deux listes (journal de modération). Les changements
 * non enregistrés sont signalés au-dessus du bouton. Actions : app/administration/mediaActions.ts.
 */
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Trash2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState, Field, Input, Skeleton, toast } from "@bbfrance/ui";
import { checkTwitchChannel, findYoutubeChannel, getMediaChannels, saveMediaChannels } from "../mediaActions";
import type { YoutubeChannel } from "@/lib/mediaChannels";

type Row = { key: string; label: string; detail: string; href: string };

/** Liste ordonnable : monter, descendre, retirer. */
function ChannelList({ rows, onMove, onRemove, empty }: { rows: Row[]; onMove: (index: number, dir: -1 | 1) => void; onRemove: (index: number) => void; empty: string }) {
  if (rows.length === 0) return <EmptyState title={empty} />;
  return (
    <ol className="m-0 flex list-none flex-col divide-y divide-bb-border p-0">
      {rows.map((row, index) => (
        <li key={row.key} className="flex items-center gap-2 py-2">
          <div className="min-w-0 flex-1">
            <a href={row.href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 font-semibold text-bb-text no-underline hover:underline">
              <span className="truncate">{row.label}</span>
              <ExternalLink size={14} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
            </a>
            <p className="m-0 truncate text-sm text-bb-text-muted">{row.detail}</p>
          </div>
          <Button type="button" variant="quiet" size="tap-icon" aria-label={`Monter ${row.label}`} disabled={index === 0} onClick={() => onMove(index, -1)}>
            <ArrowUp size={18} aria-hidden="true" />
          </Button>
          <Button type="button" variant="quiet" size="tap-icon" aria-label={`Descendre ${row.label}`} disabled={index === rows.length - 1} onClick={() => onMove(index, 1)}>
            <ArrowDown size={18} aria-hidden="true" />
          </Button>
          <Button type="button" variant="quiet" size="tap-icon" aria-label={`Retirer ${row.label}`} onClick={() => onRemove(index)}>
            <Trash2 size={18} aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ol>
  );
}

function moved<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[index], next[index + dir]] = [next[index + dir], next[index]];
  return next;
}

export default function MediaTab() {
  const [loading, setLoading] = useState(true);
  const [youtube, setYoutube] = useState<YoutubeChannel[]>([]);
  const [twitch, setTwitch] = useState<string[]>([]);
  const [twitchApi, setTwitchApi] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeError, setYoutubeError] = useState<string>();
  const [twitchInput, setTwitchInput] = useState("");
  const [twitchError, setTwitchError] = useState<string>();
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();

  useEffect(() => {
    getMediaChannels().then((data) => {
      if (data) {
        setYoutube(data.youtube);
        setTwitch(data.twitch);
        setTwitchApi(data.twitchApi);
      }
      setLoading(false);
    });
  }, []);

  const addYoutube = (event: FormEvent) => {
    event.preventDefault();
    if (!youtubeInput.trim()) return setYoutubeError("Colle l'adresse d'une chaîne YouTube.");
    startSearch(async () => {
      const res = await findYoutubeChannel(youtubeInput);
      if (!res.success || !res.channel) return setYoutubeError(res.error);
      const channel = res.channel;
      if (youtube.some((c) => c.id === channel.id)) return setYoutubeError(`« ${channel.name} » est déjà dans la liste.`);
      setYoutube((list) => [...list, channel]);
      setYoutubeInput("");
      setYoutubeError(undefined);
      setDirty(true);
    });
  };

  const addTwitch = (event: FormEvent) => {
    event.preventDefault();
    if (!twitchInput.trim()) return setTwitchError("Colle le nom ou l'adresse d'une chaîne Twitch.");
    startSearch(async () => {
      const res = await checkTwitchChannel(twitchInput);
      if (!res.success || !res.name) return setTwitchError(res.error);
      const name = res.name;
      if (twitch.includes(name)) return setTwitchError(`« ${name} » est déjà dans la liste.`);
      setTwitch((list) => [...list, name]);
      setTwitchInput("");
      setTwitchError(undefined);
      setDirty(true);
    });
  };

  const save = () => {
    startSave(async () => {
      const res = await saveMediaChannels({ youtube, twitch });
      if (!res.success) return void toast.error(res.error ?? "Les chaînes n'ont pas pu être enregistrées.");
      setDirty(false);
      toast.success("Chaînes enregistrées.");
    });
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Chaînes YouTube ({youtube.length})</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={addYoutube} noValidate className="flex flex-col gap-2 lg:flex-row lg:items-start">
            <Field label="Ajouter une chaîne" htmlFor="media-youtube" hint="Adresse de la chaîne : youtube.com/@nom ou youtube.com/channel/…" error={youtubeError} className="flex-1">
              <Input id="media-youtube" type="text" inputMode="url" autoComplete="off" placeholder="https://www.youtube.com/@…" value={youtubeInput} onChange={(e) => { setYoutubeInput(e.target.value); setYoutubeError(undefined); }} />
            </Field>
            <Button type="submit" variant="secondary" size="tap" disabled={searching} className="lg:mt-7">
              {searching ? "Recherche…" : "Ajouter"}
            </Button>
          </form>
          <ChannelList
            rows={youtube.map((c) => ({ key: c.id, label: c.name, detail: c.id, href: `https://www.youtube.com/channel/${c.id}` }))}
            onMove={(i, dir) => { setYoutube((l) => moved(l, i, dir)); setDirty(true); }}
            onRemove={(i) => { setYoutube((l) => l.filter((_, j) => j !== i)); setDirty(true); }}
            empty="Aucune chaîne YouTube."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chaînes Twitch ({twitch.length})</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="m-0 text-sm text-bb-text-muted" role="note">
            {twitchApi
              ? "Connexion à l'API de Twitch active : la page Médias montre les vrais directs et les dernières vidéos ou clips."
              : "API de Twitch non configurée (TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET, voir DEPLOY.md) : les directs sont détectés dans le navigateur du visiteur, sans les dernières vidéos ni les clips."}
          </p>
          <form onSubmit={addTwitch} noValidate className="flex flex-col gap-2 lg:flex-row lg:items-start">
            <Field label="Ajouter une chaîne" htmlFor="media-twitch" hint="Nom de la chaîne ou adresse : twitch.tv/nom" error={twitchError} className="flex-1">
              <Input id="media-twitch" type="text" autoComplete="off" placeholder="https://www.twitch.tv/…" value={twitchInput} onChange={(e) => { setTwitchInput(e.target.value); setTwitchError(undefined); }} />
            </Field>
            <Button type="submit" variant="secondary" size="tap" disabled={searching} className="lg:mt-7">
              Ajouter
            </Button>
          </form>
          <ChannelList
            rows={twitch.map((name) => ({ key: name, label: name, detail: `twitch.tv/${name}`, href: `https://www.twitch.tv/${name}` }))}
            onMove={(i, dir) => { setTwitch((l) => moved(l, i, dir)); setDirty(true); }}
            onRemove={(i) => { setTwitch((l) => l.filter((_, j) => j !== i)); setDirty(true); }}
            empty="Aucune chaîne Twitch."
          />
        </CardBody>
      </Card>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
        {dirty && <p className="m-0 text-sm text-bb-warning-text" role="status">Modifications non enregistrées.</p>}
        <Button type="button" variant="primary" size="tap" disabled={!dirty || saving} onClick={save}>
          {saving ? "Enregistrement…" : "Enregistrer les chaînes"}
        </Button>
      </div>
    </div>
  );
}
