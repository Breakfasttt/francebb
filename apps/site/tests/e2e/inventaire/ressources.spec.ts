/**
 * Inventaire de la refonte, section 11 (ressources) de docs/refonte/inventaire.md (carte 096) : la liste `/ressources`
 * (outils officiels en premier avec le badge « Officiel », grille ou liste, 20 ressources par page, recherche par texte
 * et par tags, un clic ouvre le lien), « Éditer » et « Supprimer » avec confirmation (impossible pour une ressource
 * officielle), le formulaire de proposition `/ressources/submit` (titre, description de 200 caractères, adresse, image
 * par adresse ou par envoi, tags, puis attente de validation) et le formulaire de modification `/ressources/edit/[id]`
 * (la ressource repasse en attente de validation ; une ressource officielle n'est modifiable que par un administrateur).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés
 * par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification
 * avant et après la refonte de ces écrans.
 *
 * Sur téléphone, un réglage peut être rangé dans le panneau des filtres (« Ouvrir les filtres » ou « Filtres »), et les
 * actions d'une ressource dans son menu « ⋯ » (« Actions de la ressource … »). Les petites fonctions `control` et
 * `resourceAction` cherchent d'abord dans la page, puis dans ces panneaux. C'est une adaptation de la façon de trouver
 * l'élément, pas un changement de ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Res … » :
 * - trois membres : un auteur, un autre membre et un administrateur (le modérateur est celui du jeu de données commun) ;
 * - une ressource officielle (la plus ancienne, elle doit pourtant passer en premier), « Inv Res Alpha » de l'auteur
 *   (deux tags, lien externe), « Inv Res Beta » de l'autre membre (un tag), une ressource à supprimer, une ressource à
 *   modifier et une ressource en attente de validation (jamais affichée dans la liste) ;
 * - 22 ressources de remplissage pour la pagination (20 par page).
 *
 * Les liens externes pointent vers example.com, dont les réponses sont simulées par le test (aucun accès au réseau).
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
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

const AUTHOR = { id: "e2e_res_auteur", name: "Auteur Res Inv" };
const OTHER = { id: "e2e_res_autre", name: "Autre Res Inv" };
const ADMIN = { id: "e2e_res_admin", name: "Admin Res Inv", role: "ADMIN" };
const USERS = [AUTHOR, OTHER, ADMIN];

const TAG_A = "InvResTagA";
const TAG_B = "InvResTagB";
const OFFICIAL = {
  id: "e2e_res_officiel", title: "Inv Res Officiel", description: "Outil officiel du test d'inventaire.", link: "/media",
  isSystem: true, createdAt: new Date("2024-01-01T10:00:00Z"),
};
const ALPHA = { id: "e2e_res_alpha", title: "Inv Res Alpha", description: "Description de la ressource Alpha.", link: "https://example.com/inv-res-alpha" };
const BETA = { id: "e2e_res_beta", title: "Inv Res Beta", description: "Description de la ressource Beta.", link: "https://example.com/inv-res-beta" };
const DOOMED = { id: "e2e_res_suppr", title: "Inv Res À supprimer", description: "Ressource à supprimer.", link: "https://example.com/inv-res-suppr" };
const EDITABLE = { id: "e2e_res_modif", title: "Inv Res À modifier", description: "Ressource à modifier.", link: "https://example.com/inv-res-modif" };
const PENDING = { id: "e2e_res_attente", title: "Inv Res En attente", description: "Ressource pas encore validée.", link: "https://example.com/inv-res-attente" };
const FILLERS = 22;
const fillerTitle = (n: number) => `Inv Res Remplissage ${String(n).padStart(2, "0")}`;
const SUBMITTED_TITLE = "Inv Res Proposée par l'auteur";
const EDITED_TITLE = "Inv Res Modifiée par l'auteur";

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const resources = await prisma.resource.findMany({ where: { OR: [{ id: { startsWith: "e2e_res_" } }, { title: { startsWith: "Inv Res" } }] }, select: { id: true } });
    const ids = resources.map((resource) => resource.id);
    await prisma.moderationLog.deleteMany({ where: { targetId: { in: ids } } });
    await prisma.resource.deleteMany({ where: { id: { in: ids } } });
    await prisma.resourceTag.deleteMany({ where: { name: { startsWith: "InvRes" } } });
    await prisma.user.deleteMany({ where: { id: { in: USERS.map((user) => user.id) } } });
  });
}

/** Remet les ressources que les tests modifient ou suppriment dans leur état de départ. */
async function resetMutable() {
  await db(async (prisma) => {
    for (const resource of [DOOMED, EDITABLE]) {
      await prisma.resource.upsert({
        where: { id: resource.id },
        update: { ...resource, status: "APPROVED" },
        create: { ...resource, status: "APPROVED", authorId: AUTHOR.id },
      });
    }
    await prisma.resource.update({ where: { id: OFFICIAL.id }, data: { description: OFFICIAL.description, status: "APPROVED" } });
    await prisma.resource.deleteMany({ where: { title: SUBMITTED_TITLE } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    // Le rôle ADMIN est une ligne de RoleConfig, absente du jeu de données commun des tests
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    for (const [index, user] of USERS.entries()) {
      await prisma.user.create({ data: { ...user, email: `ressource-${index}@e2e.test`, hasFinishedOnboarding: true } });
    }
    const now = Date.now();
    // Remplissage : du plus ancien (01) au plus récent (22)
    for (let n = 1; n <= FILLERS; n++) {
      await prisma.resource.create({
        data: {
          id: `e2e_res_fill_${n}`, title: fillerTitle(n), description: `Remplissage numéro ${n}.`, link: `https://example.com/inv-res-fill-${n}`,
          status: "APPROVED", authorId: AUTHOR.id, createdAt: new Date(now - (100 - n) * 60_000),
        },
      });
    }
    await prisma.resource.create({ data: { ...OFFICIAL, status: "APPROVED", authorId: OTHER.id } });
    await prisma.resource.create({
      data: { ...ALPHA, status: "APPROVED", authorId: AUTHOR.id, tags: { create: [{ name: TAG_A }, { name: TAG_B }] } },
    });
    await prisma.resource.create({ data: { ...BETA, status: "APPROVED", authorId: OTHER.id, tags: { connect: { name: TAG_B } } } });
    await prisma.resource.create({ data: { ...PENDING, status: "PENDING", authorId: AUTHOR.id } });
  });
  await resetMutable();
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// Chaque test enchaîne beaucoup de pages et d'écritures dans la base : temps permis triplé (test.slow).
// La pastille des outils de développement de Next.js (`nextjs-portal`, en bas à gauche de l'écran) est masquée : elle
// n'existe pas sur le site en ligne, et sur téléphone elle intercepterait les appuis sur les boutons placés en bas à
// gauche d'un panneau.
// Les liens externes des ressources mènent à example.com : la réponse est simulée, pour ne pas dépendre du réseau.
test.beforeEach(async ({ page, context }) => {
  test.slow();
  await context.route("https://example.com/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>Ressource externe</title>Ressource externe" }));
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

/** Titres des ressources affichées, dans l'ordre de la page. */
async function shownTitles(page: Page): Promise<string[]> {
  return page.getByText(/^Inv Res /).filter({ visible: true }).allTextContents();
}

/** Panneau des filtres du téléphone (ouvert par « Ouvrir les filtres » ou « Filtres »), ouvert au besoin. */
async function filterPanel(page: Page): Promise<Locator> {
  const panel = page.getByRole("dialog", { name: /Filtr/ }).filter({ visible: true });
  if ((await panel.count()) === 0) {
    // En développement, le bouton flottant historique est caché sous les widgets de développement (« Dev Auth ») :
    // le clic est envoyé directement au bouton
    await page.getByRole("button", { name: /^(Ouvrir les filtres|Filtres)/ }).filter({ visible: true }).first().dispatchEvent("click");
    await expect(panel.first()).toBeVisible();
  }
  return panel.first();
}

/**
 * Ferme le panneau des filtres du téléphone s'il est ouvert, puis quitte le champ en cours de saisie : sur téléphone,
 * la barre du bas réapparaît quand le champ perd le focus, et un appui donné pendant ce mouvement peut se perdre
 * (`leaveField`, ajouté après la refonte ; ce que le test attend ne change pas).
 */
async function closeFilterPanel(page: Page) {
  const panel = page.getByRole("dialog", { name: /Filtr/ }).filter({ visible: true });
  if ((await panel.count()) > 0) {
    await page.keyboard.press("Escape");
    if ((await panel.count()) > 0) await panel.getByRole("button", { name: /Fermer|Appliquer|Voir/ }).first().click();
    await expect(panel).toHaveCount(0);
  }
  await leaveField(page);
}

/** Réglage de la liste : visible dans la page, sinon dans le panneau des filtres. */
async function control(page: Page, role: "button" | "link" | "textbox", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  const inPanel = panel.getByRole(role, { name }).filter({ visible: true }).first();
  await expect(inPanel).toBeVisible();
  return inPanel;
}

/** Recherche par texte, puis attente des résultats attendus (la liste est rechargée dans la page). */
async function search(page: Page, text: string) {
  const field = await control(page, "textbox", /Rechercher une ressource/);
  await field.fill(text);
  await closeFilterPanel(page);
}

const actionIn = (scope: Page | Locator, name: RegExp) =>
  scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).or(scope.getByRole("menuitem", { name })).filter({ visible: true });

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Cherche l'action « Éditer » ou « Supprimer » d'une ressource : un bouton ou un lien nommé « Éditer <titre> » dans la
 * page, sinon l'entrée du menu « Actions de la ressource <titre> ». Renvoie `null` si l'action n'existe pas ; le menu
 * ouvert pour rien est refermé.
 */
async function resourceAction(page: Page, verb: "Éditer" | "Supprimer", title: string): Promise<Locator | null> {
  const direct = actionIn(page, new RegExp(`^${verb} ${escapeRegExp(title)}$`));
  if ((await direct.count()) > 0) return direct.first();
  const opener = page.getByRole("button", { name: `Actions de la ressource ${title}` }).filter({ visible: true });
  if ((await opener.count()) === 0) return null;
  await opener.first().click();
  const menu = page.getByRole("menu").or(page.getByRole("dialog")).filter({ visible: true }).first();
  await expect(menu).toBeVisible();
  const item = actionIn(menu, new RegExp(`^${verb}`));
  if ((await item.count()) > 0) return item.first();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  return null;
}

/** Les champs du formulaire, retrouvés par leur libellé. */
const fields = (page: Page) => ({
  title: page.getByRole("textbox", { name: /^Titre/ }),
  description: page.getByRole("textbox", { name: /description/i }),
  link: page.getByRole("textbox", { name: /^(Lien|Adresse)/ }),
  image: page.getByRole("textbox", { name: /image/i }),
  tags: page.getByRole("textbox", { name: /^Tags/ }),
});

/** Bouton d'envoi du formulaire (sur téléphone, il peut être dans la barre collée en bas de l'écran). */
const submitButton = (page: Page, name: RegExp) => page.getByRole("button", { name }).filter({ visible: true }).first();

/**
 * Quitte le champ en cours de saisie avant d'appuyer sur un bouton. Sur téléphone, la barre du bas, cachée pendant la
 * saisie, réapparaît quand le champ perd le focus et décale la page : l'appui direct tomberait alors à côté du bouton.
 */
async function leaveField(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
  await page.waitForTimeout(300);
}

/**
 * Déconnexion : la page est d'abord quittée, puis les cookies sont effacés. Sinon, une requête encore en cours sur la
 * page précédente peut répondre après l'effacement et reposer le cookie de session, qui est rafraîchi à chaque réponse.
 */
async function logout(page: Page) {
  await page.goto("about:blank");
  await page.context().clearCookies();
}

test.describe("Inventaire 11 : ressources", () => {
  test("[tous] /ressources : officiels en premier, grille ou liste, 20 par page, recherche par texte et par tags, un clic ouvre le lien", async ({ page }, testInfo) => {
    await page.goto("/ressources", { waitUntil: "networkidle" });

    // Recherche par texte : l'outil officiel passe en premier, avec son badge, bien qu'il soit le plus ancien
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page))[0]).toBe(OFFICIAL.title);
    await expect(page.getByText("Officiel", { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("ressources-grille.png"), fullPage: false });
    // Une ressource en attente de validation n'est jamais affichée
    await expect(page.getByText(PENDING.title, { exact: true })).toHaveCount(0);

    // 20 ressources par page (22 ressources de remplissage), la plus récente d'abord
    await search(page, "Inv Res Remplissage");
    await expect.poll(async () => (await shownTitles(page)).length).toBe(20);
    expect((await shownTitles(page))[0]).toBe(fillerTitle(FILLERS));
    await expect(page.getByText(OFFICIAL.title, { exact: true })).toHaveCount(0);
    await expect(page.getByText("Officiel", { exact: true }).filter({ visible: true })).toHaveCount(0);
    const pagination = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
    await expect(pagination).toBeVisible();
    await pagination.getByRole("button", { name: /^(next|Page suivante)$/ }).or(pagination.getByRole("link", { name: /^(next|Page suivante)$/ })).click();
    await expect.poll(async () => (await shownTitles(page)).length).toBe(2);
    expect(await shownTitles(page)).toEqual([fillerTitle(2), fillerTitle(1)]);

    // Recherche dans la description aussi
    await search(page, "ressource Beta");
    await expect.poll(() => shownTitles(page)).toEqual([BETA.title]);

    // Recherche par tag, choisi parmi les suggestions
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page)).length).toBeGreaterThan(3);
    const tagField = await control(page, "textbox", /tag/i);
    await tagField.fill("InvResTag");
    await page.getByRole("button", { name: TAG_A }).filter({ visible: true }).first().click();
    await closeFilterPanel(page);
    await expect.poll(() => shownTitles(page)).toEqual([ALPHA.title]);
    await page.screenshot({ path: testInfo.outputPath("ressources-tag.png"), fullPage: false });

    // Un clic sur une ressource de la grille ouvre son lien externe dans un nouvel onglet
    const popupPromise = page.waitForEvent("popup");
    await page.getByText(ALPHA.title, { exact: true }).filter({ visible: true }).first().click();
    const popup = await popupPromise;
    await popup.waitForURL(ALPHA.link);
    await popup.close();

    // Liste : mêmes ressources, et un clic ouvre aussi le lien
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await search(page, "Inv Res Remplissage");
    await expect.poll(async () => (await shownTitles(page)).length).toBe(20);
    await (await control(page, "button", /liste/i)).click();
    await closeFilterPanel(page);
    await expect.poll(async () => (await shownTitles(page)).length).toBe(20);
    await page.screenshot({ path: testInfo.outputPath("ressources-liste.png"), fullPage: false });
    const listPopupPromise = page.waitForEvent("popup");
    await page.getByText(fillerTitle(FILLERS), { exact: true }).filter({ visible: true }).first().click();
    const listPopup = await listPopupPromise;
    await listPopup.waitForURL(`https://example.com/inv-res-fill-${FILLERS}`);
    await listPopup.close();
    await (await control(page, "button", /grille/i)).click();
    await closeFilterPanel(page);

    // Une ressource interne au site s'ouvre dans le même onglet
    await search(page, "Inv Res Officiel");
    await expect.poll(() => shownTitles(page)).toEqual([OFFICIAL.title]);
    await page.getByText(OFFICIAL.title, { exact: true }).filter({ visible: true }).first().click();
    await page.waitForURL(/\/media$/);
  });

  test("[auteur, modo] Éditer, et supprimer avec confirmation (pas une ressource officielle)", async ({ page }) => {
    await resetMutable();

    // Un visiteur ne voit ni « Éditer » ni « Supprimer »
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page)).length).toBeGreaterThan(3);
    expect(await resourceAction(page, "Éditer", ALPHA.title)).toBeNull();
    expect(await resourceAction(page, "Supprimer", ALPHA.title)).toBeNull();

    // Un autre membre non plus, sur une ressource qui n'est pas la sienne
    await loginAs(page, OTHER.id);
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page)).length).toBeGreaterThan(3);
    expect(await resourceAction(page, "Éditer", ALPHA.title)).toBeNull();
    await expect((await resourceAction(page, "Éditer", BETA.title))!).toHaveAttribute("href", `/ressources/edit/${BETA.id}`);
    await page.keyboard.press("Escape");

    // L'auteur : « Éditer » mène au formulaire, « Supprimer » demande une confirmation
    await logout(page);
    await loginAs(page, AUTHOR.id);
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page)).length).toBeGreaterThan(3);
    await expect((await resourceAction(page, "Éditer", ALPHA.title))!).toHaveAttribute("href", `/ressources/edit/${ALPHA.id}`);
    await page.keyboard.press("Escape");
    await (await resourceAction(page, "Supprimer", DOOMED.title))!.click();
    const confirm = page.getByRole("dialog", { name: /Supprimer la ressource/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Annuler" }).click();
    await expect(confirm).toBeHidden();
    expect(await db((prisma) => prisma.resource.count({ where: { id: DOOMED.id } }))).toBe(1);
    await (await resourceAction(page, "Supprimer", DOOMED.title))!.click();
    await page.getByRole("dialog", { name: /Supprimer la ressource/ }).getByRole("button", { name: /^(Confirmer|Supprimer)/ }).click();
    await expect(page.getByText(DOOMED.title, { exact: true })).toHaveCount(0);
    await expect.poll(() => db((prisma) => prisma.resource.count({ where: { id: DOOMED.id } }))).toBe(0);

    // Le modérateur : « Éditer » et « Supprimer » sur la ressource d'un autre, mais pas « Supprimer » sur l'outil officiel
    await resetMutable();
    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await search(page, "Inv Res");
    await expect.poll(async () => (await shownTitles(page)).length).toBeGreaterThan(3);
    await expect((await resourceAction(page, "Éditer", BETA.title))!).toHaveAttribute("href", `/ressources/edit/${BETA.id}`);
    await page.keyboard.press("Escape");
    expect(await resourceAction(page, "Supprimer", BETA.title)).not.toBeNull();
    await page.keyboard.press("Escape");
    expect(await resourceAction(page, "Supprimer", OFFICIAL.title)).toBeNull();
  });

  test("[membre] /ressources/submit : titre, description (200 caractères), adresse, image, tags, puis attente de validation", async ({ page }, testInfo) => {
    await resetMutable();
    await loginAs(page, AUTHOR.id);

    // Le lien « Soumettre une ressource » de la liste
    await page.goto("/ressources", { waitUntil: "networkidle" });
    const submitLink = await control(page, "link", /Soumettre/);
    await expect(submitLink).toHaveAttribute("href", "/ressources/submit");

    await page.goto("/ressources/submit", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("ressource-proposer.png"), fullPage: true });
    const form = fields(page);
    await form.title.fill(SUBMITTED_TITLE);
    // La description est limitée à 200 caractères
    await form.description.fill("D".repeat(250));
    await expect(form.description).toHaveValue("D".repeat(200));
    await form.description.fill("Description de la ressource proposée par le test.");
    await form.link.fill("https://example.com/inv-res-proposee");
    await form.image.fill("https://example.com/inv-res-image.png");

    // Image : envoi d'un fichier (le choix du fichier s'ouvre ; l'envoi lui-même passe par un service externe, non testé)
    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /Upload|Envoyer une image|Changer l'image/ }).filter({ visible: true }).first().click();
    await chooserPromise;

    // Tags : un tag existant parmi les suggestions, et un nouveau tag
    await form.tags.fill("InvResTag");
    await page.getByRole("button", { name: TAG_A }).filter({ visible: true }).first().click();
    await form.tags.fill("InvResNouveau");
    await form.tags.press("Enter");
    await leaveField(page);

    await submitButton(page, /Soumettre|Envoyer|Proposer/).click();
    await page.waitForURL(/\/ressources$/);
    await expect(page.getByText(/validation/).first()).toBeVisible();

    // La ressource est enregistrée en attente de validation, avec ses deux tags, et n'apparaît pas dans la liste
    const saved = await db((prisma) => prisma.resource.findFirst({ where: { title: SUBMITTED_TITLE }, include: { tags: true } }));
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe("PENDING");
    expect(saved!.authorId).toBe(AUTHOR.id);
    expect(saved!.link).toBe("https://example.com/inv-res-proposee");
    expect(saved!.imageUrl).toBe("https://example.com/inv-res-image.png");
    expect(saved!.tags.map((tag) => tag.name).sort()).toEqual(["InvResNouveau", TAG_A]);
    await search(page, SUBMITTED_TITLE);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(SUBMITTED_TITLE, { exact: true })).toHaveCount(0);
  });

  test("[auteur, modo ; admin pour une ressource officielle] /ressources/edit/[id] : la ressource modifiée repasse en attente", async ({ page }, testInfo) => {
    await resetMutable();

    // L'auteur modifie sa ressource : elle repasse en attente de validation
    await loginAs(page, AUTHOR.id);
    await page.goto(`/ressources/edit/${EDITABLE.id}`, { waitUntil: "networkidle" });
    const form = fields(page);
    await expect(form.title).toHaveValue(EDITABLE.title);
    await expect(form.description).toHaveValue(EDITABLE.description);
    await expect(form.link).toHaveValue(EDITABLE.link);
    await page.screenshot({ path: testInfo.outputPath("ressource-modifier.png"), fullPage: true });
    await form.title.fill(EDITED_TITLE);
    await leaveField(page);
    await submitButton(page, /Mettre à jour/).click();
    await page.waitForURL(/\/ressources$/);
    await expect.poll(() => db((prisma) => prisma.resource.findUnique({ where: { id: EDITABLE.id } }).then((resource) => resource && [resource.title, resource.status]))).toEqual([EDITED_TITLE, "PENDING"]);

    // Un autre membre ne peut pas modifier la ressource
    await logout(page);
    await loginAs(page, OTHER.id);
    await page.goto(`/ressources/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    await expect(page.getByText(/non autorisée/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Mettre à jour/ })).toHaveCount(0);

    // Le modérateur peut modifier la ressource d'un autre, mais pas un outil officiel
    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto(`/ressources/edit/${BETA.id}`, { waitUntil: "networkidle" });
    await expect(fields(page).title).toHaveValue(BETA.title);
    await expect(submitButton(page, /Mettre à jour/)).toBeVisible();
    await page.goto(`/ressources/edit/${OFFICIAL.id}`, { waitUntil: "networkidle" });
    await expect(page.getByText(/non autorisée/).first()).toBeVisible();

    // L'administrateur modifie la description de l'outil officiel : son titre et son lien sont fixes, il reste validé
    await logout(page);
    await loginAs(page, ADMIN.id);
    await page.goto(`/ressources/edit/${OFFICIAL.id}`, { waitUntil: "networkidle" });
    const official = fields(page);
    await expect(official.title).toHaveValue(OFFICIAL.title);
    await expect(official.title).not.toBeEditable();
    await expect(official.link).not.toBeEditable();
    await official.description.fill("Description changée par l'administrateur.");
    await leaveField(page);
    await submitButton(page, /Mettre à jour/).click();
    await page.waitForURL(/\/ressources$/);
    await expect.poll(() => db((prisma) => prisma.resource.findUnique({ where: { id: OFFICIAL.id } }).then((resource) => resource && [resource.description, resource.status]))).toEqual(["Description changée par l'administrateur.", "APPROVED"]);
  });
});
