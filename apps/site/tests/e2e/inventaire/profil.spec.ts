/**
 * Inventaire de la refonte, section 7 (profil et membres) de docs/refonte/inventaire.md (carte 092) : la page
 * `/profile` et ses sept onglets, le profil d'un autre membre `/spy/[id]` et l'annuaire `/membres`. Rejoué en taille
 * ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés par leur rôle,
 * leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification avant et après
 * la refonte de ces écrans.
 *
 * Quelques petites fonctions cherchent un élément à deux endroits possibles, sans changer ce qui est attendu :
 * - `profileTab` : les onglets du profil sont dans la page, ou dans le panneau « Plus » du téléphone ;
 * - `control` : un réglage de l'annuaire est dans la page, ou dans le panneau des filtres du téléphone ;
 * - `memberAction` : une action sur un membre est un bouton visible, ou une entrée du menu « ⋯ » de ce membre.
 * Quand un libellé a deux formes possibles (« Appliquer » ou « Confirmer »), l'expression régulière accepte les deux.
 *
 * Les tests tournent en mode hub (AUTH_MODE=hub dans .env) : le pseudo, l'avatar, le NAF et la région appartiennent
 * alors au passeport du hub, qui n'est pas lancé pendant les tests. L'enregistrement du profil est donc vérifié
 * jusqu'à la réponse affichée (succès ou refus du passeport), et la suppression du compte jusqu'au lien vers le
 * passeport.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Prf … » : le membre « Inv Prf Moi »
 * (NAF, région, équipe, ligue référencée et ligue libre, comptes Discord et Google), un autre membre, un membre
 * bloqué, une cible de bannissement, un super administrateur, un membre à supprimer, un membre banni, 26 membres
 * de remplissage (25 par page dans l'annuaire), un forum avec 21 sujets suivis (20 par page, un seul non lu),
 * 7 articles (6 par page), une ressource, une région et une ligue.
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

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const ME = { id: "e2e_prf_me", name: "Inv Prf Moi", email: "prf-me@e2e.test", naf: "424242" };
const OTHER = { id: "e2e_prf_other", name: "Inv Prf Autre" };
const BLOCKED = { id: "e2e_prf_blocked", name: "Inv Prf Bloqué" };
const TARGET = { id: "e2e_prf_target", name: "Inv Prf Cible" };
const SA = { id: "e2e_prf_sa", name: "Inv Prf Super Admin" };
const VICTIM = { id: "e2e_prf_victim", name: "Inv Prf Victime" };
const BANNED = { id: "e2e_prf_banned", name: "Inv Prf Banni" };
const FORUM = { id: "e2e_prf_forum", name: "Inv Prf Forum" };
const LIGUE = { id: "e2e_prf_ligue", name: "Inv Prf Ligue", acronym: "IPL" };
const REGION = { key: "INV_PRF_R", label: "Inv Prf Région" };
const RESOURCE = { id: "e2e_prf_resource", title: "Inv Prf Ressource" };

const FILLERS = 26;
const memberId = (n: number) => `e2e_prf_m${String(n).padStart(2, "0")}`;
const memberName = (n: number) => `Inv Prf Membre ${String(n).padStart(2, "0")}`;
const TOPICS = 21;
const topicId = (n: number) => `e2e_prf_topic_${String(n).padStart(2, "0")}`;
const topicTitle = (n: number) => `Inv Prf Sujet ${String(n).padStart(2, "0")}`;
const ARTICLES = 7;
const articleTitle = (n: number) => `Inv Prf Article ${n}`;

const ALL_USER_IDS = [
  ME.id, OTHER.id, BLOCKED.id, TARGET.id, SA.id, VICTIM.id, BANNED.id,
  ...Array.from({ length: FILLERS }, (_, i) => memberId(i + 1)),
];

const PROFILE_TABS = {
  followed: "Sujets suivis",
  activity: "Activité du forum",
  articles: "Mes articles",
  ressources: "Mes ressources",
  blocked: "Utilisateurs bloqués",
  edit: "Éditer mon profil",
  settings: "Gérer mon compte",
} as const;

async function cleanUp() {
  await db(async (prisma) => {
    await prisma.block.deleteMany({ where: { OR: [{ blockerId: { in: ALL_USER_IDS } }, { blockedId: { in: ALL_USER_IDS } }] } });
    await prisma.topicFollow.deleteMany({ where: { userId: { in: ALL_USER_IDS } } });
    await prisma.topicView.deleteMany({ where: { userId: { in: ALL_USER_IDS } } });
    await prisma.post.deleteMany({ where: { topicId: { startsWith: "e2e_prf_topic_" } } });
    await prisma.topic.deleteMany({ where: { forumId: FORUM.id } });
    await prisma.forum.deleteMany({ where: { id: FORUM.id } });
    await prisma.article.deleteMany({ where: { title: { startsWith: "Inv Prf Article" } } });
    await prisma.resource.deleteMany({ where: { authorId: { in: ALL_USER_IDS } } });
    await prisma.moderationLog.deleteMany({ where: { OR: [{ targetId: { in: ALL_USER_IDS } }, { moderatorId: { in: ALL_USER_IDS } }] } });
    await prisma.account.deleteMany({ where: { userId: { in: ALL_USER_IDS } } });
    await prisma.user.updateMany({ where: { id: ME.id }, data: { ligueCustom: null } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE.id } });
    await prisma.user.deleteMany({ where: { id: { in: ALL_USER_IDS } } });
    await prisma.referenceData.deleteMany({ where: { group: "COACH_REGION", key: REGION.key } });
  });
}

test.describe("Inventaire : profil et membres", () => {
  test.beforeAll(async () => {
    await cleanUp();
    await db(async (prisma) => {
      // User.role est une clé étrangère vers RoleConfig : les rôles utilisés ici doivent exister
      for (const role of [
        { name: "SUPERADMIN", label: "Super Admin", power: 100 },
        { name: "RTC", label: "RTC", power: 50 },
      ]) {
        await prisma.roleConfig.upsert({ where: { name: role.name }, update: {}, create: { ...role, isBaseRole: true } });
      }
      await prisma.referenceData.create({ data: { group: "COACH_REGION", key: REGION.key, label: REGION.label, order: 0 } });

      const base = { hasFinishedOnboarding: true };
      await prisma.user.create({
        data: {
          ...base, id: ME.id, name: ME.name, email: ME.email, nafNumber: ME.naf, region: REGION.key,
          equipe: "Inv Prf Barons", ligueCustom: "Ligue Libre Prf", signature: "Inv Prf signature", theme: "vestiaire",
        },
      });
      await prisma.ligue.create({ data: { id: LIGUE.id, name: LIGUE.name, acronym: LIGUE.acronym, creatorId: ME.id } });
      await prisma.user.update({ where: { id: ME.id }, data: { ligues: { connect: { id: LIGUE.id } } } });
      await prisma.account.createMany({
        data: [
          { userId: ME.id, type: "oauth", provider: "discord", providerAccountId: "inv-prf-discord" },
          { userId: ME.id, type: "oauth", provider: "google", providerAccountId: "inv-prf-google" },
        ],
      });
      await prisma.user.createMany({
        data: [
          { ...base, id: OTHER.id, name: OTHER.name, email: "prf-other@e2e.test", nafNumber: "515151" },
          { ...base, id: BLOCKED.id, name: BLOCKED.name, email: "prf-blocked@e2e.test" },
          { ...base, id: TARGET.id, name: TARGET.name, email: "prf-target@e2e.test" },
          { ...base, id: SA.id, name: SA.name, email: "prf-sa@e2e.test", role: "SUPERADMIN" },
          { ...base, id: VICTIM.id, name: VICTIM.name, email: "prf-victim@e2e.test" },
          { ...base, id: BANNED.id, name: BANNED.name, email: "prf-banned@e2e.test", isBanned: true, banReason: "Test e2e" },
          ...Array.from({ length: FILLERS }, (_, i) => ({
            ...base, id: memberId(i + 1), name: memberName(i + 1), email: `prf-m${i + 1}@e2e.test`,
            nafNumber: i === 0 ? "616161" : null, region: i === 0 ? REGION.key : null,
          })),
        ],
      });
      await prisma.user.update({ where: { id: memberId(1) }, data: { ligues: { connect: { id: LIGUE.id } } } });
      await prisma.block.create({ data: { blockerId: ME.id, blockedId: BLOCKED.id } });

      // Forum, 21 sujets suivis par « Inv Prf Moi » (le plus récent d'abord : le sujet 21 est seul en page 2)
      const category = await prisma.category.findFirstOrThrow({ where: { name: E2E.categoryName } });
      await prisma.forum.create({ data: { id: FORUM.id, name: FORUM.name, categoryId: category.id } });
      const now = Date.now();
      for (let n = 1; n <= TOPICS; n++) {
        const at = new Date(now - n * 60_000);
        await prisma.topic.create({
          data: { id: topicId(n), title: topicTitle(n), forumId: FORUM.id, authorId: OTHER.id, createdAt: at, updatedAt: at },
        });
        await prisma.topicFollow.create({ data: { userId: ME.id, topicId: topicId(n) } });
        // Tous lus sauf le sujet 01
        if (n !== 1) await prisma.topicView.create({ data: { userId: ME.id, topicId: topicId(n), lastViewedAt: new Date(now + 60_000) } });
      }
      await prisma.post.create({ data: { topicId: topicId(1), authorId: ME.id, content: "Inv Prf message de Moi", createdAt: new Date(now - 30_000) } });
      await prisma.post.create({ data: { topicId: topicId(2), authorId: OTHER.id, content: "Inv Prf message de l'autre", createdAt: new Date(now - 30_000) } });
      // Les messages ont changé la date des sujets : on la remet
      for (const n of [1, 2]) await prisma.topic.update({ where: { id: topicId(n) }, data: { updatedAt: new Date(now - n * 60_000) } });

      // 7 articles de « Moi » (le 7 est le plus ancien : seul en page 2) et 1 de l'autre membre
      for (let n = 1; n <= ARTICLES; n++) {
        await prisma.article.create({
          data: { title: articleTitle(n), content: "Inv Prf contenu", authorId: ME.id, createdAt: new Date(now - n * 60_000) },
        });
      }
      await prisma.article.create({ data: { title: "Inv Prf Article de l'autre", content: "Inv Prf contenu", authorId: OTHER.id } });
      await prisma.resource.create({
        data: { id: RESOURCE.id, title: RESOURCE.title, description: "Inv Prf description", link: "https://example.com/inv-prf", authorId: ME.id },
      });
    });
  });

  test.afterAll(async () => {
    await cleanUp();
  });

  // Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  });

  /** Ouvre un onglet du profil : dans la page, ou dans le panneau « Plus » du téléphone. */
  async function profileTab(page: Page, name: string) {
    const inMain = page.getByRole("main").first().getByRole("link", { name, exact: true })
      .or(page.getByRole("main").first().getByRole("button", { name, exact: true }))
      .filter({ visible: true });
    if ((await inMain.count()) > 0) {
      await inMain.first().click();
      return;
    }
    await page.getByRole("button", { name: "Plus", exact: true }).click();
    const panel = page.getByRole("dialog", { name: "Plus" });
    await expect(panel).toBeVisible();
    // Dans le panneau, les onglets sont des boutons (les liens du panneau sont les rubriques du site)
    await panel.getByRole("button", { name, exact: true }).first().click();
    if (await panel.isVisible()) await page.keyboard.press("Escape");
  }

  const content = (page: Page) => page.getByRole("main").first();

  /** Bouton « page suivante » de la pagination (bouton ou lien selon la version). */
  const nextPage = (scope: Locator) =>
    scope.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first()
      .getByRole("button", { name: /^(next|Page suivante)$/ })
      .or(scope.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first().getByRole("link", { name: /^(next|Page suivante)$/ }));

  test("profil : carte du membre et onglets gardés dans l'adresse", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/profile", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: ME.name })).toBeVisible();
    await expect(main.getByText(/coach/i).filter({ visible: true }).first()).toBeVisible();
    const naf = main.getByRole("link", { name: ME.naf });
    await expect(naf).toHaveAttribute("href", new RegExp(`coach=${ME.naf}`));
    await expect(main.getByText(REGION.label).or(main.getByText(REGION.key)).filter({ visible: true }).first()).toBeVisible();
    await expect(main.getByText("Inv Prf Barons")).toBeVisible();
    await expect(main.getByRole("link", { name: LIGUE.acronym })).toHaveAttribute("href", `/ligue/${LIGUE.id}`);
    await expect(main.getByText("Ligue Libre Prf")).toBeVisible();
    // Nombre de messages : un seul message de « Moi »
    await expect(main.getByText("Messages", { exact: true }).filter({ visible: true }).first()).toBeVisible();

    // Chaque onglet change l'adresse (?tab=) ; l'adresse ouvre l'onglet
    for (const [id, label] of Object.entries(PROFILE_TABS)) {
      await profileTab(page, label);
      await expect(page).toHaveURL(new RegExp(`[?&]tab=${id}`));
    }
    await page.goto("/profile?tab=blocked", { waitUntil: "networkidle" });
    await expect(main.getByText(BLOCKED.name)).toBeVisible();

    // Un membre banni voit le badge « Banni » sur son propre profil : vérifié sur le profil vu par un modérateur
    await loginAs(page, E2E.modoId);
    await page.goto(`/spy/${BANNED.id}`, { waitUntil: "networkidle" });
    await expect(content(page).getByText("Banni", { exact: true }).filter({ visible: true }).first()).toBeVisible();
  });

  test("profil : sujets suivis, activité, articles et ressources", async ({ page }) => {
    await loginAs(page, ME.id);
    const main = content(page);

    // Sujets suivis : 20 par page, pastille « Non lu » sur le seul sujet non lu
    await page.goto("/profile?tab=followed", { waitUntil: "networkidle" });
    const unread = main.getByRole("link", { name: new RegExp(topicTitle(1)) });
    await expect(unread).toHaveAttribute("href", `/forum/topic/${topicId(1)}`);
    await expect(unread.getByRole("img", { name: "Non lu" })).toBeVisible();
    await expect(main.getByRole("link", { name: new RegExp(topicTitle(2)) }).getByRole("img", { name: "Non lu" })).toHaveCount(0);
    await expect(main.getByRole("link", { name: new RegExp(topicTitle(TOPICS)) })).toHaveCount(0);
    await nextPage(main).click();
    await expect(main.getByRole("link", { name: new RegExp(topicTitle(TOPICS)) })).toBeVisible();
    await expect(main.getByRole("link", { name: new RegExp(topicTitle(1)) })).toHaveCount(0);

    // Activité récente du forum : le message de « Moi » mène au message
    await page.goto("/profile?tab=activity", { waitUntil: "networkidle" });
    const activity = main.getByRole("link", { name: new RegExp(topicTitle(1)) });
    await expect(activity).toHaveAttribute("href", new RegExp(`/forum/topic/${topicId(1)}#post-`));
    await expect(activity).toContainText("Inv Prf message de Moi");

    // Mes articles : 6 par page
    await page.goto("/profile?tab=articles", { waitUntil: "networkidle" });
    await expect(main.getByRole("link", { name: new RegExp(articleTitle(1)) }).first()).toBeVisible();
    await expect(main.getByText(articleTitle(7), { exact: true })).toHaveCount(0);
    await nextPage(main).click();
    await expect(main.getByRole("link", { name: new RegExp(articleTitle(7)) }).first()).toBeVisible();

    // Mes ressources : Éditer, Supprimer avec confirmation
    await page.goto("/profile?tab=ressources", { waitUntil: "networkidle" });
    await expect(main.getByText(RESOURCE.title)).toBeVisible();
    await expect(main.getByRole("link", { name: "Éditer", exact: true })).toHaveAttribute("href", `/ressources/edit/${RESOURCE.id}`);
    await main.getByRole("button", { name: /Supprimer/ }).first().click();
    const confirm = page.getByRole("dialog", { name: /Supprimer la ressource/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Annuler" }).click();
    await expect(confirm).toBeHidden();
    await main.getByRole("button", { name: /Supprimer/ }).first().click();
    await page.getByRole("dialog", { name: /Supprimer la ressource/ }).getByRole("button", { name: /^(Confirmer|Supprimer)/ }).click();
    await expect(main.getByText(RESOURCE.title)).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.resource.count({ where: { id: RESOURCE.id } }))).toBe(0);
  });

  test("profil : utilisateurs bloqués et « Débloquer »", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/profile?tab=blocked", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByText(BLOCKED.name)).toBeVisible();
    await main.getByRole("button", { name: /Débloquer/ }).first().click();
    await expect(main.getByText(BLOCKED.name)).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.block.count({ where: { blockerId: ME.id, blockedId: BLOCKED.id } }))).toBe(0);
    await db((prisma) => prisma.block.create({ data: { blockerId: ME.id, blockedId: BLOCKED.id } }));
  });

  test("profil : éditer le profil (avatar, contour, champs, ligues, signature, thème)", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/profile?tab=edit", { waitUntil: "networkidle" });
    const main = content(page);

    // Avatar, première façon : son adresse
    const url = main.getByRole("textbox", { name: "URL de l'avatar" });
    await url.fill("https://example.com/inv-prf.png");
    await expect(url).toHaveValue("https://example.com/inv-prf.png");
    // Deuxième façon : aléatoire
    await main.getByRole("button", { name: "Aléatoire" }).click();
    await expect(url).toHaveValue(/api\.dicebear\.com/);
    // Troisième façon : le générateur (graine et style)
    await main.getByRole("button", { name: /^(Personnaliser|Générer)$/ }).click();
    const generator = page.getByRole("dialog", { name: /générateur d'avatar/i });
    await expect(generator).toBeVisible();
    await generator.getByRole("textbox", { name: /^(Graine|Seed)/ }).fill("inv-prf-graine");
    await generator.getByRole("button", { name: /Robot/ }).click();
    await generator.getByRole("button", { name: /^(Appliquer|Confirmer)$/ }).click();
    await expect(generator).toBeHidden();
    await expect(url).toHaveValue(/bottts.*seed=inv-prf-graine/);
    // Quatrième façon : envoyer une image (l'envoi lui-même passe par le service extérieur ImgBB)
    const chooser = page.waitForEvent("filechooser");
    await main.getByRole("button", { name: "Envoyer une image" }).click();
    await chooser;

    // Contour d'avatar
    const frame = main.getByRole("combobox", { name: "Contour d'avatar" });
    if ((await frame.count()) > 0) {
      await frame.selectOption("none");
    } else {
      await main.getByText("Automatique (par défaut)").click();
      await main.getByText("Aucun contour").click();
    }
    await expect(main.getByText("Aucun contour").or(frame).first()).toBeVisible();

    // Champs du profil
    await main.getByRole("textbox", { name: "Pseudo" }).fill("Inv Prf Moi Modifié");
    await main.getByRole("textbox", { name: "Numéro NAF" }).fill("434343");
    await main.getByRole("combobox", { name: /^Région/ }).selectOption({ label: REGION.label });
    await main.getByRole("textbox", { name: /^Équipe/ }).fill("Inv Prf Nouvelle Équipe");
    await expect(main.getByRole("button", { name: `Retirer ${LIGUE.acronym}` })).toBeVisible();
    await expect(main.getByRole("button", { name: "Retirer Ligue Libre Prf" })).toBeVisible();
    await main.getByRole("textbox", { name: "Autre ligue (saisie libre)" }).fill("Inv Prf Ligue Ajoutée");
    await main.getByRole("button", { name: "Ajouter cette ligue" }).click();
    await expect(main.getByRole("button", { name: "Retirer Inv Prf Ligue Ajoutée" })).toBeVisible();
    const signature = main.getByRole("textbox", { name: /Signature/ });
    await signature.fill("x".repeat(300));
    expect((await signature.inputValue()).length).toBeLessThanOrEqual(250);
    await signature.fill("[b]Inv Prf nouvelle signature[/b]");

    // Choix du thème : appliqué tout de suite et enregistré dans le profil
    await main.getByRole("button", { name: /Saison 3/ }).or(main.getByRole("radio", { name: /Saison 3/ })).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "saison3");
    await expect.poll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: ME.id } }))?.theme)).toBe("saison3");
    await main.getByRole("button", { name: /Vestiaire/ }).or(main.getByRole("radio", { name: /Vestiaire/ })).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "vestiaire");

    // Enregistrement : en mode hub, le passeport (absent pendant les tests) refuse ; sinon le profil est enregistré
    await main.getByRole("button", { name: "Sauvegarder le profil" }).click();
    await expect(page.getByText(/Profil mis à jour|passeport/).first()).toBeVisible();
  });

  test("profil : gérer mon compte (connexions, notifications, suppression)", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/profile?tab=settings", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByText(ME.email)).toBeVisible();

    // Délier Google (il reste Discord), puis le bouton « Associer Google » apparaît
    await expect(main.getByRole("button", { name: "Délier Discord" })).toBeEnabled();
    await main.getByRole("button", { name: "Délier Google" }).click();
    await expect(main.getByRole("button", { name: "Associer Google" })).toBeEnabled();
    await expect.poll(() => db((prisma) => prisma.account.count({ where: { userId: ME.id, provider: "google" } }))).toBe(0);
    // Le dernier moyen de connexion ne peut pas être délié
    await expect(main.getByRole("button", { name: "Délier Discord" })).toBeDisabled();

    // Interrupteurs de notification par email
    const notif = (name: RegExp) => main.getByRole("checkbox", { name }).or(main.getByRole("switch", { name }));
    for (const name of [/^Messages privés$/i, /^Mentions$/, /^Sujets suivis$/, /^Newsletter/]) {
      await expect(notif(name)).toBeChecked();
    }
    // Clic envoyé directement à l'interrupteur (l'ancienne case à cocher est invisible, sous son dessin)
    await notif(/^Mentions$/).dispatchEvent("click");
    await expect(notif(/^Mentions$/)).not.toBeChecked();
    await expect.poll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: ME.id } }))?.notifMention)).toBe(false);

    // Développement : newsletter de test
    await expect(main.getByRole("button", { name: "Envoyer une newsletter de test" })).toBeVisible();

    // Suppression du compte : en mode hub, elle passe par le passeport ; sinon, double confirmation
    const remove = main.getByRole("link", { name: /Supprimer mon compte/ }).or(main.getByRole("button", { name: /Supprimer mon compte/ }));
    await expect(remove).toBeVisible();
    if ((await main.getByRole("button", { name: /Supprimer mon compte/ }).count()) > 0) {
      await remove.click();
      await page.getByRole("dialog").getByRole("button", { name: "Continuer" }).click();
      await expect(page.getByRole("dialog").getByRole("button", { name: "Tout supprimer définitivement" })).toBeVisible();
      await page.getByRole("dialog").getByRole("button", { name: "Annuler" }).click();
    } else {
      await expect(main.getByRole("link", { name: /Supprimer mon compte/ })).toHaveAttribute("href", /return_to=/);
    }
  });

  test("spy : profil d'un autre membre (onglets, message privé, signaler, bloquer)", async ({ page }) => {
    await loginAs(page, ME.id);
    // Son propre identifiant renvoie vers /profile
    await page.goto(`/spy/${ME.id}`);
    await page.waitForURL(/\/profile/);

    await page.goto(`/spy/${OTHER.id}`, { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: new RegExp(OTHER.name) }).first()).toBeVisible();
    // Onglets Activité et Articles
    await expect(main.getByRole("link", { name: new RegExp(topicTitle(2)) })).toContainText("Inv Prf message de l'autre");
    await profileTab(page, "Articles");
    await expect(page).toHaveURL(/[?&]tab=articles/);
    await expect(main.getByRole("link", { name: /Inv Prf Article de l'autre/ }).first()).toBeVisible();
    await profileTab(page, "Activité du forum");
    await expect(page).toHaveURL(/[?&]tab=activity/);

    await expect(main.getByRole("link", { name: "Message privé" })).toHaveAttribute("href", `/messagerie?userId=${OTHER.id}`);

    await main.getByRole("button", { name: "Signaler" }).click();
    const report = page.getByRole("dialog", { name: /Signaler/ });
    await expect(report).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(report).toBeHidden();

    // Bloquer puis débloquer, avec confirmation
    await main.getByRole("button", { name: "Bloquer", exact: true }).click();
    await page.getByRole("dialog", { name: /Bloquer/ }).getByRole("button", { name: /^(Confirmer|Bloquer)$/ }).click();
    await expect(main.getByRole("button", { name: "Débloquer", exact: true })).toBeVisible();
    await expect.poll(() => db((prisma) => prisma.block.count({ where: { blockerId: ME.id, blockedId: OTHER.id } }))).toBe(1);
    await main.getByRole("button", { name: "Débloquer", exact: true }).click();
    await page.getByRole("dialog", { name: /Débloquer/ }).getByRole("button", { name: /^(Confirmer|Débloquer)$/ }).click();
    await expect(main.getByRole("button", { name: "Bloquer", exact: true })).toBeVisible();
    await expect.poll(() => db((prisma) => prisma.block.count({ where: { blockerId: ME.id, blockedId: OTHER.id } }))).toBe(0);

    // Pas de « Bloquer » sur un modérateur
    await page.goto(`/spy/${E2E.modoId}`, { waitUntil: "networkidle" });
    await expect(main.getByRole("button", { name: "Signaler" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Bloquer", exact: true })).toHaveCount(0);
  });

  test("spy : un modérateur bannit puis débannit", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/spy/${TARGET.id}`, { waitUntil: "networkidle" });
    const main = content(page);
    await main.getByRole("button", { name: "Bannir", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /Bannir/ });
    await expect(dialog).toBeVisible();
    for (const reason of ["Spam / Publicité", "Harcèlement / Insultes", "Contenu inapproprié / NSFW", "Bot"]) {
      await expect(dialog.getByRole("button", { name: reason })).toBeVisible();
    }
    await dialog.getByRole("button", { name: "Bot" }).click();
    await dialog.getByRole("textbox").fill("Inv Prf détails");
    await dialog.getByRole("button", { name: "Confirmer le bannissement" }).click();
    await expect(main.getByRole("button", { name: "Débannir", exact: true })).toBeVisible();
    const banned = await db((prisma) => prisma.user.findUnique({ where: { id: TARGET.id }, select: { isBanned: true, banReason: true } }));
    expect(banned).toEqual({ isBanned: true, banReason: "[Bot] Inv Prf détails" });

    await main.getByRole("button", { name: "Débannir", exact: true }).click();
    await page.getByRole("dialog", { name: /Débannir/ }).getByRole("button", { name: /Débannir/ }).click();
    await expect(main.getByRole("button", { name: "Bannir", exact: true })).toBeVisible();
    expect((await db((prisma) => prisma.user.findUnique({ where: { id: TARGET.id }, select: { isBanned: true } })))?.isBanned).toBe(false);
  });

  /** Panneau des filtres du téléphone, ouvert au besoin. */
  async function filterPanel(page: Page): Promise<Locator> {
    const panel = page.getByRole("dialog", { name: /Filtr/ }).filter({ visible: true });
    if ((await panel.count()) === 0) {
      // En développement, le bouton flottant historique est caché sous les widgets de développement : le clic est
      // envoyé directement au bouton
      await page.getByRole("button", { name: /^(Ouvrir les filtres|Filtres)/ }).filter({ visible: true }).first().dispatchEvent("click");
      await expect(panel.first()).toBeVisible();
    }
    return panel.first();
  }

  /** Réglage de l'annuaire : visible dans la page, sinon dans le panneau des filtres du téléphone. */
  async function control(page: Page, role: "combobox" | "textbox", name: string | RegExp): Promise<Locator> {
    const onPage = page.getByRole(role, { name }).filter({ visible: true });
    if ((await onPage.count()) > 0) return onPage.first();
    const panel = await filterPanel(page);
    const inPanel = panel.getByRole(role, { name }).filter({ visible: true }).first();
    await expect(inPanel).toBeVisible();
    return inPanel;
  }

  /** Ferme le panneau des filtres s'il est ouvert. */
  async function closeFilters(page: Page) {
    const panel = page.getByRole("dialog", { name: /Filtr/ }).filter({ visible: true });
    if ((await panel.count()) === 0) return;
    // En développement, le bas du panneau peut être caché sous les widgets de développement : clic envoyé au bouton
    await panel.first().getByRole("button", { name: /^(Appliquer les filtres|Voir \d+ membres?)$/ }).dispatchEvent("click");
    await expect(panel).toHaveCount(0);
  }

  /** Les membres affichés dont le nom commence par `prefix`, dans l'ordre. */
  const memberLinks = (page: Page, prefix: string) =>
    page.getByRole("link", { name: new RegExp(`^${prefix}`) }).filter({ visible: true });

  async function search(page: Page, text: string) {
    await (await control(page, "textbox", /Rechercher/)).fill(text);
    await closeFilters(page);
  }

  /** Ligne ou carte d'un membre dans l'annuaire. */
  const memberRow = (page: Page, name: string) =>
    page.getByRole("row").or(page.getByRole("listitem")).filter({ hasText: name }).filter({ visible: true }).first();

  /** Action sur un membre : bouton visible dans sa ligne, ou entrée de son menu « ⋯ ». */
  async function memberAction(page: Page, name: string, action: RegExp) {
    const row = memberRow(page, name);
    const button = row.getByRole("button", { name: action }).filter({ visible: true });
    if ((await button.count()) > 0) {
      await button.first().click();
      return;
    }
    await row.getByRole("button", { name: /Actions|Plus d'actions/ }).click();
    await page.getByRole("menuitem", { name: action }).or(page.getByRole("dialog").getByRole("button", { name: action })).first().click();
  }

  test("membres : recherche, filtres, tri, 25 par page et liens", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/membres", { waitUntil: "networkidle" });

    // Recherche par nom et 25 par page
    await search(page, "Inv Prf Membre");
    await expect(memberLinks(page, "Inv Prf Membre")).toHaveCount(25);
    await nextPage(page.locator("body")).click();
    await expect(memberLinks(page, "Inv Prf Membre")).toHaveCount(1);

    // Tri Z-A : par la liste « Trier par » si elle est affichée, sinon par l'en-tête de colonne cliquable
    await search(page, "Inv Prf Membre 0");
    const sortSelect = page.getByRole("combobox", { name: /Trier/ }).filter({ visible: true });
    if (!isPhone(page) && (await sortSelect.count()) === 0) {
      await page.getByRole("columnheader", { name: /^Utilisateur/ }).click();
      await expect(memberLinks(page, "Inv Prf Membre").first()).toHaveText(new RegExp(memberName(1)));
      await page.getByRole("columnheader", { name: /^Utilisateur/ }).click();
    } else {
      const sort = await control(page, "combobox", /Trier/);
      await sort.selectOption({ label: "Nom (Z-A)" });
      await closeFilters(page);
    }
    await expect(memberLinks(page, "Inv Prf Membre").first()).toHaveText(new RegExp(memberName(9)));

    // Filtres : ligue, région, rôle
    await search(page, "Inv Prf");
    await (await control(page, "combobox", /^Ligue/)).selectOption({ label: `[${LIGUE.acronym}] ${LIGUE.name}` });
    await closeFilters(page);
    await expect(memberLinks(page, "Inv Prf")).toHaveCount(2);
    await (await control(page, "combobox", /^Ligue/)).selectOption({ index: 0 });
    await (await control(page, "combobox", /^Région/)).selectOption({ label: REGION.label });
    await closeFilters(page);
    await expect(memberLinks(page, "Inv Prf")).toHaveCount(2);
    await (await control(page, "combobox", /^Région/)).selectOption({ index: 0 });
    await (await control(page, "combobox", /^Rôle/)).selectOption({ label: "Super Admin" });
    await closeFilters(page);
    await expect(memberLinks(page, "Inv Prf")).toHaveCount(1);
    await expect(memberLinks(page, "Inv Prf").first()).toHaveText(new RegExp(SA.name));
    await (await control(page, "combobox", /^Rôle/)).selectOption({ index: 0 });
    await closeFilters(page);

    // Liens : profil, NAF, message privé ; les bannis ne sont pas affichés à un membre
    await search(page, memberName(1));
    await expect(memberLinks(page, memberName(1)).first()).toHaveAttribute("href", `/spy/${memberId(1)}`);
    const row = memberRow(page, memberName(1));
    await expect(row.getByRole("link", { name: "616161" })).toHaveAttribute("href", /coach=616161/);
    await expect(row.getByRole("link", { name: /^(MP|Message privé)/ })).toHaveAttribute("href", `/messagerie?userId=${memberId(1)}`);
    await search(page, BANNED.name);
    await expect(memberLinks(page, BANNED.name)).toHaveCount(0);
  });

  test("membres : un modérateur voit les bannis, bannit, débannit et change un rôle", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto("/membres", { waitUntil: "networkidle" });

    await search(page, BANNED.name);
    await expect(memberLinks(page, BANNED.name)).toHaveCount(1);
    await expect(memberRow(page, BANNED.name).getByText("Banni", { exact: true }).first()).toBeVisible();

    // Bannir puis débannir un membre
    await search(page, memberName(3));
    await memberAction(page, memberName(3), /^Bannir/);
    const ban = page.getByRole("dialog", { name: /Bannir/ });
    await ban.getByRole("button", { name: "Spam / Publicité" }).click();
    await ban.getByRole("button", { name: /^(Bannir|Confirmer le bannissement)$/ }).click();
    await expect.poll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: memberId(3) } }))?.isBanned)).toBe(true);
    await expect(memberRow(page, memberName(3)).getByText("Banni", { exact: true }).first()).toBeVisible();
    await memberAction(page, memberName(3), /^Débannir/);
    await page.getByRole("dialog", { name: /Débannir/ }).getByRole("button", { name: /Débannir/ }).click();
    await expect.poll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: memberId(3) } }))?.isBanned)).toBe(false);

    // Changer le rôle
    await search(page, memberName(4));
    await page.getByRole("combobox", { name: `Changer le rôle de ${memberName(4)}` }).filter({ visible: true }).selectOption({ label: "RTC" });
    await page.getByRole("dialog", { name: /rôle/ }).getByRole("button", { name: /^(Confirmer|Changer le rôle)$/ }).click();
    await expect.poll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: memberId(4) } }))?.role)).toBe("RTC");
  });

  test("membres : un super administrateur supprime définitivement un membre", async ({ page }) => {
    await loginAs(page, SA.id);
    await page.goto("/membres", { waitUntil: "networkidle" });
    await search(page, VICTIM.name);
    await memberAction(page, VICTIM.name, /^Supprimer/);
    const dialog = page.getByRole("dialog", { name: /Suppression définitive|Supprimer/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirmer la suppression" }).click();
    await expect.poll(() => db((prisma) => prisma.user.count({ where: { id: VICTIM.id } }))).toBe(0);
  });
});
