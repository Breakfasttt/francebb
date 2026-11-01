/**
 * Carte 068 : zoom du terrain de BBScheme au pincement à deux doigts, en taille téléphone.
 *
 * Playwright ne sait pas poser deux doigts avec ses commandes habituelles : le test passe par le protocole
 * de pilotage de Chrome (CDP, « Chrome DevTools Protocol ») et sa commande `Input.dispatchTouchEvent`,
 * qui simule de vrais contacts tactiles. Le test ne lit ni n'écrit rien dans la base.
 */
import { test, expect, type CDPSession, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });

type Point = { x: number; y: number };

const touch = (cdp: CDPSession, type: "touchStart" | "touchMove" | "touchEnd", points: Point[]) =>
  cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: points.map((p, index) => ({ x: p.x, y: p.y, id: index })),
  });

/** Pose deux doigts autour de `center`, écartés de `from` pixels, puis les amène à `to` pixels d'écart. */
async function pinch(cdp: CDPSession, center: Point, from: number, to: number) {
  const fingers = (gap: number): Point[] => [
    { x: center.x - gap / 2, y: center.y },
    { x: center.x + gap / 2, y: center.y },
  ];
  await touch(cdp, "touchStart", fingers(from));
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await touch(cdp, "touchMove", fingers(from + ((to - from) * i) / steps));
  }
  await touch(cdp, "touchEnd", []);
}

/**
 * Ouvre l'éditeur et renvoie le centre du terrain et une fonction qui lit le zoom.
 * Depuis la carte 100, le curseur de zoom est rangé, sur téléphone, dans le panneau « Plus d'outils » : le zoom est
 * donc lu sur la largeur demandée au terrain (style de `.pitch-resizer`, proportionnelle au zoom), divisée par sa
 * largeur au zoom de départ (1).
 */
async function openEditor(page: Page) {
  await page.goto("/bbscheme");
  const viewport = page.locator(".pitch-viewport");
  await expect(viewport).toBeVisible({ timeout: 20_000 });
  const resizer = page.locator(".pitch-resizer");
  const styleWidth = () => resizer.evaluate((el) => parseFloat((el as HTMLElement).style.width));
  // Le terrain s'ajuste à la place disponible juste après l'affichage : on attend que sa largeur ne bouge plus
  let base = 0;
  await expect.poll(async () => {
    const previous = base;
    await page.waitForTimeout(300);
    base = await styleWidth();
    return base > 0 && base === previous;
  }, { timeout: 10_000 }).toBe(true);
  const box = await viewport.boundingBox();
  if (!box) throw new Error("Le terrain n'est pas affiché");
  const center = { x: box.x + box.width / 2, y: box.y + Math.min(box.height / 2, 150) };
  const zoom = async () => Math.round(((await styleWidth()) / base) * 1000) / 1000;
  return { center, zoom };
}

test("écarter puis rapprocher deux doigts change le zoom du terrain, pas celui de la page", async ({ page }) => {
  const { center, zoom } = await openEditor(page);
  const cdp = await page.context().newCDPSession(page);
  const initial = await zoom();

  await pinch(cdp, center, 60, 200);
  await expect.poll(zoom).toBeGreaterThan(initial);
  const enlarged = await zoom();
  expect(enlarged).toBeLessThanOrEqual(2);

  await pinch(cdp, center, 200, 60);
  await expect.poll(zoom).toBeLessThan(enlarged);
  expect(await zoom()).toBeGreaterThanOrEqual(0.5);

  // Le navigateur n'a pas zoomé toute la page à la place du terrain.
  expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
});

test("un seul doigt fait toujours défiler le terrain agrandi", async ({ page }) => {
  const { center, zoom } = await openEditor(page);
  const cdp = await page.context().newCDPSession(page);

  // On agrandit d'abord, pour que le terrain dépasse de son cadre et puisse défiler.
  await pinch(cdp, center, 40, 300);
  await expect.poll(zoom).toBeGreaterThan(1.5);
  const viewport = page.locator(".pitch-viewport");
  // Les animations de taille se terminent avant la mesure.
  await page.waitForTimeout(800);
  const before = await viewport.evaluate((el) => ({ left: el.scrollLeft, top: el.scrollTop }));

  await touch(cdp, "touchStart", [center]);
  for (let i = 1; i <= 8; i++) {
    await touch(cdp, "touchMove", [{ x: center.x - i * 10, y: center.y - i * 10 }]);
  }
  await touch(cdp, "touchEnd", []);

  await expect
    .poll(() => viewport.evaluate((el) => el.scrollLeft + el.scrollTop))
    .not.toBe(before.left + before.top);
  // Le défilement à un doigt ne touche pas au zoom.
  expect(await zoom()).toBeGreaterThan(1.5);
});
