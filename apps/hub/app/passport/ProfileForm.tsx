"use client";

/**
 * Formulaire du profil dans le passeport (carte 120). Envoie les modifications à PATCH /api/v1/profile, la même
 * adresse que celle des applications, avec la session du coach : les vérifications sont donc les mêmes partout.
 * Avatar (22/11/2026) : même bloc que le profil du site — aperçu, adresse, « Aléatoire », « Générer » (générateur
 * DiceBear partagé de @bbfrance/ui) et « Envoyer une image » (ImgBB, action serveur du hub, si la clé est configurée).
 * Le contour d'avatar reste propre au site (il dépend des messages du forum).
 */
import { useRef, useState } from "react";
import { Avatar, AvatarGeneratorSheet, Button, Field, Input, Select, randomDicebearUrl } from "@bbfrance/ui";
import { uploadAvatar } from "./avatarUpload";
import { ErrorMessage, SuccessMessage } from "../components/Messages";

type Profile = { name: string; image: string | null; naf: string | null; region: string | null; locale: string | null; timezone: string | null };

const LOCALES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

// Fuseaux des coachs francophones les plus courants ; un fuseau déjà enregistré mais absent de la liste reste proposé
/** Nom lisible d'un fuseau : « Paris (UTC+1) » plutôt que « Europe/Paris » (décalage d'aujourd'hui, heure d'été comprise). */
function timezoneLabel(timezone: string): string {
  const city = timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone;
  try {
    const offset = new Intl.DateTimeFormat("fr-FR", { timeZone: timezone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;
    return timezone === "UTC" ? "Temps universel (UTC)" : `${city} (${offset?.replace("GMT", "UTC") ?? timezone})`;
  } catch {
    return city;
  }
}

const TIMEZONES = [
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Luxembourg",
  "America/Montreal",
  "America/Guadeloupe",
  "America/Martinique",
  "America/Cayenne",
  "Indian/Reunion",
  "Indian/Mayotte",
  "Pacific/Noumea",
  "Pacific/Tahiti",
  "UTC",
];

export default function ProfileForm({ initial, canUploadAvatar = false }: { initial: Profile; canUploadAvatar?: boolean }) {
  const [form, setForm] = useState({
    name: initial.name,
    image: initial.image ?? "",
    naf: initial.naf ?? "",
    region: initial.region ?? "",
    locale: initial.locale ?? "fr",
    timezone: initial.timezone ?? "Europe/Paris",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timezones = TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES];
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setImage = (image: string) => setForm((current) => ({ ...current, image }));

  const sendImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setErrors((current) => ({ ...current, image: "" }));
    const data = new FormData();
    data.set("image", file);
    const result = await uploadAvatar(data);
    setUploading(false);
    if ("url" in result) setImage(result.url);
    else setErrors((current) => ({ ...current, image: result.error }));
  };

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    setErrors({});
    const response = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setStatus("saved");
      return;
    }
    const body = (await response.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
    setErrors(body.errors ?? { form: body.message ?? "Enregistrement impossible, réessaie." });
    setStatus("error");
  };

  const field = (name: keyof typeof form, label: string, input: React.ReactNode, help?: string) => (
    <Field label={label} htmlFor={`profile-${name}`} hint={help} error={errors[name]}>
      {input}
    </Field>
  );

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4">
      {field("name", "Pseudo", <Input id="profile-name" value={form.name} onChange={update("name")} autoComplete="nickname" maxLength={32} required />, "Le nom affiché dans toutes les applications. Unique.")}
      {field("naf", "Numéro NAF", <Input id="profile-naf" value={form.naf} onChange={update("naf")} inputMode="numeric" maxLength={10} />, "Facultatif. Déclaré par toi, il n'est pas vérifié.")}
      {field("region", "Région", <Input id="profile-region" value={form.region} onChange={update("region")} maxLength={60} />)}
      {/* Avatar : aperçu à gauche, adresse et boutons à droite (même bloc que le profil du site) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-1 self-center sm:self-start">
          <Avatar key={form.image} name={form.name} src={form.image || null} size={96} />
          <span className="text-sm font-semibold text-bb-text-muted">Aperçu</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {field("image", "Adresse de l'avatar", <Input id="profile-image" value={form.image} onChange={update("image")} type="url" inputMode="url" placeholder="https://…" />, "Facultatif : l'adresse d'une image en https, ou l'un des boutons ci-dessous.")}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={() => setImage(randomDicebearUrl())}>
              Aléatoire
            </Button>
            <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={() => setGeneratorOpen(true)}>
              Générer
            </Button>
            {canUploadAvatar && (
              <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? "Envoi…" : "Envoyer une image"}
              </Button>
            )}
          </div>
          {canUploadAvatar && <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" tabIndex={-1} aria-hidden="true" onChange={sendImage} />}
        </div>
      </div>
      <AvatarGeneratorSheet open={generatorOpen} onOpenChange={setGeneratorOpen} initialSeed={form.name} seedInputId="avatar-seed" onApply={setImage} />
      {field(
        "locale",
        "Langue",
        <Select id="profile-locale" value={form.locale} onChange={update("locale")}>
          {LOCALES.map((locale) => (
            <option key={locale.value} value={locale.value}>{locale.label}</option>
          ))}
        </Select>,
      )}
      {field(
        "timezone",
        "Fuseau horaire",
        <Select id="profile-timezone" value={form.timezone} onChange={update("timezone")}>
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>{timezoneLabel(timezone)}</option>
          ))}
        </Select>,
      )}
      {errors.form && <ErrorMessage>{errors.form}</ErrorMessage>}
      {status === "saved" && <SuccessMessage>Profil enregistré. Les applications sont prévenues.</SuccessMessage>}
      <Button variant="primary" size="tap" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
