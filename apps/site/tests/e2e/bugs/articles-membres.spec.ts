/**
 * Corrections des bugs relevés pendant la refonte, lot « articles, membres, pages fixes, inscription » :
 * - carte 132 : sur `/jouer`, le lien « Prochaine étape » vise la section affichée suivante et n'apparaît pas sur la
 *   dernière section affichée ; sur `/statistiques`, la taille de la base s'écrit avec une virgule (« 9,50 Mo ») ;
 * - carte 133 : un nouveau membre envoyé vers l'inscription (onboarding) revient, à la fin, sur la page qu'il voulait
 *   ouvrir, et jamais sur une adresse extérieure au site ;
 * - carte 135 : l'annuaire `/membres` n'envoie au navigateur que les champs qu'il affiche, et son filtre « Rôle »
 *   propose les rôles personnalisés de la table RoleConfig ;
 * - carte 139 : un article modéré n'apparaît dans `/articles` que pour un modérateur, avec la mention « Modéré » ;
 * - carte 140 : modifier un article garde sa ligue, que la page de l'article affiche ; un schéma BBScheme inséré dans
 *   un article est animé par le lecteur ; la fenêtre de modération d'un article parle d'« article ».
 *
 * Ce fichier n'est rejoué que dans le projet « chromium » (taille ordinateur) de playwright.config.ts. Les
 * vérifications en taille téléphone sont dans le dernier groupe de tests, qui règle lui-même la taille de l'écran.
 * Les éléments sont cherchés par leur rôle et leur nom accessible.
 *
 * Données préparées par le test et supprimées à la fin, toutes nommées « Inv Bam … » (identifiants « e2e_bam_… ») :
 * membres, rôle personnalisé, ligue, articles. Les réglages du guide `/jouer` modifiés par le test sont remis à leur
 * valeur d'avant.
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test. La petite base locale coupe parfois une connexion pendant que le site garde la sienne
 * (« Connection terminated unexpectedly ») : on réessaie alors, 10 fois au plus.
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

const COACH = { id: "e2e_bam_coach", name: "Coach Bam Inv" };
const ADMIN = { id: "e2e_bam_admin", name: "Admin Bam Inv" };
const NEWBIE = { id: "e2e_bam_nouveau", name: null };
const NEWBIE_EVIL = { id: "e2e_bam_nouveau_2", name: null };
const CUSTOM_ROLE = { name: "E2E_BAM_ROLE", label: "Rôle Inv Bam", power: 15 };
/** Membre de l'annuaire dont la fiche contient des champs que l'annuaire n'affiche pas (carte 135). */
const SECRETIVE = {
  id: "e2e_bam_discret",
  name: "Discret Bam Inv",
  role: CUSTOM_ROLE.name,
  signature: "SIGNATURE_SECRETE_BAM",
  equipe: "EQUIPE_SECRETE_BAM",
  ligueCustom: "LIGUE_PERSO_SECRETE_BAM",
  forumactifName: "FORUMACTIF_SECRET_BAM",
  legacyId: "LEGACY_SECRET_BAM",
  banReason: "RAISON_SECRETE_BAM",
};
const SECRET_MARKERS = [
  SECRETIVE.signature, SECRETIVE.equipe, SECRETIVE.ligueCustom, SECRETIVE.forumactifName, SECRETIVE.legacyId,
  SECRETIVE.banReason, "secret-bam@e2e.test", "notifNewsletter",
];
const USERS = [COACH, ADMIN, NEWBIE, NEWBIE_EVIL, SECRETIVE];

const LIGUE = { id: "e2e_bam_ligue", name: "Inv Bam Ligue", acronym: "IBL" };
const VISIBLE_ARTICLE = { id: "e2e_bam_art_visible", title: "Inv Bam Article visible", content: "Texte de l'article visible." };
const MODERATED_ARTICLE = { id: "e2e_bam_art_modere", title: "Inv Bam Article modéré", content: "Texte de l'article modéré." };
const LIGUE_ARTICLE = { id: "e2e_bam_art_ligue", title: "Inv Bam Article de ligue", content: "Texte de l'article de ligue." };
const SCHEME_ARTICLE = {
  id: "e2e_bam_art_schema", title: "Inv Bam Article à schéma",
  content: `Voici un schéma : [bbscheme]${E2E.bbschemeBoardId}[/bbscheme]`,
};
const ARTICLES = [VISIBLE_ARTICLE, MODERATED_ARTICLE, LIGUE_ARTICLE, SCHEME_ARTICLE];

/** Réglages du guide `/jouer` : les sections 3 et 6 sont vides, donc masquées. */
const HOW_TO_PLAY: Record<string, string | null> = {
  how_to_play_what_is_bb: "Texte Inv Bam de la section 1",
  how_to_play_platforms: "Texte Inv Bam de la section 2",
  how_to_play_community: null,
  how_to_play_tournaments: "Texte Inv Bam de la section 4",
  how_to_play_naf_cdf_rtc: "Texte Inv Bam de la section 5",
  how_to_play_challenges: null,
};
const previousSettings = new Map<string, string | null>();

/** Supprime tout ce que ce fichier a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const ids = ARTICLES.map((article) => article.id);
    await prisma.moderationLog.deleteMany({ where: { targetId: { in: ids } } });
    await prisma.articleReaction.deleteMany({ where: { articleId: { in: ids } } });
    await prisma.article.deleteMany({ where: { id: { in: ids } } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE.id } });
    await prisma.user.deleteMany({ where: { id: { in: USERS.map((user) => user.id) } } });
    await prisma.roleConfig.deleteMany({ where: { name: CUSTOM_ROLE.name } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    await prisma.roleConfig.create({ data: CUSTOM_ROLE });
    // Rôle de base, déjà présent en temps normal : créé seulement s'il manque (jamais supprimé par ce test)
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    await prisma.user.create({ data: { ...COACH, email: "coach-bam@e2e.test", hasFinishedOnboarding: true } });
    await prisma.user.create({ data: { ...ADMIN, email: "admin-bam@e2e.test", role: "ADMIN", hasFinishedOnboarding: true } });
    await prisma.user.create({ data: { ...NEWBIE, email: "nouveau-bam@e2e.test", hasFinishedOnboarding: false } });
    await prisma.user.create({ data: { ...NEWBIE_EVIL, email: "nouveau-bam-2@e2e.test", hasFinishedOnboarding: false } });
    await prisma.user.create({ data: { ...SECRETIVE, email: "secret-bam@e2e.test", hasFinishedOnboarding: true } });
    await prisma.ligue.create({ data: { ...LIGUE, geographicalZone: "R2-NO", creatorId: COACH.id } });
    await prisma.article.create({ data: { ...VISIBLE_ARTICLE, authorId: SECRETIVE.id } });
    await prisma.article.create({
      data: { ...MODERATED_ARTICLE, authorId: SECRETIVE.id, isModerated: true, moderationReason: "Raison Inv Bam", moderatedBy: E2E.modoId },
    });
    await prisma.article.create({ data: { ...LIGUE_ARTICLE, authorId: COACH.id, ligueId: LIGUE.id } });
    await prisma.article.create({ data: { ...SCHEME_ARTICLE, authorId: COACH.id } });

    for (const [key, value] of Object.entries(HOW_TO_PLAY)) {
      const existing = await prisma.siteSetting.findUnique({ where: { key } });
      previousSettings.set(key, existing?.value ?? null);
      if (value === null) await prisma.siteSetting.deleteMany({ where: { key } });
      else await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  });
});

test.afterAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    for (const [key, value] of previousSettings) {
      if (value === null) await prisma.siteSetting.deleteMany({ where: { key } });
      else await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  });
});

// Bandeau des cookies masqué (sur téléphone, il couvre le bas de l'écran), ainsi que la pastille des outils de
// développement de Next.js, qui n'existe pas sur le site en ligne.
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

/** Déconnexion : le cookie de session est effacé. */
async function logout(page: Page) {
  await page.context().clearCookies();
}

/** La page ne défile pas horizontalement. */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

/** Ouvre le menu « Actions de l'article » et choisit une action (liste déroulante sur ordinateur, panneau sur téléphone). */
async function chooseArticleAction(page: Page, name: string) {
  await page.getByRole("button", { name: "Actions de l'article" }).click();
  await page.getByRole("menuitem", { name }).or(page.getByRole("button", { name, exact: true })).first().click();
}

test.describe("carte 132 : pages fixes", () => {
  test("/jouer : « Prochaine étape » vise la section affichée suivante, et manque sur la dernière", async ({ page }) => {
    await page.goto("/jouer", { waitUntil: "networkidle" });
    // Sections 3 et 6 vides : masquées
    await expect(page.getByRole("heading", { name: "Communauté & Ligues" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Challenges Régionaux" })).toHaveCount(0);

    const next = page.getByRole("link", { name: /Prochaine étape/ });
    // Quatre sections affichées : trois liens, le dernier vers la section 5, aucun sur la section 5
    await expect(next).toHaveCount(3);
    const targets = await next.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(targets).toEqual(["#how_to_play_platforms", "#how_to_play_tournaments", "#how_to_play_naf_cdf_rtc"]);
    await expect(page.locator("#how_to_play_naf_cdf_rtc").getByRole("link", { name: /Prochaine étape/ })).toHaveCount(0);

    // Le lien de la section 2 saute la section 3, masquée, et mène à une section qui existe
    await next.nth(1).click();
    await expect(page).toHaveURL(/#how_to_play_tournaments$/);
    await expect(page.getByRole("heading", { name: "Rejoindre un Tournoi" })).toBeInViewport();
  });

  test("/statistiques : la taille de la base s'écrit avec une virgule décimale", async ({ page }) => {
    await loginAs(page, ADMIN.id);
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    await expect(page.getByText(/taille de la base/i).first()).toBeVisible();
    // Par exemple « 9,50 Mo » (les milliers sont séparés par une espace) ; jamais « 9.50 Mo »
    await expect(page.getByText(/^\d[\d\s ]*,\d{2} Mo$/).first()).toBeVisible();
    await expect(page.getByText(/^\d+\.\d{2} Mo$/)).toHaveCount(0);
  });
});

test.describe("carte 133 : fin d'inscription", () => {
  test("un nouveau membre revient sur la page demandée à la fin de son inscription", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, NEWBIE.id);
    const target = `/forum/new-topic?forumId=${E2E.forumId}`;
    await page.goto(target);
    // Envoyé vers l'inscription, avec la page demandée dans l'adresse
    await expect(page).toHaveURL(/\/auth\/onboarding\?callbackUrl=/);
    expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe(target);
    await page.waitForLoadState("networkidle");

    await page.getByRole("textbox", { name: /Pseudo/ }).fill("Nouveau Bam Inv");
    await page.getByRole("button", { name: "Valider mon profil et entrer" }).click();
    await expect(page).toHaveURL(new RegExp(`/forum/new-topic\\?forumId=${E2E.forumId}$`), { timeout: 30_000 });
  });

  test("une adresse de retour extérieure au site est ignorée", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, NEWBIE_EVIL.id);
    await page.goto("/auth/onboarding?callbackUrl=https://exemple-pirate.test/piege", { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: /Pseudo/ }).fill("Nouveau Bam Inv Deux");
    await page.getByRole("button", { name: "Valider mon profil et entrer" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/, { timeout: 30_000 });
  });
});

test.describe("carte 135 : annuaire des membres", () => {
  test("la page /membres n'envoie au navigateur aucun champ non affiché", async ({ page }) => {
    await loginAs(page, COACH.id);
    const response = await page.goto("/membres", { waitUntil: "networkidle" });
    // La page envoyée contient le HTML et les données transmises aux composants du navigateur
    const html = (await response?.text()) ?? "";
    expect(html).toContain(SECRETIVE.name);
    for (const marker of SECRET_MARKERS) expect(html, `donnée envoyée : ${marker}`).not.toContain(marker);
  });

  test("le filtre « Rôle » propose les rôles personnalisés", async ({ page }) => {
    await loginAs(page, COACH.id);
    await page.goto("/membres", { waitUntil: "networkidle" });
    const roleFilter = page.getByRole("combobox", { name: "Rôle", exact: true }).first();
    await expect(roleFilter.getByRole("option", { name: CUSTOM_ROLE.label })).toHaveCount(1);
    await roleFilter.selectOption(CUSTOM_ROLE.name);
    await expect(page.getByText(/^1 membre$/)).toBeVisible();
    await expect(page.getByRole("link", { name: SECRETIVE.name }).first()).toBeVisible();
  });
});

test.describe("carte 139 : articles modérés dans la liste", () => {
  test("un visiteur et un membre ne voient pas l'article modéré ; un modérateur le voit, marqué « Modéré »", async ({ page }) => {
    const list = "/articles?query=Inv+Bam+Article";
    for (const who of [null, COACH.id]) {
      await logout(page);
      if (who) await loginAs(page, who);
      await page.goto(list, { waitUntil: "networkidle" });
      await expect(page.getByRole("link", { name: new RegExp(VISIBLE_ARTICLE.title) }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: new RegExp(MODERATED_ARTICLE.title) })).toHaveCount(0);
      await expect(page.getByText(MODERATED_ARTICLE.content)).toHaveCount(0);
    }

    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto(list, { waitUntil: "networkidle" });
    const moderated = page.getByRole("link", { name: new RegExp(MODERATED_ARTICLE.title) }).first();
    await expect(moderated).toBeVisible();
    await expect(moderated.getByText("Modéré", { exact: true })).toBeVisible();
  });
});

test.describe("carte 140 : page et modification d'un article", () => {
  test("la page de l'article affiche sa ligue, et la modifier la garde", async ({ page }) => {
    await page.goto(`/articles/${LIGUE_ARTICLE.id}`, { waitUntil: "networkidle" });
    const ligueLink = page.getByRole("link", { name: `${LIGUE.name} (${LIGUE.acronym})` });
    await expect(ligueLink).toHaveAttribute("href", `/ligue/${LIGUE.id}`);

    await loginAs(page, COACH.id);
    await page.goto(`/articles/edit/${LIGUE_ARTICLE.id}`, { waitUntil: "networkidle" });
    // La ligue est déjà choisie dans le formulaire
    await expect(page.getByRole("button", { name: `Retirer ${LIGUE.acronym}` })).toBeVisible();
    await page.getByRole("button", { name: "Mettre à jour l'article" }).click();
    await expect(page).toHaveURL(new RegExp(`/articles/${LIGUE_ARTICLE.id}$`), { timeout: 30_000 });
    await expect.poll(() => db((prisma) => prisma.article.findUnique({ where: { id: LIGUE_ARTICLE.id }, select: { ligueId: true } })))
      .toEqual({ ligueId: LIGUE.id });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: `${LIGUE.name} (${LIGUE.acronym})` })).toBeVisible();
  });

  test("un schéma BBScheme inséré dans un article est animé par le lecteur", async ({ page }) => {
    await page.goto(`/articles/${SCHEME_ARTICLE.id}`, { waitUntil: "networkidle" });
    // Les commandes du lecteur n'existent que s'il a été lancé
    await expect(page.getByRole("button", { name: "Pivoter le terrain" })).toBeVisible({ timeout: 20_000 });
  });

  test("la fenêtre de modération d'un article parle d'« article »", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/articles/${VISIBLE_ARTICLE.id}`, { waitUntil: "networkidle" });
    await chooseArticleAction(page, "Modérer l'article");
    const dialog = page.getByRole("dialog", { name: `Modérer l'article de ${SECRETIVE.name}` });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Le contenu de l'article sera masqué/)).toBeVisible();
    await expect(page.getByText(/Modérer le message/)).toHaveCount(0);
    // Fermée sans confirmer : l'article n'est pas modéré
    await dialog.getByRole("button", { name: "Annuler" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("en taille téléphone", () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test("/jouer, /membres et la page d'un article tiennent dans l'écran, cibles d'au moins 44 pixels", async ({ page }) => {
    await page.goto("/jouer", { waitUntil: "networkidle" });
    await expectNoHorizontalScroll(page);
    const next = page.getByRole("link", { name: /Prochaine étape/ }).first();
    expect((await next.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

    await page.goto(`/articles/${LIGUE_ARTICLE.id}`, { waitUntil: "networkidle" });
    await expectNoHorizontalScroll(page);
    const ligueLink = page.getByRole("link", { name: `${LIGUE.name} (${LIGUE.acronym})` });
    await expect(ligueLink).toBeVisible();
    expect((await ligueLink.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

    await page.goto(`/articles/${SCHEME_ARTICLE.id}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Pivoter le terrain" })).toBeVisible({ timeout: 20_000 });
    await expectNoHorizontalScroll(page);

    await loginAs(page, COACH.id);
    await page.goto("/membres", { waitUntil: "networkidle" });
    await expectNoHorizontalScroll(page);
    // Sur téléphone, le filtre « Rôle » est dans le panneau « Filtrer les membres »
    await page.getByRole("button", { name: /Filtres/ }).click();
    const panel = page.getByRole("dialog", { name: "Filtrer les membres" });
    await expect(panel.getByRole("combobox", { name: "Rôle", exact: true }).getByRole("option", { name: CUSTOM_ROLE.label })).toHaveCount(1);
  });
});
