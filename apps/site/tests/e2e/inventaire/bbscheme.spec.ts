/**
 * Inventaire de la refonte, section 13 (BBScheme) de docs/refonte/inventaire.md (carte 100) : l'éditeur de schémas
 * `/bbscheme`, ouvert à tous, même sans compte. Le test vérifie le choix des rosters et les réserves des deux équipes,
 * les Star Players, « Remettre en réserve », les outils (sélection, crayon, gomme, baguette, ballon, annuler, tout
 * vider, désélectionner), les images de l'animation (ajouter, dupliquer, supprimer, précédente, suivante, compteur,
 * 50 au plus, lecture, vitesse), la vue (rotation, zoom par le curseur et la molette, plein écran), le partage (lien
 * `?id=` copié puis rechargé), l'export en GIF, l'aide, les paramètres d'adresse `&embed=true` et `&layout=vertical`,
 * et, en taille téléphone, le terrain vertical sans défilement horizontal de la page.
 * Le pincement à deux doigts est vérifié à part, par tests/e2e/bbscheme-pinch.spec.ts.
 *
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés
 * par leur rôle et leur nom accessible, jamais par une classe CSS : le test doit passer sans modification avant et après
 * la refonte de l'écran. Quelques adaptations de la façon de trouver un élément, pas de ce qui est attendu :
 * - un outil peut être dans la barre d'outils ou dans le panneau « Plus d'outils » (`control`) ;
 * - sur téléphone, la réserve d'une équipe s'ouvre par un bouton « Réserve bleue » ou « Réserve rouge » (`openReserve`) ;
 * - quelques commandes n'existaient avant la refonte que dans l'une des deux tailles (« Remettre en réserve » et
 *   « Désélectionner » sur téléphone, la rotation, le plein écran et le choix d'un Star Player sur ordinateur) :
 *   elles ne sont vérifiées que là où elles existaient déjà.
 *
 * Le seul plateau enregistré par le test (bouton « Partager ») est supprimé à la fin. Le plateau vide
 * `E2E.bbschemeBoardId`, créé par globalSetup, sert au mode `embed`.
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, withTestDb } from "../fixtures";

type Role = "button" | "slider" | "spinbutton" | "combobox";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

/** Ouvre l'éditeur et attend qu'il soit prêt (terrain et bouton de lecture affichés). */
async function openEditor(page: Page, path = "/bbscheme") {
  // Le bandeau des cookies couvre le bas de l'écran sur téléphone tant qu'il n'est pas accepté
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  await page.goto(path);
  // En développement, la pastille de Next.js (en bas à gauche) peut couvrir un bouton de la barre du bas
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await expect(page.getByRole("region", { name: "Terrain" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Lecture" }).filter({ visible: true }).first()).toBeVisible();
}

/**
 * Une commande de l'éditeur : visible dans la barre d'outils, ou rangée dans le panneau « Plus d'outils » (qui est
 * alors ouvert). Renvoie null si la commande n'existe pas dans cette taille d'écran.
 */
async function control(page: Page, role: Role, name: RegExp | string): Promise<Locator | null> {
  const direct = page.getByRole(role, { name, exact: typeof name === "string" }).filter({ visible: true });
  if ((await direct.count()) > 0) return direct.first();
  const more = page.getByRole("button", { name: /^Plus d'outils/ }).filter({ visible: true });
  if ((await more.count()) === 0) return null;
  await more.first().click();
  const panel = page.getByRole("dialog", { name: /Outils/ });
  await expect(panel).toBeVisible();
  const inside = panel.getByRole(role, { name, exact: typeof name === "string" });
  if ((await inside.count()) > 0) return inside.first();
  await closePanels(page);
  return null;
}

/** Une commande qui doit exister. */
async function mustControl(page: Page, role: Role, name: RegExp | string): Promise<Locator> {
  const found = await control(page, role, name);
  expect(found, `commande « ${name} »`).not.toBeNull();
  return found as Locator;
}

/** Ferme le panneau ou la fenêtre ouverts (outils, réserve, aide…), s'il y en a un. */
async function closePanels(page: Page) {
  const closeReserve = page.getByRole("button", { name: "Fermer la réserve" }).filter({ visible: true });
  if ((await closeReserve.count()) > 0) {
    await closeReserve.first().click();
    return;
  }
  const dialog = page.getByRole("dialog").filter({ visible: true });
  if ((await dialog.count()) > 0) {
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
}

const TEAM_NAME = { blue: "bleue", red: "rouge" } as const;

/** Affiche la réserve d'une équipe (toujours visible sur ordinateur, ouverte par un bouton sur téléphone). */
async function openReserve(page: Page, team: "blue" | "red"): Promise<Locator> {
  const reserve = page.getByRole("region", { name: `Réserve de l'équipe ${TEAM_NAME[team]}` });
  if (!(await reserve.isVisible())) {
    await page.getByRole("button", { name: new RegExp(`^Réserve ${TEAM_NAME[team]}`, "i") }).filter({ visible: true }).first().click();
  }
  await expect(reserve).toBeVisible();
  return reserve;
}

/** Choisit le roster d'une équipe et attend la notification de chargement. */
async function chooseRoster(page: Page, team: "blue" | "red", file: string) {
  const reserve = await openReserve(page, team);
  await reserve.getByRole("combobox", { name: `Roster de l'équipe ${TEAM_NAME[team]}` }).selectOption(file);
  await expect(page.getByText(new RegExp(`chargé pour l'équipe ${TEAM_NAME[team]}`)).first()).toBeVisible();
  await expect(reserve.getByRole("listitem", { name: "Star Player n° 100" })).toBeVisible();
  return reserve;
}

/**
 * Touche le terrain sur la case du ballon (colonne 13, ligne 7, au centre du terrain). Le terrain est tourné d'un quart
 * de tour sur téléphone ou avec `layout=vertical` : la colonne suit alors l'axe vertical.
 */
async function tapBallSquare(page: Page) {
  const box = await page.getByRole("group", { name: "Plateau" }).boundingBox();
  if (!box) throw new Error("Le plateau n'est pas affiché");
  const vertical = box.height > box.width;
  const square = Math.max(box.width, box.height) / 26.16;
  const x = box.x + box.width / 2 + (vertical ? 0 : square / 2);
  const y = box.y + box.height / 2 + (vertical ? square / 2 : 0);
  await page.mouse.click(x, y);
}

/** Le compteur d'images « n/N » affiché (avec ou sans espaces autour de la barre). */
const counter = (page: Page, current: number, total: number) =>
  page.getByText(new RegExp(`^\\s*${current}\\s*/\\s*${total}\\s*$`)).filter({ visible: true }).first();

test.describe("Inventaire — BBScheme", () => {
  test("rosters, réserves des deux équipes, Star Players et « Remettre en réserve »", async ({ page }, testInfo) => {
    await openEditor(page);

    const blue = await chooseRoster(page, "blue", "humans");
    await page.screenshot({ path: testInfo.outputPath("reserve-bleue.png") });
    await closePanels(page);
    await chooseRoster(page, "red", "orcs");
    await closePanels(page);

    // Star Player : sur ordinateur, le pion « Star Player » choisi dans la réserve se change en un Star Player précis
    if (!isPhone(page)) {
      await blue.getByRole("listitem", { name: "Star Player n° 100" }).click();
      const star = await mustControl(page, "combobox", "Star Player choisi");
      const options = await star.locator("option").allTextContents();
      expect(options.length).toBeGreaterThan(5);
      await star.selectOption({ index: 1 });
      await expect(page.getByText(/sélectionné !/).first()).toBeVisible();
      await closePanels(page);
    }

    // Placer un joueur de la réserve sur la case du ballon : il le ramasse
    const reserve = await openReserve(page, "blue");
    await reserve.getByRole("listitem").first().click();
    await closePanels(page);
    await tapBallSquare(page);
    await expect(page.getByText("Balle récupérée !").first()).toBeVisible();

    // « Remettre en réserve » (bouton sur téléphone avant la refonte, sur les deux tailles après)
    const back = await control(page, "button", "Remettre en réserve");
    if (back) {
      await back.click();
      await expect(page.getByText("Joueur remis en réserve").first()).toBeVisible();
    } else {
      expect(isPhone(page)).toBe(false);
    }
    await closePanels(page);
  });

  test("outils : sélection, crayon, gomme, baguette, ballon, annuler, tout vider, désélectionner", async ({ page }) => {
    await openEditor(page);

    for (const name of ["Crayon", "État du joueur", "Sélection"]) {
      const tool = await mustControl(page, "button", name);
      await tool.click();
      await closePanels(page);
      await expect(await mustControl(page, "button", name)).toHaveAttribute("aria-pressed", "true");
      await closePanels(page);
    }
    // La gomme (outil) ou l'effacement de tous les dessins
    await mustControl(page, "button", /^(Gomme|Effacer les dessins)$/);
    await closePanels(page);
    await mustControl(page, "button", /ballon/i);
    await closePanels(page);
    if (isPhone(page)) {
      await mustControl(page, "button", "Désélectionner");
      await closePanels(page);
    }

    // « Tout vider » demande une confirmation, puis « Annuler la dernière action » revient en arrière
    await (await mustControl(page, "button", "Tout vider")).click();
    const confirm = page.getByRole("dialog", { name: "Tout vider" });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Tout vider" }).click();
    await expect(page.getByText("Plateau tactique vidé").first()).toBeVisible();
    await expect(confirm).toBeHidden();
    const undo = await mustControl(page, "button", "Annuler la dernière action");
    await expect(undo).toBeEnabled();
    await undo.click();
    await expect(page.getByText("Action annulée").first()).toBeVisible();
  });

  test("images de l'animation : ajouter, naviguer, dupliquer, supprimer, 50 au plus, lecture et vitesse", async ({ page }) => {
    await openEditor(page);
    await expect(counter(page, 1, 1)).toBeVisible();

    await (await mustControl(page, "button", "Ajouter une image")).click();
    await expect(counter(page, 2, 2)).toBeVisible();
    await (await mustControl(page, "button", "Image précédente")).click();
    await expect(counter(page, 1, 2)).toBeVisible();
    await (await mustControl(page, "button", "Image suivante")).click();
    await expect(counter(page, 2, 2)).toBeVisible();

    await (await mustControl(page, "button", "Dupliquer l'image")).click();
    await closePanels(page);
    await expect(counter(page, 3, 3)).toBeVisible();
    await (await mustControl(page, "button", "Supprimer l'image")).click();
    await closePanels(page);
    await expect(counter(page, 2, 2)).toBeVisible();

    // Lecture puis pause
    await (await mustControl(page, "button", "Lecture")).click();
    const pause = await mustControl(page, "button", "Pause");
    await pause.click();
    await expect(await mustControl(page, "button", "Lecture")).toBeVisible();

    // Vitesse (délai entre deux images, en millisecondes)
    const speed = await mustControl(page, "spinbutton", "Vitesse de lecture (millisecondes)");
    await speed.fill("400");
    await expect(speed).toHaveValue("400");
    await closePanels(page);

    // 50 images au plus
    for (let total = 3; total <= 50; total++) {
      await (await mustControl(page, "button", "Ajouter une image")).click();
    }
    await expect(counter(page, 50, 50)).toBeVisible();
    await (await mustControl(page, "button", "Ajouter une image")).click();
    await expect(page.getByText("Limite de 50 images atteinte").first()).toBeVisible();
    await expect(counter(page, 50, 50)).toBeVisible();
  });

  test("vue : zoom par le curseur et la molette, rotation, plein écran", async ({ page }) => {
    await openEditor(page);
    const plateau = page.getByRole("group", { name: "Plateau" });
    // Taille du terrain au zoom de départ, une fois son ajustement à l'écran et son animation terminés
    const width = async () => (await plateau.boundingBox())?.width ?? 0;
    let before = 0;
    await expect.poll(async () => {
      const previous = before;
      await page.waitForTimeout(400);
      before = await width();
      return before > 0 && before === previous;
    }, { timeout: 15_000 }).toBe(true);

    const zoom = await mustControl(page, "slider", "Zoom du terrain");
    await zoom.fill("1.5");
    await expect(zoom).toHaveValue("1.5");
    await closePanels(page);
    await expect.poll(width).toBeGreaterThan(before * 1.3);

    if (isPhone(page)) {
      // Sur téléphone, le terrain est toujours vertical
      const box = await plateau.boundingBox();
      expect(box!.height).toBeGreaterThan(box!.width);
      return;
    }

    // Molette de la souris sur le terrain
    const area = await page.getByRole("region", { name: "Terrain" }).boundingBox();
    await page.mouse.move(area!.x + area!.width / 2, area!.y + area!.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(async () => parseFloat(await (await mustControl(page, "slider", "Zoom du terrain")).inputValue())).toBeLessThan(1.5);

    // Rotation d'un quart de tour : le terrain devient vertical
    let box = await plateau.boundingBox();
    expect(box!.width).toBeGreaterThan(box!.height);
    const rotate = await mustControl(page, "button", "Tourner le terrain");
    await rotate.click();
    await expect(rotate).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => {
      box = await plateau.boundingBox();
      return box!.height > box!.width;
    }).toBe(true);

    await mustControl(page, "button", "Plein écran");
  });

  test("partager, recharger le lien ?id=, exporter en GIF, infos et aide", async ({ page, context }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openEditor(page);
    await (await mustControl(page, "button", "Ajouter une image")).click();
    await expect(counter(page, 2, 2)).toBeVisible();

    // « Partager » enregistre le plateau et copie son lien
    await (await mustControl(page, "button", "Partager")).click();
    await expect(page.getByText("Lien de partage copié !").first()).toBeVisible({ timeout: 15_000 });
    const link = await page.evaluate(() => navigator.clipboard.readText());
    const id = link.match(/\/bbscheme\?id=([\w-]+)/)?.[1];
    expect(id, `lien copié : ${link}`).toBeTruthy();

    try {
      // Infos des joueurs (bulles d'aide) : bouton à deux états
      const infos = await mustControl(page, "button", "Afficher les infos des joueurs");
      const pressed = await infos.getAttribute("aria-pressed");
      await infos.click();
      await closePanels(page);
      await expect(await mustControl(page, "button", "Afficher les infos des joueurs")).toHaveAttribute("aria-pressed", pressed === "true" ? "false" : "true");
      await closePanels(page);

      // Aide
      await (await mustControl(page, "button", "Aide")).click();
      const help = page.getByRole("dialog", { name: /Guide/ });
      await expect(help).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("aide.png") });
      await closePanels(page);

      // Export en GIF : barre de progression, puis « Télécharger »
      await (await mustControl(page, "button", "Exporter en GIF")).click();
      const exportDialog = page.getByRole("dialog", { name: /GIF/ });
      await expect(exportDialog).toBeVisible();
      await expect(exportDialog.getByRole("button", { name: /Télécharger/ })).toBeVisible({ timeout: 45_000 });
      await page.screenshot({ path: testInfo.outputPath("export-gif.png") });
      await exportDialog.getByRole("button", { name: "Fermer", exact: true }).last().click();
      await expect(exportDialog).toBeHidden();

      // Le lien recharge le plateau partagé (deux images)
      await openEditor(page, `/bbscheme?id=${id}`);
      await expect(counter(page, 1, 2)).toBeVisible({ timeout: 20_000 });
    } finally {
      await withTestDb((prisma) => prisma.bBSchemeState.deleteMany({ where: { id } }));
    }
  });

  test("paramètres d'adresse : &embed=true affiche le lecteur seul, &layout=vertical tourne le terrain", async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
    await page.goto(`/bbscheme?id=${E2E.bbschemeBoardId}&embed=true`);
    await expect(page.getByRole("button", { name: "Lecture" }).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    // Le lecteur seul : aucun outil d'édition
    await expect(page.getByRole("button", { name: "Partager" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Tout vider" })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("embed.png") });

    await openEditor(page, "/bbscheme?layout=vertical");
    const plateau = page.getByRole("group", { name: "Plateau" });
    await expect.poll(async () => {
      const box = await plateau.boundingBox();
      return box ? box.height > box.width : false;
    }).toBe(true);
  });

  test("téléphone : terrain vertical, réserves, cibles de 44 pixels, pas de défilement horizontal", async ({ page }, testInfo) => {
    test.skip(!isPhone(page), "vérification propre à la taille téléphone");
    await openEditor(page);
    const plateau = page.getByRole("group", { name: "Plateau" });
    await expect.poll(async () => {
      const box = await plateau.boundingBox();
      return box ? box.height > box.width : false;
    }).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("telephone.png") });

    // Pas de défilement horizontal de la page
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);

    // Boutons visibles d'au moins 44 pixels de haut et de large
    const buttons = page.getByRole("button").filter({ visible: true });
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      if (!box) continue;
      const name = (await button.getAttribute("aria-label")) ?? (await button.textContent());
      // Les pastilles de développement (« Dev Auth », outils de Next.js) n'existent pas sur le site en ligne
      if (/^\s*Dev\b|Next\.js/.test(name ?? "")) continue;
      expect(box.height, `hauteur du bouton « ${name} »`).toBeGreaterThanOrEqual(44);
      expect(box.width, `largeur du bouton « ${name} »`).toBeGreaterThanOrEqual(44);
    }

    // Les deux réserves s'ouvrent et se referment
    for (const team of ["blue", "red"] as const) {
      const reserve = await openReserve(page, team);
      await expect(reserve.getByRole("combobox", { name: `Roster de l'équipe ${TEAM_NAME[team]}` })).toBeVisible();
      await closePanels(page);
      await expect(reserve).toBeHidden();
    }
  });
});
