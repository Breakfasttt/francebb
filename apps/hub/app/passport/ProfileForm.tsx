"use client";

/**
 * Formulaire du profil dans le passeport (carte 120). Envoie les modifications à PATCH /api/v1/profile, la même
 * adresse que celle des applications, avec la session du coach : les vérifications sont donc les mêmes partout.
 */
import { useState } from "react";

type Profile = { name: string; image: string | null; naf: string | null; region: string | null; locale: string | null; timezone: string | null };

const LOCALES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

// Fuseaux des coachs francophones les plus courants ; un fuseau déjà enregistré mais absent de la liste reste proposé
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

export default function ProfileForm({ initial }: { initial: Profile }) {
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
    <div className="hub-field">
      <label htmlFor={`profile-${name}`}>{label}</label>
      {input}
      {help && <p className="hub-muted hub-help">{help}</p>}
      {errors[name] && <p className="hub-error" role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={save} noValidate>
      {field("name", "Pseudo", <input id="profile-name" value={form.name} onChange={update("name")} autoComplete="nickname" maxLength={32} required />, "Le nom affiché dans toutes les applications. Unique.")}
      {field("naf", "Numéro NAF", <input id="profile-naf" value={form.naf} onChange={update("naf")} inputMode="numeric" maxLength={10} />, "Facultatif. Déclaré par toi, il n'est pas vérifié.")}
      {field("region", "Région", <input id="profile-region" value={form.region} onChange={update("region")} maxLength={60} />)}
      {field("image", "Adresse de l'avatar", <input id="profile-image" value={form.image} onChange={update("image")} type="url" inputMode="url" placeholder="https://…" />, "Facultatif. Une image en https.")}
      {field(
        "locale",
        "Langue",
        <select id="profile-locale" value={form.locale} onChange={update("locale")}>
          {LOCALES.map((locale) => (
            <option key={locale.value} value={locale.value}>{locale.label}</option>
          ))}
        </select>,
      )}
      {field(
        "timezone",
        "Fuseau horaire",
        <select id="profile-timezone" value={form.timezone} onChange={update("timezone")}>
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>{timezone.replace("_", " ")}</option>
          ))}
        </select>,
      )}
      {errors.form && <p className="hub-error" role="alert">{errors.form}</p>}
      {status === "saved" && <p className="hub-success" role="status">Profil enregistré. Les applications sont prévenues.</p>}
      <button className="hub-button primary" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
