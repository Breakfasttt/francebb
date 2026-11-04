/**
 * Script ponctuel (carte 159) : cherche dans la base les textes BBCode piégés par la faille d'injection de script
 * relevée par l'audit du 4 novembre 2026 (section 2.1), c'est-à-dire un attribut d'événement (onerror=, onmouseover=…)
 * ou une adresse javascript: glissés dans un texte affiché en BBCode.
 *
 * Textes examinés : messages du forum, signatures, messages privés (déchiffrés), descriptions de ligue, articles et
 * réglages du site (guide du débutant).
 *
 * Usage, dans apps/site :
 *   node --experimental-strip-types scripts/find-trapped-bbcode.mjs           liste seulement (aucune écriture)
 *   node --experimental-strip-types scripts/find-trapped-bbcode.mjs --apply   supprime les textes trouvés (décision du responsable)
 *
 * Script en .mjs lancé par Node directement : avec tsx, l'import du client Prisma tombe sur d'anciens fichiers .ts
 * générés pour SQLite, restés dans prisma/generated-client (comme scripts/baseline.mjs, on importe index.js).
 *
 * --apply : le message du forum est marqué supprimé et son texte effacé ; la signature et la description de ligue
 * sont vidées ; le message privé est supprimé ; l'article est masqué et son texte effacé. Les réglages du site ne sont
 * jamais modifiés (ils sont écrits par les administrateurs) : ils sont seulement signalés.
 * En production : seulement par le responsable ou avec son accord, après une branche Neon de sauvegarde (skill
 * database-ops). À supprimer du dépôt après usage.
 */
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

const APPLY = process.argv.includes("--apply");
/** Attribut d'événement HTML ou adresse javascript: écrits dans le texte. */
const TRAP = /\bon[a-z]{3,}\s*=|javascript\s*:/i;

/** @typedef {{ kind: string, id: string, excerpt: string }} Finding */

function excerpt(text) {
  const index = text.search(TRAP);
  return text.slice(Math.max(0, index - 60), index + 60).replace(/\s+/g, " ");
}

async function main() {
  // Imports après le chargement de l'environnement : la clé de chiffrement est lue à l'import de lib/crypto.
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../prisma/generated-client/index.js");
  const { decrypt } = await import("../lib/crypto.ts");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  /** @type {Finding[]} */
  const findings = [];

  const posts = await prisma.post.findMany({ where: { isDeleted: false }, select: { id: true, content: true } });
  for (const post of posts) if (TRAP.test(post.content)) findings.push({ kind: "message du forum", id: post.id, excerpt: excerpt(post.content) });

  const users = await prisma.user.findMany({ where: { signature: { not: null } }, select: { id: true, signature: true } });
  for (const user of users) if (user.signature && TRAP.test(user.signature)) findings.push({ kind: "signature", id: user.id, excerpt: excerpt(user.signature) });

  const messages = await prisma.privateMessage.findMany({ select: { id: true, content: true } });
  for (const message of messages) {
    const text = decrypt(message.content);
    if (TRAP.test(text)) findings.push({ kind: "message privé", id: message.id, excerpt: excerpt(text) });
  }

  const ligues = await prisma.ligue.findMany({ where: { description: { not: null } }, select: { id: true, description: true } });
  for (const ligue of ligues) if (ligue.description && TRAP.test(ligue.description)) findings.push({ kind: "description de ligue", id: ligue.id, excerpt: excerpt(ligue.description) });

  const articles = await prisma.article.findMany({ select: { id: true, content: true } });
  for (const article of articles) if (TRAP.test(article.content)) findings.push({ kind: "article", id: article.id, excerpt: excerpt(article.content) });

  const settings = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
  for (const setting of settings) if (TRAP.test(setting.value)) findings.push({ kind: "réglage du site (non modifié)", id: setting.key, excerpt: excerpt(setting.value) });

  console.log(`${findings.length} texte(s) suspect(s) :`);
  for (const finding of findings) console.log(`- ${finding.kind} ${finding.id} : …${finding.excerpt}…`);

  if (!APPLY) {
    if (findings.length) console.log("\nAucune modification faite. Relire la liste, puis relancer avec --apply pour supprimer.");
    await prisma.$disconnect();
    return;
  }

  for (const finding of findings) {
    if (finding.kind === "message du forum") await prisma.post.update({ where: { id: finding.id }, data: { isDeleted: true, content: "" } });
    else if (finding.kind === "signature") await prisma.user.update({ where: { id: finding.id }, data: { signature: null } });
    else if (finding.kind === "message privé") await prisma.privateMessage.delete({ where: { id: finding.id } });
    else if (finding.kind === "description de ligue") await prisma.ligue.update({ where: { id: finding.id }, data: { description: null } });
    else if (finding.kind === "article") await prisma.article.update({ where: { id: finding.id }, data: { isModerated: true, content: "" } });
  }
  console.log(`\nSuppression faite (${findings.filter((f) => !f.kind.startsWith("réglage")).length} texte(s)).`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
