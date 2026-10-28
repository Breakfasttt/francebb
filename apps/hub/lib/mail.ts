/**
 * Envoi des emails du hub (lien magique de connexion), par SMTP : même service et mêmes réglages que le site
 * (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM). Sans SMTP_HOST (développement), le lien est
 * seulement affiché dans la console.
 */
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

/** Envoie le lien magique. Renvoie false si l'envoi a échoué (le hub affiche alors une erreur au membre). */
export async function sendMagicLinkEmail(email: string, url: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[hub] SMTP non configuré : lien magique pour ${email} : ${url}`);
    return process.env.NODE_ENV !== "production";
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
