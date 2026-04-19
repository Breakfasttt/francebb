import nodemailer from "nodemailer";

/**
 * Configuration du transporteur Nodemailer
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email stylisé
 */
export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BBFrance" <noreply@bbfrance.fr>',
      to,
      subject,
      text: text || "Veuillez ouvrir cet email dans un client supportant le HTML.",
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur sendMail:", error);
    return { success: false, error };
  }
}

/**
 * Template de base pour les emails BBFrance
 */
export function getEmailTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; }
          .header { background: linear-gradient(135deg, #1d3557 0%, #457b9d 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; color: #777; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #eee; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #e63946; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .accent { color: #e63946; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BBFrance</h1>
          </div>
          <div class="content">
            <h2 style="color: #1d3557; margin-top: 0;">${title}</h2>
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BBFrance - Le portail du Blood Bowl en France</p>
            <p>Vous recevez cet email car vous êtes inscrit sur BBFrance. Vous pouvez gérer vos préférences de notification dans votre profil.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Envoie un email de notification pour un MP
 */
export async function sendPmNotification(toEmail: string, senderName: string, messagePreview: string) {
  const title = "Nouveau Message Privé";
  const content = `
    <p>Bonjour,</p>
    <p><strong class="accent">${senderName}</strong> vous a envoyé un nouveau message privé sur BBFrance :</p>
    <div style="background: #f9f9f9; border-left: 4px solid #e63946; padding: 15px; margin: 20px 0; font-style: italic;">
      "${messagePreview}"
    </div>
    <a href="${process.env.NEXTAUTH_URL}/profile?tab=pm" class="btn">Répondre sur le site</a>
  `;
  return sendMail({
    to: toEmail,
    subject: `[BBFrance] Nouveau message de ${senderName}`,
    html: getEmailTemplate(content, title),
  });
}

/**
 * Envoie un email de notification pour une mention
 */
export async function sendMentionNotification(toEmail: string, authorName: string, topicTitle: string, topicId: string) {
  const title = "Vous avez été mentionné !";
  const content = `
    <p>Bonjour,</p>
    <p><strong class="accent">${authorName}</strong> vous a mentionné dans une discussion sur le forum :</p>
    <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">Sujet : ${topicTitle}</p>
    <a href="${process.env.NEXTAUTH_URL}/forum/topic/${topicId}" class="btn">Voir la discussion</a>
  `;
  return sendMail({
    to: toEmail,
    subject: `[BBFrance] ${authorName} vous a mentionné dans "${topicTitle}"`,
    html: getEmailTemplate(content, title),
  });
}

/**
 * Envoie un email de notification pour une réponse à un sujet suivi
 */
export async function sendFollowNotification(toEmail: string, authorName: string, topicTitle: string, topicId: string) {
  const title = "Nouvelle réponse";
  const content = `
    <p>Bonjour,</p>
    <p>Un nouveau message a été posté par <strong class="accent">${authorName}</strong> dans un sujet que vous suivez :</p>
    <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${topicTitle}</p>
    <a href="${process.env.NEXTAUTH_URL}/forum/topic/${topicId}" class="btn">Consulter la réponse</a>
  `;
  return sendMail({
    to: toEmail,
    subject: `[BBFrance] Nouveau message dans "${topicTitle}"`,
    html: getEmailTemplate(content, title),
  });
}
