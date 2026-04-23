import nodemailer from "nodemailer";

/**
 * Configuration du transporteur Nodemailer
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true pour le port 465, false pour les autres
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
    <a href="${process.env.AUTH_URL}/profile?tab=pm" class="btn">Répondre sur le site</a>
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
    <a href="${process.env.AUTH_URL}/forum/topic/${topicId}" class="btn">Voir la discussion</a>
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
    <a href="${process.env.AUTH_URL}/forum/topic/${topicId}" class="btn">Consulter la réponse</a>
  `;
  return sendMail({
    to: toEmail,
    subject: `[BBFrance] Nouveau message dans "${topicTitle}"`,
    html: getEmailTemplate(content, title),
  });
}

/**
 * Template pour la newsletter hebdomadaire / dynamique
 */
export function getNewsletterTemplate(topics: any[], tournaments: any[]) {
  const topicsHtml = topics.map(t => `
    <div style="padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px;">
      <a href="${process.env.AUTH_URL}/forum/topic/${t.id}" style="color: #1d3557; font-weight: bold; text-decoration: none; font-size: 16px;">${t.title}</a><br/>
      <small style="color: #777;">${t.views} vues • Dans ${t.forum.name}</small>
    </div>
  `).join("");

  const tournamentsHtml = tournaments.map(t => `
    <div style="padding: 10px; background: #f1f3f5; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e63946;">
      <strong style="color: #1d3557;">${t.name}</strong><br/>
      <small style="color: #555;">📍 ${t.ville || t.location} • 📅 ${new Date(t.date).toLocaleDateString('fr-FR')}</small><br/>
      <a href="${process.env.AUTH_URL}/forum/topic/${t.topic?.id || ''}" style="color: #e63946; font-size: 12px; font-weight: bold; text-decoration: none;">Voir le détail →</a>
    </div>
  `).join("");

  const content = `
    <p>Bonjour Coach ! Voici les actualités qu'il ne fallait pas manquer sur BBFrance :</p>
    
    <h3 style="color: #1d3557; border-bottom: 2px solid #1d3557; padding-bottom: 5px; margin-top: 30px;">🔥 Les sujets populaires</h3>
    ${topicsHtml.length > 0 ? topicsHtml : "<p>Aucun sujet cette semaine.</p>"}

    <h3 style="color: #1d3557; border-bottom: 2px solid #1d3557; padding-bottom: 5px; margin-top: 30px;">🏆 Prochaines compétitions</h3>
    ${tournamentsHtml.length > 0 ? tournamentsHtml : "<p>Aucun tournoi prévu prochainement.</p>"}

    <div style="margin-top: 30px; text-align: center;">
      <a href="${process.env.AUTH_URL}" class="btn" style="background:#1d3557;">Retourner sur BBFrance</a>
    </div>
  `;

  return getEmailTemplate(content, "Gazette de BBFrance");
}
