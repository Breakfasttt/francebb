/**
 * Inventaire de la refonte, section 6 « Connexion et compte » de docs/refonte/inventaire.md (carte 091) : la page de
 * connexion `/auth/login` (Discord, Google, lien magique par email, comptes de test du mode développement, paramètre
 * `callbackUrl`), la page « Vérifiez votre boîte mail » `/auth/verify-request`, la page d'erreur `/auth/error` et la
 * page d'inscription `/auth/onboarding` (pseudo, avatar, NAF, région, équipe, ligues, signature, thème, puis écran
 * de succès).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont
 * cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans
 * modification avant et après la refonte de ces écrans.
 *
 * Ce que le test ne fait pas : il ne suit pas la connexion par Discord, par Google ou par lien magique jusqu'au
 * bout, car elle passe par un service extérieur (le hub de connexion ou le fournisseur lui-même). Il vérifie que
 * ces boutons sont présents et utilisables, et vérifie le paramètre `callbackUrl` avec les comptes de test.
 * Il n'envoie pas non plus d'image d'avatar : l'envoi passe par le service extérieur ImgBB. Il vérifie seulement
 * que le bouton ouvre le choix d'un fichier.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Connexion … » :
 * - un nouveau membre qui n'a pas fini son inscription (remis à zéro avant chaque test) ;
 * - une ligue, pour la recherche de ligues de l'inscription ;
 * - une région de coach (données de référence), pour la liste « Région ».
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

const NEWCOMER_ID = "e2e_cnx_newcomer";
const LIGUE_ID = "e2e_cnx_ligue";
const REGION_KEY = "INV-CNX";

test.beforeAll(async () => {
  await db(async (prisma) => {
    await prisma.ligue.upsert({
      where: { id: LIGUE_ID },
      update: {},
      create: { id: LIGUE_ID, name: "Inv Connexion Ligue", acronym: "ICL", creatorId: E2E.coachId },
    });
    await prisma.referenceData.upsert({
      where: { group_key: { group: "COACH_REGION", key: REGION_KEY } },
      update: { isActive: true },
      create: { group: "COACH_REGION", key: REGION_KEY, label: "Inv Connexion Région", order: 99 },
    });
  });
});

test.beforeEach(async ({ page }) => {
  // Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  // Nouveau membre remis à zéro : inscription non terminée, aucun réglage
  await db((prisma) => prisma.user.upsert({
    where: { id: NEWCOMER_ID },
    update: {
      name: "Inv Connexion Nouveau", hasFinishedOnboarding: false, image: null, nafNumber: null, region: null,
      equipe: null, ligueCustom: null, signature: null, theme: "vestiaire", ligues: { set: [] },
    },
    create: { id: NEWCOMER_ID, name: "Inv Connexion Nouveau", email: "cnx-newcomer@e2e.test", hasFinishedOnboarding: false },
  }));
});

test.afterAll(async () => {
  await db(async (prisma) => {
    await prisma.user.deleteMany({ where: { id: NEWCOMER_ID } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE_ID } });
    await prisma.referenceData.deleteMany({ where: { group: "COACH_REGION", key: REGION_KEY } });
  });
});

/** Contenu propre à la page (la coquille, avec sa navigation et son pied de page, est en dehors). */
const content = (page: Page) => page.getByRole("main").first();

test.describe("connexion", () => {
  test("un visiteur voit Discord, Google et le lien magique", async ({ page }, testInfo) => {
    await page.goto("/auth/login", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: "Connexion", level: 1 })).toBeVisible();
    // Les tests tournent en mode hub (AUTH_MODE=hub dans .env) : les trois moyens sont proposés
    await expect(main.getByRole("button", { name: "Se connecter avec Discord" })).toBeEnabled();
    await expect(main.getByRole("button", { name: "Se connecter avec Google" })).toBeEnabled();
    const email = main.getByRole("textbox", { name: "Adresse email" });
    await expect(email).toBeEditable();
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("name", "email");
    await expect(main.getByRole("button", { name: "Recevoir un lien magique" })).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath("connexion.png"), fullPage: true });
  });

  test("un email déjà lié à un autre moyen de connexion est signalé", async ({ page }) => {
    await page.goto("/auth/login?error=OAuthAccountNotLinked", { waitUntil: "networkidle" });
    await expect(content(page).getByText("Cet email est déjà lié à un autre mode de connexion.")).toBeVisible();
  });

  test("les comptes de test du mode développement respectent callbackUrl", async ({ page }, testInfo) => {
    await page.goto(`/auth/login?callbackUrl=${encodeURIComponent("/forum")}`, { waitUntil: "networkidle" });
    const main = content(page);
    await main.getByRole("button", { name: /Mode Développement/ }).click();
    await expect(main.getByText(/comptes de test/i)).toBeVisible();
    await expect(main.getByRole("button", { name: /Créer un nouvel Admin de test/ })).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath("connexion-dev.png"), fullPage: true });
    // « Retour » referme la liste, puis on la rouvre
    await main.getByRole("button", { name: "Retour" }).click();
    await main.getByRole("button", { name: /Mode Développement/ }).click();
    await main.getByRole("button", { name: /Modo E2E/ }).first().click();
    await expect(page).toHaveURL(/\/forum$/);
  });

  test("un membre déjà connecté est renvoyé vers callbackUrl", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/auth/login?callbackUrl=${encodeURIComponent("/tournois")}`);
    await expect(page).toHaveURL(/\/tournois$/);
  });
});

test.describe("vérification de l'email et erreur", () => {
  test("« Vérifiez votre boîte mail » ramène à la connexion", async ({ page }, testInfo) => {
    await page.goto("/auth/verify-request", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: "Vérifiez votre boîte mail", level: 1 })).toBeVisible();
    await expect(main.getByText(/lien de connexion vient de vous être envoyé/)).toBeVisible();
    await expect(main.getByText(/messages indésirables/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("verification.png"), fullPage: true });
    await main.getByRole("link", { name: "Retour à la connexion" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test("la page d'erreur affiche un message lisible", async ({ page }, testInfo) => {
    await page.goto("/auth/error?error=Verification", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: "Erreur d'authentification", level: 1 })).toBeVisible();
    await expect(main.getByText("Le lien magique a expiré ou a déjà été utilisé.")).toBeVisible();
    await expect(main.getByText(/Verification/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("erreur.png"), fullPage: true });
    await main.getByRole("link", { name: "Retour à la page de connexion" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    // Erreur inconnue : message général
    await page.goto("/auth/error", { waitUntil: "networkidle" });
    await expect(content(page).getByText("Une erreur inattendue est survenue lors de l'authentification.")).toBeVisible();
  });
});

test.describe("inscription (onboarding)", () => {
  test("un nouveau membre remplit son profil puis entre sur le site", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await loginAs(page, NEWCOMER_ID);
    // Un membre qui n'a pas fini son inscription est renvoyé vers elle
    await page.goto("/forum");
    await expect(page).toHaveURL(/\/auth\/onboarding$/);
    await page.waitForLoadState("networkidle");
    const main = content(page);
    await expect(main.getByRole("heading", { name: "Bienvenue Coach !", level: 1 })).toBeVisible();

    // Avatar : aléatoire, puis générateur (graine et style), et choix d'une image à envoyer
    await main.getByRole("button", { name: "Aléatoire" }).click();
    const chooser = page.waitForEvent("filechooser");
    await main.getByRole("button", { name: "Envoyer une image" }).click();
    await chooser;
    await main.getByRole("button", { name: "Générer" }).click();
    const generator = page.getByRole("dialog", { name: /générateur d'avatar/i });
    await expect(generator).toBeVisible();
    await generator.getByRole("textbox", { name: "Graine" }).fill("inv-graine");
    for (const style of ["Aventurier", "Moderne", "Robot", "Smiley", "Lorelei", "Minimaliste", "Humain", "Pixel Art"]) {
      await expect(generator.getByRole("button", { name: style })).toBeVisible();
    }
    await generator.getByRole("button", { name: "Robot" }).click();
    await page.screenshot({ path: testInfo.outputPath("inscription-generateur.png") });
    await generator.getByRole("button", { name: "Confirmer" }).click();
    await expect(generator).toBeHidden();

    // Champs du profil
    await main.getByRole("textbox", { name: "Pseudo" }).fill("Inv Connexion Coach");
    await main.getByRole("textbox", { name: "Numéro NAF" }).fill("12345");
    await main.getByRole("combobox", { name: "Région" }).selectOption({ label: "Inv Connexion Région" });
    await main.getByRole("textbox", { name: "Équipe fétiche" }).fill("Inv Barons");

    // Ligues : une ligue référencée (recherche) et une ligue en saisie libre
    await main.getByRole("textbox", { name: "Rechercher une ligue référencée" }).fill("Inv Connexion");
    await main.getByText("Inv Connexion Ligue (ICL)").click();
    await expect(main.getByRole("button", { name: "Retirer ICL" })).toBeVisible();
    await main.getByRole("textbox", { name: "Autre ligue (saisie libre)" }).fill("Inv Ligue Libre");
    await main.getByRole("button", { name: "Ajouter cette ligue" }).click();
    await expect(main.getByRole("button", { name: "Retirer Inv Ligue Libre" })).toBeVisible();

    // Signature en BBCode
    await main.getByRole("textbox", { name: /Signature/ }).fill("[b]Inv signature[/b]");

    // Thème : appliqué tout de suite à la page
    await main.getByRole("button", { name: /Saison 3/ }).or(main.getByRole("radio", { name: /Saison 3/ })).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "saison3");
    await page.screenshot({ path: testInfo.outputPath("inscription.png"), fullPage: true });

    await main.getByRole("button", { name: "Valider mon profil et entrer" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/, { timeout: 30_000 });

    const saved = await db((prisma) => prisma.user.findUniqueOrThrow({ where: { id: NEWCOMER_ID }, include: { ligues: true } }));
    expect(saved).toMatchObject({
      hasFinishedOnboarding: true,
      name: "Inv Connexion Coach",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=inv-graine",
      nafNumber: "12345",
      region: REGION_KEY,
      equipe: "Inv Barons",
      ligueCustom: "Inv Ligue Libre",
      signature: "[b]Inv signature[/b]",
      theme: "saison3",
    });
    expect(saved.ligues.map((l) => l.id)).toEqual([LIGUE_ID]);

    // Inscription terminée : la page affiche l'écran de succès, qui mène au site
    await page.goto("/auth/onboarding", { waitUntil: "networkidle" });
    await expect(content(page).getByText("Votre profil est configuré avec succès.")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("inscription-succes.png"), fullPage: true });
    await content(page).getByRole("button", { name: "Entrer sur le site" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("le pseudo est obligatoire (3 caractères au moins)", async ({ page }) => {
    await loginAs(page, NEWCOMER_ID);
    await page.goto("/auth/onboarding", { waitUntil: "networkidle" });
    const pseudo = content(page).getByRole("textbox", { name: "Pseudo" });
    await expect(pseudo).toHaveAttribute("required", "");
    await expect(pseudo).toHaveAttribute("minlength", "3");
  });
});
