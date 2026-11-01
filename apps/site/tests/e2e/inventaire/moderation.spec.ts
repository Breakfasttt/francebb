/**
 * Inventaire de la refonte, section 15 (modération `/moderation`) de docs/refonte/inventaire.md (carte 099). Rejoué
 * en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés par leur
 * rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification avant et
 * après la refonte de l'écran.
 *
 * Quelques petites fonctions cherchent un élément à deux endroits possibles, sans changer ce qui est attendu :
 * - `moderationTab` : les onglets sont dans la page, ou (avant la refonte, sur téléphone) dans le panneau « Plus » ;
 * - `entry` : une fiche (signalement, banni, ressource) est une ligne de tableau, un élément de liste ou un article ;
 * - `nextPage` : la flèche « page suivante » s'appelle « next » (ancienne pagination) ou « Page suivante ».
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Mod … » : un modérateur, un
 * administrateur (pour « Purger »), deux membres qui signalent un sujet, un membre banni, un sujet signalé deux fois,
 * deux ressources en attente et 25 lignes du journal (20 par page). Les lignes du journal sont datées du lendemain :
 * elles restent ainsi en tête du journal, devant les actions faites par les autres tests.
 *
 * Carte 144 : trois tests de plus, chacun avec ses propres données (nommées « Inv Mod … » elles aussi) : « Ignorer »
 * un signalement depuis le menu « ⋯ », l'ouverture du journal qui n'écrit plus de ligne de purge vide, et l'ordre
 * stable de la liste des bannis d'une page à l'autre (11 bannis datés du lendemain, à la même seconde).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test. La petite base locale coupe parfois une connexion pendant que le site garde la sienne :
 * on réessaie alors, 10 fois au plus (withTestDb ne réessaie que l'erreur « Server has closed the connection »).
 */
async function db<T>(run: Parameters<typeof withTestDb<T>>[0]): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await withTestDb(run);
    } catch (error) {
      const cut = error instanceof Error && /Connection terminated|ECONNRESET|ConnectionClosed/.test(error.message);
      if (!cut || attempt >= 10) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}


/** Attente d'une valeur lue dans la base : la petite base locale peut mettre plusieurs secondes à répondre. */
const expectPoll = <T>(read: () => Promise<T>) => expect.poll(read, { timeout: 30_000 });

const MODO = { id: "e2e_invmod_modo", name: "Inv Mod Modo" };
const ADMIN = { id: "e2e_invmod_admin", name: "Inv Mod Admin" };
const REPORTER_1 = { id: "e2e_invmod_rep1", name: "Inv Mod Rapporteur Un" };
const REPORTER_2 = { id: "e2e_invmod_rep2", name: "Inv Mod Rapporteur Deux" };
const BANNED = { id: "e2e_invmod_banned", name: "Inv Mod Banni", reason: "Inv Mod motif du bannissement" };
const TOPIC = { id: "e2e_invmod_topic", title: "Inv Mod Sujet signalé" };
const REASON = "Inv Mod raison du signalement";
const RESOURCE_A = { id: "e2e_invmod_res_a", title: "Inv Mod Ressource A" };
const RESOURCE_B = { id: "e2e_invmod_res_b", title: "Inv Mod Ressource B" };
const LOGS = 25;
const logDetail = (n: number) => `Inv Mod détail ${String(n).padStart(2, "0")}`;

const USER_IDS = [MODO.id, ADMIN.id, REPORTER_1.id, REPORTER_2.id, BANNED.id];

/** Sujet signalé puis ignoré (carte 144). */
const IGNORED_TOPIC = { id: "e2e_invmod_topic_ign", title: "Inv Mod Sujet à ignorer" };
const IGNORED_REASON = "Inv Mod raison d'un signalement abusif";

/** Lot de 11 bannis datés du lendemain à la même seconde : seul l'identifiant les départage (carte 144). */
const BANNED_LOT = Array.from({ length: 11 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `e2e_invmod_lot${n}`, name: `Inv Mod Banni Lot ${n}` };
});

async function cleanUp() {
  await db(async (prisma) => {
    const lotIds = BANNED_LOT.map((user) => user.id);
    await prisma.moderationReport.deleteMany({ where: { OR: [{ targetId: { in: [TOPIC.id, IGNORED_TOPIC.id] } }, { reporterId: { in: USER_IDS } }] } });
    await prisma.moderationLog.deleteMany({
      where: {
        OR: [
          { moderatorId: { in: USER_IDS } },
          { targetId: { in: [TOPIC.id, IGNORED_TOPIC.id, BANNED.id, RESOURCE_A.id, RESOURCE_B.id, ...lotIds] } },
        ],
      },
    });
    await prisma.resource.deleteMany({ where: { id: { in: [RESOURCE_A.id, RESOURCE_B.id] } } });
    await prisma.post.deleteMany({ where: { topicId: { in: [TOPIC.id, IGNORED_TOPIC.id] } } });
    await prisma.topic.deleteMany({ where: { id: { in: [TOPIC.id, IGNORED_TOPIC.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [...USER_IDS, ...lotIds] } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    // User.role est une clé étrangère vers RoleConfig : le rôle administrateur doit exister
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    const base = { hasFinishedOnboarding: true };
    await prisma.user.create({ data: { ...base, id: MODO.id, name: MODO.name, email: "invmod-modo@e2e.test", role: "MODERATOR" } });
    await prisma.user.create({ data: { ...base, id: ADMIN.id, name: ADMIN.name, email: "invmod-admin@e2e.test", role: "ADMIN" } });
    await prisma.user.create({ data: { ...base, id: REPORTER_1.id, name: REPORTER_1.name, email: "invmod-rep1@e2e.test" } });
    await prisma.user.create({ data: { ...base, id: REPORTER_2.id, name: REPORTER_2.name, email: "invmod-rep2@e2e.test" } });
    await prisma.user.create({
      data: { ...base, id: BANNED.id, name: BANNED.name, email: "invmod-banned@e2e.test", isBanned: true, banReason: BANNED.reason },
    });
    await prisma.moderationLog.create({ data: { action: "USER_BANNED", moderatorId: MODO.id, targetId: BANNED.id, targetType: "USER" } });

    await prisma.topic.create({
      data: {
        id: TOPIC.id, title: TOPIC.title, forumId: E2E.forumId, authorId: REPORTER_1.id,
        posts: { create: { content: "Message du sujet signalé", authorId: REPORTER_1.id } },
      },
    });
    await prisma.moderationReport.create({
      data: { reason: REASON, details: "Inv Mod précision une", reporterId: REPORTER_1.id, targetId: TOPIC.id, targetType: "TOPIC" },
    });
    await prisma.moderationReport.create({
      data: { reason: REASON, details: "Inv Mod précision deux", reporterId: REPORTER_2.id, targetId: TOPIC.id, targetType: "TOPIC" },
    });

    for (const res of [RESOURCE_A, RESOURCE_B]) {
      await prisma.resource.create({
        data: { id: res.id, title: res.title, description: "Inv Mod description", link: "https://example.com/inv-mod", authorId: REPORTER_1.id },
      });
    }

    // Journal : 25 lignes datées du lendemain (minute par minute, la n° 1 est la plus récente)
    const tomorrow = Date.now() + 24 * 3600 * 1000;
    for (let n = 1; n <= LOGS; n++) {
      await prisma.moderationLog.create({
        data: {
          action: "TOPIC_LOCKED", details: logDetail(n), moderatorId: MODO.id, targetId: TOPIC.id, targetType: "TOPIC",
          createdAt: new Date(tomorrow - n * 60_000),
        },
      });
    }
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// La pastille des outils de développement de Next.js (`nextjs-portal`) est masquée : elle n'existe pas sur le site en
// ligne, et sur téléphone elle intercepterait les appuis sur les boutons placés en bas à gauche.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

const TABS = {
  logs: /^Journal d'audit/,
  users: /^Utilisateurs/,
  reports_post: /^Messages signalés/,
  reports_topic: /^Sujets signalés/,
  reports_user: /^Coachs signalés/,
  reports_article: /^Articles signalés/,
  reports_ligue: /^Ligues signalées/,
  reports_user_banned: /^Coachs bannis/,
  resources_validation: /^(Validation|Ressources)/i,
} as const;

/**
 * Onglet de la modération : un lien ou un bouton de la page ; avant la refonte, sur téléphone, un bouton du panneau
 * « Plus ». Renvoie l'onglet visible (le panneau est ouvert s'il le faut).
 */
async function moderationTab(page: Page, name: RegExp): Promise<Locator> {
  const inMain = page.getByRole("main").first().getByRole("link", { name }).or(page.getByRole("main").first().getByRole("button", { name }))
    .filter({ visible: true });
  if ((await inMain.count()) > 0) return inMain.first();
  await page.getByRole("button", { name: "Plus", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Plus" });
  await expect(panel).toBeVisible();
  return panel.getByRole("button", { name }).first();
}

/** Fiche d'un signalement, d'un banni ou d'une ressource : ligne de tableau, élément de liste ou article. */
const entry = (page: Page, text: string) =>
  page.getByRole("row").or(page.getByRole("listitem")).or(page.getByRole("article")).filter({ hasText: text }).filter({ visible: true }).first();

/** Flèche « page suivante » de la pagination (ancienne ou nouvelle). */
const nextPage = (page: Page) =>
  page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first().getByRole("button", { name: /^(next|Page suivante)$/ });

/** Bouton d'une fiche, sinon entrée de son menu « ⋯ ». */
async function entryAction(page: Page, card: Locator, name: RegExp) {
  const direct = card.getByRole("button", { name }).or(card.getByRole("link", { name })).filter({ visible: true });
  if ((await direct.count()) > 0) {
    await direct.first().click();
    return;
  }
  await card.getByRole("button", { name: /Plus d'actions|Actions/ }).click();
  await page.getByRole("menuitem", { name }).or(page.getByRole("dialog").getByRole("button", { name })).first().click();
}

test("accès : un visiteur est envoyé vers la connexion, un coach est renvoyé", async ({ page }) => {
  await page.goto("/moderation");
  await page.waitForURL(/\/auth\/login/);

  await loginAs(page, REPORTER_1.id);
  await page.goto("/moderation");
  await expect(page).not.toHaveURL(/\/moderation/);
});

test("onglets gardés dans l'adresse, avec leurs pastilles de compteur ; « Utilisateurs » mène à /membres", async ({ page }) => {
  const pendingTopics = await db((prisma) => prisma.moderationReport.count({ where: { status: "PENDING", targetType: "TOPIC" } }));
  const pendingResources = await db((prisma) => prisma.resource.count({ where: { status: "PENDING" } }));
  await loginAs(page, MODO.id);
  await page.goto("/moderation", { waitUntil: "networkidle" });

  // Les neuf onglets
  for (const name of Object.values(TABS)) {
    const tab = await moderationTab(page, name);
    await expect(tab).toBeVisible();
    if (await page.getByRole("dialog", { name: "Plus" }).isVisible()) await page.keyboard.press("Escape");
  }

  // Pastilles : nombre de signalements de sujets et de ressources en attente (au-delà de 9, « 9+ » est permis)
  const badge = (n: number) => new RegExp(n > 9 ? `(${n}|9\\+)\\s*$` : `${n}\\s*$`);
  await expect(await moderationTab(page, TABS.reports_topic)).toHaveText(badge(pendingTopics));
  if (await page.getByRole("dialog", { name: "Plus" }).isVisible()) await page.keyboard.press("Escape");
  await expect(await moderationTab(page, TABS.resources_validation)).toHaveText(badge(pendingResources));
  if (await page.getByRole("dialog", { name: "Plus" }).isVisible()) await page.keyboard.press("Escape");

  // L'onglet choisi est écrit dans l'adresse
  await (await moderationTab(page, TABS.reports_user_banned)).click();
  await expect(page).toHaveURL(/[?&]tab=reports_user_banned/);
  if (await page.getByRole("dialog", { name: "Plus" }).isVisible()) await page.keyboard.press("Escape");

  // L'adresse ouvre directement un onglet
  await page.goto("/moderation?tab=resources_validation", { waitUntil: "networkidle" });
  await expect(entry(page, RESOURCE_A.title)).toBeVisible();

  // « Utilisateurs » renvoie vers l'annuaire des membres
  await (await moderationTab(page, TABS.users)).click();
  await page.waitForURL(/\/membres/);
});

test("journal : détails, lien vers le profil du modérateur, pagination, « Purger » réservé aux administrateurs", async ({ page }) => {
  await loginAs(page, MODO.id);
  await page.goto("/moderation?tab=logs", { waitUntil: "networkidle" });
  const main = page.getByRole("main").first();

  await expect(main.getByText(logDetail(1), { exact: true })).toBeVisible();
  await expect(main.getByText(logDetail(20), { exact: true })).toBeVisible();
  await expect(main.getByText(logDetail(21), { exact: true })).toHaveCount(0);
  const modoLink = main.getByRole("link", { name: MODO.name }).first();
  await expect(modoLink).toHaveAttribute("href", `/spy/${MODO.id}`);
  // Un modérateur ne peut pas purger le journal
  await expect(main.getByRole("button", { name: /Purger/ })).toHaveCount(0);

  // Page suivante : les lignes 21 à 25
  await nextPage(page).click();
  await expect(main.getByText(logDetail(21), { exact: true })).toBeVisible();
  await expect(main.getByText(logDetail(1), { exact: true })).toHaveCount(0);

  // Un administrateur voit « Purger » : la fenêtre de confirmation s'ouvre, on annule
  await page.context().clearCookies();
  await loginAs(page, ADMIN.id);
  await page.goto("/moderation?tab=logs", { waitUntil: "networkidle" });
  await main.getByRole("button", { name: /Purger/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: /Purger/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Annuler" }).click();
  await expect(dialog).toBeHidden();
});

test("signalements regroupés par contenu : détails de chaque signalement, puis « Traité » avec un commentaire", async ({ page }) => {
  await loginAs(page, MODO.id);
  await page.goto("/moderation?tab=reports_topic", { waitUntil: "networkidle" });

  const card = entry(page, REASON);
  await expect(card).toBeVisible();
  await expect(card).toContainText(/2 signalements/i);
  await expect(card.getByRole("link", { name: /^Voir/ })).toHaveAttribute("href", `/forum/topic/${TOPIC.id}`);

  // Détails : un signalement à la fois, avec son auteur et sa précision
  await card.getByRole("button", { name: /Détails/ }).click();
  await expect(card).toContainText(REPORTER_1.name);
  await expect(card).toContainText("Inv Mod précision une");
  await card.getByRole("button", { name: "Signalement suivant" }).click();
  await expect(card).toContainText(REPORTER_2.name);
  await expect(card).toContainText("Inv Mod précision deux");

  // Marquer comme traité, avec un commentaire
  await entryAction(page, card, /traité/i);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: /Détails de l'action/ }).fill("Inv Mod commentaire du modérateur");
  await dialog.getByRole("button", { name: /^(Confirmer|Marquer comme traité)$/ }).click();
  await expect(page.getByText("Signalement marqué comme traité")).toBeVisible();
  await expect(entry(page, REASON)).toHaveCount(0);

  await db(async (prisma) => {
    const pending = await prisma.moderationReport.count({ where: { targetId: TOPIC.id, status: "PENDING" } });
    expect(pending).toBe(0);
    const log = await prisma.moderationLog.findFirst({ where: { action: "REPORT_RESOLVED", targetId: TOPIC.id, moderatorId: MODO.id } });
    expect(log?.details).toBe("Inv Mod commentaire du modérateur");
  });
});

test("bannis : la fiche donne le motif et l'auteur du bannissement, puis « Débannir »", async ({ page }) => {
  await loginAs(page, MODO.id);
  await page.goto("/moderation?tab=reports_user_banned", { waitUntil: "networkidle" });

  // La liste est paginée par 10 : on avance jusqu'à trouver le membre
  const unban = page.getByRole("button", { name: "Débannir" }).filter({ visible: true }).first();
  await expect(unban).toBeVisible();
  for (let tries = 0; tries < 5 && (await entry(page, BANNED.name).count()) === 0; tries++) {
    const firstEntry = page.getByRole("row").or(page.getByRole("listitem")).or(page.getByRole("article"))
      .filter({ has: page.getByRole("button", { name: "Débannir" }) }).filter({ visible: true }).first();
    const shown = await firstEntry.textContent();
    await nextPage(page).click();
    await expect(firstEntry).not.toHaveText(shown ?? "");
  }
  const card = entry(page, BANNED.name);
  await expect(card).toContainText(BANNED.reason);
  await expect(card).toContainText(MODO.name);

  await card.getByRole("button", { name: "Débannir" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Débannir" }).click();
  await expect(page.getByText("Utilisateur débanni")).toBeVisible();
  await expectPoll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: BANNED.id } }))?.isBanned)).toBe(false);
});

test("ressources : « Éditer », « Approuver » et « Refuser » une ressource proposée", async ({ page }) => {
  await loginAs(page, MODO.id);
  await page.goto("/moderation?tab=resources_validation", { waitUntil: "networkidle" });

  const cardA = entry(page, RESOURCE_A.title);
  await expect(cardA).toBeVisible();
  await expect(cardA.getByRole("link", { name: "Éditer" })).toHaveAttribute("href", `/ressources/edit/${RESOURCE_A.id}`);
  await cardA.getByRole("button", { name: "Approuver" }).click();
  await expect(page.getByText("Ressource approuvée")).toBeVisible();

  const cardB = entry(page, RESOURCE_B.title);
  await cardB.getByRole("button", { name: "Refuser" }).click();
  await expect(page.getByText("Ressource rejetée")).toBeVisible();
  await expect(entry(page, RESOURCE_B.title)).toHaveCount(0);

  await db(async (prisma) => {
    expect((await prisma.resource.findUnique({ where: { id: RESOURCE_A.id } }))?.status).toBe("APPROVED");
    expect((await prisma.resource.findUnique({ where: { id: RESOURCE_B.id } }))?.status).toBe("REJECTED");
  });
});

test("« Ignorer » un signalement depuis le menu « ⋯ » : il est classé comme ignoré et inscrit au journal (carte 144)", async ({ page }) => {
  // Données propres à ce test, recréées à chaque lancement (ordinateur puis téléphone)
  await db(async (prisma) => {
    await prisma.moderationReport.deleteMany({ where: { targetId: IGNORED_TOPIC.id } });
    await prisma.moderationLog.deleteMany({ where: { targetId: IGNORED_TOPIC.id } });
    await prisma.topic.upsert({
      where: { id: IGNORED_TOPIC.id },
      update: {},
      create: { id: IGNORED_TOPIC.id, title: IGNORED_TOPIC.title, forumId: E2E.forumId, authorId: REPORTER_1.id },
    });
    await prisma.moderationReport.create({ data: { reason: IGNORED_REASON, reporterId: REPORTER_2.id, targetId: IGNORED_TOPIC.id, targetType: "TOPIC" } });
  });

  await loginAs(page, MODO.id);
  await page.goto("/moderation?tab=reports_topic", { waitUntil: "networkidle" });
  const card = entry(page, IGNORED_REASON);
  await expect(card).toBeVisible();

  await entryAction(page, card, /^Ignorer/);
  const dialog = page.getByRole("dialog", { name: "Ignorer le signalement" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: /Détails de l'action/ }).fill("Inv Mod signalement sans fondement");
  await dialog.getByRole("button", { name: "Ignorer", exact: true }).click();
  await expect(page.getByText("Signalement ignoré", { exact: true }).first()).toBeVisible();
  await expect(entry(page, IGNORED_REASON)).toHaveCount(0);

  await db(async (prisma) => {
    const reports = await prisma.moderationReport.findMany({ where: { targetId: IGNORED_TOPIC.id } });
    expect(reports.map((report) => report.status)).toEqual(["IGNORED"]);
    const log = await prisma.moderationLog.findFirst({ where: { action: "REPORT_IGNORED", targetId: IGNORED_TOPIC.id, moderatorId: MODO.id } });
    expect(log?.details).toBe("Inv Mod signalement sans fondement");
  });
});

test("journal : l'ouvrir n'écrit pas de ligne « Nettoyage automatique » quand rien n'a été supprimé (carte 144)", async ({ page }) => {
  const emptyPurges = () =>
    db((prisma) => prisma.moderationLog.count({ where: { moderatorId: ADMIN.id, details: { contains: "(0 entrées supprimées)" } } }));
  const before = await emptyPurges();

  await loginAs(page, ADMIN.id);
  await page.goto("/moderation?tab=logs", { waitUntil: "networkidle" });
  await expect(page.getByRole("main").first().getByText(logDetail(1), { exact: true })).toBeVisible();
  // La purge est lancée sans être attendue par la page : on lui laisse le temps de finir avant de compter
  await page.waitForTimeout(2000);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  expect(await emptyPurges()).toBe(before);
});

test("bannis : l'ordre reste le même d'une page à l'autre, chaque banni n'apparaît qu'une fois (carte 144)", async ({ page }) => {
  // 11 bannis à la même date (le lendemain, pour passer devant les autres) : seul l'identifiant fixe leur ordre
  const banDate = new Date(Date.now() + 24 * 3600 * 1000);
  banDate.setMilliseconds(0);
  const lotIds = BANNED_LOT.map((user) => user.id);
  await db(async (prisma) => {
    await prisma.moderationLog.deleteMany({ where: { targetId: { in: lotIds } } });
    await prisma.user.deleteMany({ where: { id: { in: lotIds } } });
    for (const user of BANNED_LOT) {
      await prisma.user.create({
        data: { id: user.id, name: user.name, email: `${user.id}@e2e.test`, hasFinishedOnboarding: true, isBanned: true, banReason: "Inv Mod lot" },
      });
      await prisma.moderationLog.create({ data: { action: "USER_BANNED", moderatorId: MODO.id, targetId: user.id, targetType: "USER", createdAt: banDate } });
    }
  });

  try {
    await loginAs(page, MODO.id);
    const list = page.getByRole("list", { name: "Coachs bannis" });
    /** Noms du lot affichés sur la page en cours, dans l'ordre de la liste. */
    const shownLot = async () => {
      const texts = await list.getByRole("listitem").allTextContents();
      return texts.flatMap((text) => BANNED_LOT.filter((user) => text.includes(user.name)).map((user) => user.name));
    };

    for (let round = 0; round < 2; round++) {
      await page.goto("/moderation?tab=reports_user_banned", { waitUntil: "networkidle" });
      await expect(list.getByText(BANNED_LOT[0].name, { exact: true })).toBeVisible();
      // Page 1 : les 10 premiers du lot, dans l'ordre de leur identifiant
      await expect.poll(shownLot).toEqual(BANNED_LOT.slice(0, 10).map((user) => user.name));
      // Page 2 : le onzième, et lui seul
      await nextPage(page).click();
      await expect(list.getByText(BANNED_LOT[10].name, { exact: true })).toBeVisible();
      await expect.poll(shownLot).toEqual([BANNED_LOT[10].name]);
    }
  } finally {
    await db(async (prisma) => {
      await prisma.moderationLog.deleteMany({ where: { targetId: { in: lotIds } } });
      await prisma.user.deleteMany({ where: { id: { in: lotIds } } });
    });
  }
});
