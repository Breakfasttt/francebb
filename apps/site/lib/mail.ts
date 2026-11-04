import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { escapeHtml, escapeHtmlMultiline } from "./htmlEscape";
import { stripBBCode } from "./bbcode";

/**
 * Règle de ce fichier (carte 167) : toute valeur venue d'un membre ou de la base (titre de sujet, pseudo, extrait de
 * message, nom de forum, de tournoi ou de ville) passe par `escapeHtml` avant d'être insérée dans le HTML d'un e-mail.
 * Les identifiants placés dans une adresse passent par `encodeURIComponent`.
 */
export { escapeHtml };

/**
 * Configuration du transporteur Nodemailer
 */
/** Durée de conservation du journal des emails envoyés : 6 mois (registre RGPD, carte 126). */
const MAIL_LOG_RETENTION_MS = 183 * 24 * 60 * 60 * 1000;

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
 * Envoie un email stylisé. Ne lève jamais d'erreur : renvoie `{ success: false }` si l'envoi échoue. L'appelant doit
 * donc lire `success` pour savoir si l'e-mail est parti (une annonce à tous les membres compte ainsi ses échecs).
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

    // Logging de l'email en BDD pour le quota
    await prisma.mailLog.create({
      data: {
        to,
        subject,
        status: "SENT"
      }
    }).catch(e => console.error("Erreur log mail:", e));

    // Le journal des envois n'est gardé que 6 mois (registre RGPD, carte 126) : chaque envoi efface les entrées plus anciennes
    await prisma.mailLog.deleteMany({
      where: { sentAt: { lt: new Date(Date.now() - MAIL_LOG_RETENTION_MS) } }
    }).catch(e => console.error("Erreur purge journal mail:", e));

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur sendMail:", error);
    return { success: false, error };
  }
}

/**
 * Template de base pour les emails BBFrance. `content` est du HTML déjà prêt (les valeurs qu'il contient ont été
 * neutralisées par l'appelant) ; `title` est un simple texte, neutralisé ici.
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
            <h2 style="color: #1d3557; margin-top: 0;">${escapeHtml(title)}</h2>
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
export async function sendPmNotification(toEmail: string, senderName: string, messagePreview: string, conversationId?: string) {
  const title = "Nouveau Message Privé";
  const link = conversationId
    ? `${process.env.AUTH_URL}/messagerie?id=${encodeURIComponent(conversationId)}`
    : `${process.env.AUTH_URL}/messagerie`;

  const content = `
    <p>Bonjour,</p>
    <p><strong class="accent">${escapeHtml(senderName)}</strong> vous a envoyé un nouveau message privé sur BBFrance :</p>
    <div style="background: #f9f9f9; border-left: 4px solid #e63946; padding: 15px; margin: 20px 0; font-style: italic;">
      "${escapeHtml(messagePreview)}"
    </div>
    <a href="${link}" class="btn">Répondre sur le site</a>
  `;
  return sendMail({
    to: toEmail,
    subject: `[BBFrance] Nouveau message de ${senderName}`,
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
    <p>Un nouveau message a été posté par <strong class="accent">${escapeHtml(authorName)}</strong> dans un sujet que vous suivez :</p>
    <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${escapeHtml(topicTitle)}</p>
    <a href="${process.env.AUTH_URL}/forum/topic/${encodeURIComponent(topicId)}" class="btn">Consulter la réponse</a>
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
      <a href="${process.env.AUTH_URL}/forum/topic/${encodeURIComponent(t.id)}" style="color: #1d3557; font-weight: bold; text-decoration: none; font-size: 16px;">${escapeHtml(t.title)}</a><br/>
      <small style="color: #777;">${escapeHtml(t.views)} vues • Dans ${escapeHtml(t.forum.name)}</small>
    </div>
  `).join("");

  const tournamentsHtml = tournaments.map(t => `
    <div style="padding: 10px; background: #f1f3f5; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e63946;">
      <strong style="color: #1d3557;">${escapeHtml(t.name)}</strong><br/>
      <small style="color: #555;">📍 ${escapeHtml(t.ville || t.location)} • 📅 ${new Date(t.date).toLocaleDateString('fr-FR')}</small><br/>
      <a href="${process.env.AUTH_URL}/forum/topic/${encodeURIComponent(t.topic?.id || '')}" style="color: #e63946; font-size: 12px; font-weight: bold; text-decoration: none;">Voir le détail →</a>
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

/**
 * Corps d'une annonce de l'administration (carte 167) : le texte est écrit avec l'éditeur BBCode du site. Les balises
 * BBCode sont retirées (un e-mail ne sait pas afficher un spoiler ou une galerie), puis le texte est neutralisé ; ses
 * retours à la ligne sont gardés.
 */
export function getAnnouncementTemplate(text: string) {
  return getEmailTemplate(`<p>${escapeHtmlMultiline(stripBBCode(text))}</p>`, "Annonce Officielle BBFrance");
}
