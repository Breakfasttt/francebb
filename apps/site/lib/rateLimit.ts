/**
 * Limite d'actions par minute (carte 224). Le site tourne sans serveur permanent (Vercel) : un compteur en mémoire ne
 * suffirait pas, le compte est donc tenu dans la table `ActionCounter`, une ligne par membre, par action et par minute,
 * incrémentée en une seule requête. La modération n'est pas limitée.
 * Fichier serveur, volontairement sans « use server » : seules les actions serveur l'appellent.
 */
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { isOverRateLimit, RATE_LIMIT_MESSAGE, rateWindowStart, type RateLimitedAction } from "@/lib/rateLimitRules";

/** Les compteurs plus vieux que cela ne servent plus : ils sont effacés au passage. */
const COUNTER_RETENTION_MS = 10 * 60 * 1000;

/**
 * Compte une action du membre et renvoie le message à afficher s'il a dépassé sa limite pour la minute en cours, ou
 * `null` s'il peut continuer. À appeler après les contrôles de droits et avant d'écrire quoi que ce soit.
 */
export async function rateLimitRefusal(userId: string, role: string | null | undefined, action: RateLimitedAction, now = new Date()): Promise<string | null> {
  if (isModerator(role)) return null;
  const windowStart = rateWindowStart(now);
  const counter = await prisma.actionCounter.upsert({
    where: { userId_action_windowStart: { userId, action, windowStart } },
    create: { userId, action, windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });
  // Ménage des vieilles minutes de ce membre (rapide : clé primaire)
  if (counter.count === 1) {
    await prisma.actionCounter.deleteMany({ where: { userId, windowStart: { lt: new Date(now.getTime() - COUNTER_RETENTION_MS) } } });
  }
  return isOverRateLimit(action, counter.count) ? RATE_LIMIT_MESSAGE : null;
}
