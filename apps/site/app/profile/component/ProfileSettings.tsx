"use client";

/**
 * Onglet « Gérer mon compte » du profil (refonte, carte 092, ADR 0006), en blocs empilés :
 * - « Passeport Blood Bowl » (mode hub seulement, ADR-0007) : lien vers le passeport, où se gèrent l'identité commune
 *   aux applications, les appareils connectés et la suppression du compte ;
 * - « Moyens de connexion » : l'adresse email (lien magique), Discord et Google, avec « Associer » ou « Délier »
 *   (le dernier moyen de connexion ne peut pas être délié) ;
 * - « Notifications par email » : un interrupteur par type de courriel, enregistré à chaque changement ; en
 *   développement, l'envoi d'une newsletter de test ;
 * - « Zone de danger » : « Supprimer mon compte », avec deux confirmations (hors mode hub).
 * Les actions serveur sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Bell, CheckCircle2, KeyRound, Link as LinkIcon, Mail, ShieldAlert, Trash2, Unlink, XCircle } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, Label, Switch, toast } from "@bbfrance/ui";
import { deleteAccount, updateNotificationSettings, unlinkAccount, isEmailConfigured, getPassportUrl } from "../actions";

interface ProfileSettingsProps {
  user: {
    email?: string | null;
    accounts?: { provider: string }[];
    notifPm?: boolean;
    notifMention?: boolean;
    notifFollowedTopic?: boolean;
    notifNewsletter?: boolean;
  };
  onUpdate?: () => void;
}

type NotifKey = "notifPm" | "notifMention" | "notifFollowedTopic" | "notifNewsletter";

const NOTIFICATIONS: { id: NotifKey; label: string; desc: string }[] = [
  { id: "notifPm", label: "Messages privés", desc: "Un nouveau message dans votre messagerie." },
  { id: "notifMention", label: "Mentions", desc: "Quelqu'un vous cite dans un sujet." },
  { id: "notifFollowedTopic", label: "Sujets suivis", desc: "Un nouveau message dans un sujet que vous suivez." },
  { id: "notifNewsletter", label: "Newsletter et annonces", desc: "Les informations importantes sur le site." },
];

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [isDeleting, startDeletion] = useTransition();
  const [isSavingNotif, startSavingNotif] = useTransition();
  const [isUnlinking, startUnlinking] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [emailServiceActive, setEmailServiceActive] = useState(false);

  // Mode hub : adresse du passeport Blood Bowl (identité commune à toutes les applications), sinon null
  const [passportUrl, setPassportUrl] = useState<string | null>(null);

  useEffect(() => {
    isEmailConfigured().then(setEmailServiceActive);
    getPassportUrl().then(setPassportUrl);
  }, []);

  const [notifSettings, setNotifSettings] = useState<Record<NotifKey, boolean>>({
    notifPm: user.notifPm ?? true,
    notifMention: user.notifMention ?? true,
    notifFollowedTopic: user.notifFollowedTopic ?? true,
    notifNewsletter: user.notifNewsletter ?? true,
  });

  const handleUpdateNotif = (key: NotifKey, value: boolean) => {
    const previous = notifSettings;
    const newSettings = { ...notifSettings, [key]: value };
    setNotifSettings(newSettings);

    startSavingNotif(async () => {
      try {
        const result = await updateNotificationSettings(newSettings);
        if (result.success) toast.success("Préférences de notification mises à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
        setNotifSettings(previous);
      }
    });
  };

  const handleDeleteAccount = () => {
    startDeletion(async () => {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Compte supprimé avec succès. Vous allez être redirigé...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        toast.error("Erreur : " + result.error);
      }
    });
  };

  const accountCount = user.accounts?.length ?? 0;

  const handleUnlink = (provider: string) => {
    if (accountCount <= 1) {
      toast.error("Vous ne pouvez pas délier votre unique méthode de connexion.");
      return;
    }
    startUnlinking(async () => {
      try {
        const result = await unlinkAccount(provider);
        if (result.success) {
          toast.success(`Compte ${provider} délié avec succès.`);
          onUpdate?.();
        } else {
          toast.error(result.error || "Erreur lors du déliement.");
        }
      } catch {
        toast.error("Erreur technique lors du déliement.");
      }
    });
  };

  const handleLink = (provider: string) => {
    signIn(provider, { callbackUrl: window.location.href });
  };

  const providers = [
    { id: "discord", label: "Discord" },
    { id: "google", label: "Google" },
  ].map((p) => ({ ...p, linked: !!user.accounts?.some((a) => a.provider === p.id) }));

  const row = "flex min-h-16 flex-wrap items-center gap-3 border-b border-bb-border px-4 py-3 last:border-b-0";

  return (
    <div className="flex flex-col gap-4">
      {passportUrl && (
        <Card>
          <CardHeader>
            <KeyRound size={18} className="text-bb-text-muted" aria-hidden="true" />
            <CardTitle>Passeport Blood Bowl</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col items-start gap-3">
            <p className="m-0 text-[0.95rem] leading-relaxed text-bb-text-muted">
              Ton pseudo, ton avatar, ton numéro NAF et ta région sont communs à toutes les applications BBFrance. Les
              appareils connectés, le téléchargement de tes données et la suppression de ton compte se gèrent sur ton
              passeport.
            </p>
            <Button asChild variant="secondary" size="tap" className="w-full sm:w-auto">
              <a href={passportUrl}>Ouvrir mon passeport</a>
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Moyens de connexion */}
      <Card className="overflow-hidden">
        <CardHeader>
          <ShieldAlert size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Moyens de connexion</CardTitle>
        </CardHeader>
        <ul className="m-0 list-none p-0">
          <li className={row}>
            <Mail size={18} className="shrink-0 text-bb-text-muted" aria-hidden="true" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold text-bb-text-muted">Email (lien magique)</span>
              <span className="break-all text-bb-text">{user.email || "Non renseigné"}</span>
            </span>
            {emailServiceActive ? (
              <Badge variant="success"><CheckCircle2 size={12} aria-hidden="true" /> Service actif</Badge>
            ) : (
              <Badge variant="neutral"><XCircle size={12} aria-hidden="true" /> Non configuré</Badge>
            )}
          </li>
          {providers.map((p) => (
            <li key={p.id} className={row}>
              <KeyRound size={18} className="shrink-0 text-bb-text-muted" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold text-bb-text">{p.label}</span>
                <span className="text-sm text-bb-text-muted">{p.linked ? "Compte lié" : "Non lié"}</span>
              </span>
              {p.linked ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="tap"
                  aria-label={`Délier ${p.label}`}
                  disabled={isUnlinking || accountCount <= 1}
                  onClick={() => handleUnlink(p.id)}
                >
                  <Unlink size={16} aria-hidden="true" /> Délier
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="tap"
                  aria-label={`Associer ${p.label}`}
                  disabled={isUnlinking}
                  onClick={() => handleLink(p.id)}
                >
                  <LinkIcon size={16} aria-hidden="true" /> Associer
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* Notifications par email */}
      <Card className="overflow-hidden">
        <CardHeader>
          <Bell size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Notifications par email</CardTitle>
        </CardHeader>
        <ul className="m-0 list-none p-0">
          {NOTIFICATIONS.map((item) => (
            <li key={item.id} className={`${row} flex-nowrap`}>
              <span className="flex min-w-0 flex-1 flex-col">
                <Label htmlFor={`notif-${item.id}`} className="cursor-pointer text-[0.95rem]">{item.label}</Label>
                <span className="text-sm text-bb-text-muted">{item.desc}</span>
              </span>
              <Switch
                id={`notif-${item.id}`}
                checked={notifSettings[item.id]}
                onCheckedChange={(checked) => handleUpdateNotif(item.id, checked)}
                disabled={isSavingNotif}
              />
            </li>
          ))}
        </ul>
        {process.env.NODE_ENV === "development" && (
          <CardBody className="flex flex-col items-start gap-3 border-t border-dashed border-bb-border">
            <p className="m-0 text-sm text-bb-text-muted">
              <strong>Développement :</strong> envoie une newsletter fictive à votre adresse pour vérifier son rendu.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="tap"
              onClick={async () => {
                const { sendTestNewsletter } = await import("../actions");
                const res = await sendTestNewsletter();
                if (res.success) toast.success("Mail de test envoyé ! Vérifie Mailtrap.");
                else toast.error("Échec de l'envoi.");
              }}
            >
              <Mail size={16} aria-hidden="true" /> Envoyer une newsletter de test
            </Button>
          </CardBody>
        )}
      </Card>

      {/* Zone de danger */}
      <Card className="border-bb-danger-text">
        <CardHeader>
          <Trash2 size={18} className="text-bb-danger-text" aria-hidden="true" />
          <CardTitle className="text-bb-danger-text">Zone de danger</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <p className="m-0 font-bold text-bb-text">Suppression irréversible du compte</p>
            <p className="m-0 text-sm leading-relaxed text-bb-text-muted">
              Vos données personnelles (messages privés, suivis, réglages) sont supprimées. Vos messages publics restent,
              rattachés au compte « Coach Inconnu ».
            </p>
          </div>
          {passportUrl ? (
            // Mode hub : la suppression, avec ses 30 jours pour changer d'avis, se fait sur le passeport (carte 124)
            <Button asChild variant="secondary" size="tap" className="w-full shrink-0 lg:w-auto">
              <a href={passportUrl}>Supprimer mon compte depuis mon passeport</a>
            </Button>
          ) : (
            <Button type="button" variant="danger" size="tap" className="w-full shrink-0 lg:w-auto" disabled={isDeleting} onClick={() => setShowConfirmModal(true)}>
              <Trash2 size={18} aria-hidden="true" /> Supprimer mon compte
            </Button>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Supprimer mon compte (étape 1 sur 2)"
        message="Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et conforme à vos droits RGPD."
        confirmLabel="Continuer"
        danger
        onConfirm={() => {
          setShowConfirmModal(false);
          setShowFinalModal(true);
        }}
      />

      <ConfirmDialog
        open={showFinalModal}
        onOpenChange={setShowFinalModal}
        title="Supprimer mon compte (dernière étape)"
        message="Toutes vos données personnelles seront effacées. Êtes-vous certain de vouloir continuer ?"
        confirmLabel="Tout supprimer définitivement"
        danger
        pending={isDeleting}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
