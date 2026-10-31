/**
 * Envoi des emails du hub (lien magique de connexion, messages sur la suppression du compte), par SMTP : même service et mêmes réglages que le site
 * (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM). Sans SMTP_HOST (développement), le lien est
 * seulement affiché dans la console. Pour les tests automatiques (pnpm test:sso), HUB_DEV_MAIL_FILE indique en plus
 * un fichier où écrire le dernier lien, que le test ouvre ensuite comme le ferait le membre depuis sa boîte mail.
 */
import { writeFileSync } from "node:fs";
import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 465);

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
  : null;

/**
 * Envoie un message au sujet du compte (suppression demandée, rappel avant effacement : carte 123).
 * Sans SMTP en développement, le message est affiché dans la console. Renvoie false si l'envoi a échoué.
 */
export async function sendAccountEmail(email: string, subject: string, text: string): Promise<boolean> {
  if (!transporter) {
    if (process.env.NODE_ENV === "production") return false;
    console.log(`[hub] SMTP non configuré : message pour ${email} : ${subject}
${text}`);
    return true;
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || '"BBFrance" <noreply@bbfrance.fr>', to: email, subject, text });
    return true;
  } catch (error) {
    console.error("[hub] échec de l'envoi d'un message de compte :", error);
    return false;
  }
}

/** Envoie le lien magique. Renvoie false si l'envoi a échoué (le hub affiche alors une erreur au membre). */
export async function sendMagicLinkEmail(email: string, url: string): Promise<boolean> {
  if (!transporter) {
    if (process.env.NODE_ENV === "production") return false;
    console.log(`[hub] SMTP non configuré : lien magique pour ${email} : ${url}`);
    if (process.env.HUB_DEV_MAIL_FILE) writeFileSync(process.env.HUB_DEV_MAIL_FILE, JSON.stringify({ email, url }));
    return true;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BBFrance" <noreply@bbfrance.fr>',
      to: email,
      subject: "Ton lien de connexion BBFrance",
      text: `Bonjour,\n\nPour te connecter à BBFrance, ouvre ce lien (valable quelques minutes) :\n${url}\n\nSi tu n'as rien demandé, ignore ce message.`,
      html: `<p>Bonjour,</p><p>Pour te connecter à BBFrance, clique sur le lien ci-dessous (valable quelques minutes) :</p><p><a href="${url}">Se connecter à BBFrance</a></p><p>Si tu n'as rien demandé, ignore ce message.</p>`,
    });
    return true;
  } catch (error) {
    console.error("[hub] échec de l'envoi du lien magique :", error);
    return false;
  }
}
