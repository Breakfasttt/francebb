/**
 * Inventaire de la refonte, section 2 (l'éditeur BBCode) et sections 3.4 (page de réponse), 3.5 (modifier un
 * message) et 3.6 (nouveau sujet) de docs/refonte/inventaire.md, plus la réponse rapide d'un sujet (carte 087).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont
 * cherchés par leur rôle et leur nom accessible, jamais par une classe CSS : le test doit passer sans modification
 * avant et après la refonte de l'éditeur.
 *
 * Un outil de l'éditeur peut être affiché directement dans la barre d'outils, ou rangé dans le panneau « Plus
 * d'outils de mise en forme » : la petite fonction d'aide `applyTool` cherche aux deux endroits. C'est une adaptation
 * de la façon de trouver l'outil, pas un changement de ce qui est attendu. Chaque outil est vérifié par le code
 * BBCode exact qu'il insère dans la zone de texte.
 *
 * Données préparées par le test (et supprimées à la fin) :
 * - deux membres : celui qui écrit, et un membre à mentionner ;
 * - un sujet de 4 messages (le rappel n'en montre que les 3 derniers), un sujet à lier par l'outil « sujet du
 *   forum », un petit sujet pour la réponse rapide et un sous-forum verrouillé.
 *
 * Aucun appel réseau vers l'extérieur : l'envoi d'image passe par le serveur du site, qui renvoie en test une adresse
 * factice sans appeler ImgBB (variable E2E_FAKE_IMAGE_UPLOAD de playwright.config.ts, carte 141), et les boutons qui
 * ouvrent Gemini, Claude ou ChatGPT sont seulement vérifiés, pas cliqués.
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const WRITER = { id: "e2e_edi_membre", name: "Membre Editeur Inv" };
const TARGET = { id: "e2e_edi_cible", name: "Cible Mention Inv" };

const TOPIC = { id: "e2e_edi_topic", title: "Inv éditeur sujet principal" };
const postId = (n: number) => `e2e_edi_p${n}`;
const LINKED = { id: "e2e_edi_lie", title: "Inv éditeur sujet à lier" };
const QUICK_TOPIC = "e2e_edi_rapide";
const LOCKED_FORUM = { id: "e2e_edi_forum_verrou", name: "Inv Éditeur Forum Verrouillé" };

const MORE_TOOLS = "Plus d'outils de mise en forme";
const REPLY_PLACEHOLDER = "Tapez votre réponse ici...";

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await withTestDb(async (prisma) => {
    const users = [WRITER.id, TARGET.id];
    const topicWhere = {
      OR: [{ id: { startsWith: "e2e_edi_" } }, { forumId: LOCKED_FORUM.id }, { title: { startsWith: "Inv éditeur créé" } }],
    };
    await prisma.topicView.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.topicFollow.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.mention.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { mentionedUserId: { in: users } }] } });
    await prisma.postReaction.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { userId: { in: users } }] } });
    await prisma.post.deleteMany({ where: { OR: [{ topic: topicWhere }, { authorId: { in: users } }] } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.forum.deleteMany({ where: { id: LOCKED_FORUM.id } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    await prisma.user.create({ data: { id: WRITER.id, name: WRITER.name, email: "membre-editeur@e2e.test", hasFinishedOnboarding: true } });
    await prisma.user.create({ data: { id: TARGET.id, name: TARGET.name, email: "cible-editeur@e2e.test", hasFinishedOnboarding: true } });
    await prisma.forum.create({ data: { ...LOCKED_FORUM, parentForumId: E2E.forumId, isLocked: true, order: 51 } });

    // Dates dans le passé, une minute entre deux messages : l'ordre d'affichage est celui des numéros
    const base = Date.now() - 2 * 24 * 60 * 60_000;
    const at = (minutes: number) => new Date(base + minutes * 60_000);
    const topic = (id: string, title: string) =>
      prisma.topic.create({ data: { id, title, forumId: E2E.forumId, authorId: WRITER.id, createdAt: at(0), updatedAt: at(0) } });
    const post = (id: string, topicId: string, minute: number, content: string, authorId = WRITER.id) =>
      prisma.post.create({ data: { id, topicId, content, authorId, createdAt: at(minute), updatedAt: at(minute) } });

    await topic(TOPIC.id, TOPIC.title);
    await post(postId(1), TOPIC.id, 1, "Message un, trop ancien pour le rappel", E2E.coachId);
    await post(postId(2), TOPIC.id, 2, "Message deux à citer");
    await post(postId(3), TOPIC.id, 3, "Message trois du rappel", E2E.coachId);
    await post(postId(4), TOPIC.id, 4, "Message quatre à modifier");
    await topic(LINKED.id, LINKED.title);
    await post("e2e_edi_l1", LINKED.id, 1, "Message du sujet à lier");
    await topic(QUICK_TOPIC, "Inv éditeur réponse rapide");
    await post("e2e_edi_r1", QUICK_TOPIC, 1, "Message du sujet de réponse rapide");
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

/** Ouvre la page de réponse du sujet principal, connecté comme le membre qui écrit, et renvoie la zone de texte. */
async function openReply(page: Page): Promise<Locator> {
  await loginAs(page, WRITER.id);
  await page.goto(`/forum/topic/${TOPIC.id}/reply`, { waitUntil: "networkidle" });
  const textarea = page.getByRole("textbox", { name: REPLY_PLACEHOLDER });
  await expect(textarea).toBeVisible();
  return textarea;
}

/**
 * Déclenche un outil de l'éditeur : directement dans la barre d'outils s'il y est visible, sinon par le panneau
 * « Plus d'outils de mise en forme » (panneau qui monte du bas sur téléphone, menu sur ordinateur).
 */
async function applyTool(page: Page, name: string) {
  const direct = page.getByRole("button", { name, exact: true }).filter({ visible: true });
  if ((await direct.count()) === 0) {
    await page.getByRole("button", { name: MORE_TOOLS }).filter({ visible: true }).first().click();
    await expect(direct.first()).toBeVisible();
  }
  await direct.first().click();
}

/** Bouton visible de ce nom (dans la page ou dans un panneau ouvert). */
const visibleButton = (page: Page, name: string | RegExp) => page.getByRole("button", { name, exact: typeof name === "string" }).filter({ visible: true }).first();
/** Champ de saisie visible de ce nom. */
const field = (page: Page, name: string) => page.getByRole("textbox", { name, exact: true }).filter({ visible: true }).first();

/** Vide la zone de texte, écrit `text` et le sélectionne entièrement (un outil l'entoure alors de ses balises). */
async function writeAndSelect(textarea: Locator, text: string) {
  await textarea.fill(text);
  await textarea.selectText();
}

test.describe("2 éditeur BBCode : outils", () => {
  test("[membre] gras, italique, souligné, barré, trait horizontal, tableau, bloc de code", async ({ page }, testInfo) => {
    const textarea = await openReply(page);
    await page.screenshot({ path: testInfo.outputPath("reponse.png"), fullPage: false });

    for (const [name, tag] of [["Gras", "b"], ["Italique", "i"], ["Souligné", "u"], ["Barré", "s"], ["Bloc de code", "code"]]) {
      await writeAndSelect(textarea, "mot");
      await applyTool(page, name);
      await expect(textarea).toHaveValue(`[${tag}]mot[/${tag}]`);
    }

    await textarea.fill("");
    await applyTool(page, "Trait horizontal");
    await expect(textarea).toHaveValue("[hr]");

    await textarea.fill("");
    await applyTool(page, "Tableau");
    await expect(textarea).toHaveValue(/^\[table\]\n\[tr\]\n\[th\].*\[\/th\][\s\S]*\[td\].*\[\/td\][\s\S]*\[\/table\]$/);
  });

  test("[membre] taille du texte, couleur, listes, alignement, exposant et indice", async ({ page }, testInfo) => {
    const textarea = await openReply(page);

    // Six tailles
    for (const size of ["0.7rem", "0.85rem", "1rem", "1.25rem", "1.5rem", "2rem"]) {
      await writeAndSelect(textarea, "mot");
      await applyTool(page, "Taille du texte");
      await page.screenshot({ path: testInfo.outputPath("outil-taille.png"), fullPage: false });
      await visibleButton(page, size).click();
      await expect(textarea).toHaveValue(`[size=${size}]mot[/size]`);
    }

    // Dix pastilles de couleur
    const colors: [string, string][] = [
      ["Rouge", "#ef4444"], ["Orange", "#f97316"], ["Jaune", "#eab308"], ["Vert", "#22c55e"], ["Cyan", "#06b6d4"],
      ["Bleu", "#3b82f6"], ["Violet", "#a855f7"], ["Rose", "#ec4899"], ["Gris", "#9ca3af"], ["Blanc", "#ffffff"],
    ];
    await writeAndSelect(textarea, "mot");
    await applyTool(page, "Couleur du texte");
    for (const [name] of colors) await expect(visibleButton(page, name)).toBeVisible();
    await visibleButton(page, "Rouge").click();
    await expect(textarea).toHaveValue("[color=#ef4444]mot[/color]");
    for (const [name, hex] of colors.slice(1)) {
      await writeAndSelect(textarea, "mot");
      await applyTool(page, "Couleur du texte");
      await visibleButton(page, name).click();
      await expect(textarea).toHaveValue(`[color=${hex}]mot[/color]`);
    }

    // Quatre sortes de listes
    for (const [name, open] of [["Points (•)", "[list]"], ["Tirets (-)", "[list=-]"], ["Numéros (1.)", "[list=1]"], ["Lettres (a.)", "[list=a]"]]) {
      await textarea.fill("");
      await applyTool(page, "Liste");
      await visibleButton(page, name).click();
      await expect(textarea).toHaveValue(`${open}\n[*] \n[/list]`);
    }

    // Alignement : centré, à droite, justifié
    for (const [name, tag] of [["Centrer le texte", "center"], ["Aligner à droite", "right"], ["Justifier", "justify"]]) {
      await writeAndSelect(textarea, "mot");
      await applyTool(page, "Alignement du texte");
      await visibleButton(page, name).click();
      await expect(textarea).toHaveValue(`[${tag}]mot[/${tag}]`);
    }

    // Exposant et indice
    for (const [name, tag] of [["Exposant", "sup"], ["Indice", "sub"]]) {
      await writeAndSelect(textarea, "mot");
      await applyTool(page, "Exposant et indice");
      await visibleButton(page, name).click();
      await expect(textarea).toHaveValue(`[${tag}]mot[/${tag}]`);
    }
  });

  test("[membre] lien (adresse et texte, ou texte sélectionné), sujet du forum, mention par bouton et par @, Échap", async ({ page }, testInfo) => {
    const textarea = await openReply(page);

    // Lien : adresse et texte saisis
    await textarea.fill("");
    await applyTool(page, "Ajouter un lien");
    await field(page, "Adresse du lien").fill("https://bbfrance.example/regles");
    await field(page, "Texte affiché (facultatif)").fill("Les règles");
    await page.screenshot({ path: testInfo.outputPath("outil-lien.png"), fullPage: false });
    await visibleButton(page, "Insérer le lien").click();
    await expect(textarea).toHaveValue("[url=https://bbfrance.example/regles]Les règles[/url]");

    // Lien : le texte sélectionné devient le texte du lien
    await writeAndSelect(textarea, "BBFrance");
    await applyTool(page, "Ajouter un lien");
    await expect(field(page, "Texte affiché (facultatif)")).toHaveValue("BBFrance");
    await field(page, "Adresse du lien").fill("https://bbfrance.example");
    await visibleButton(page, "Insérer le lien").click();
    await expect(textarea).toHaveValue("[url=https://bbfrance.example]BBFrance[/url]");

    // Échap ferme l'outil ouvert
    await applyTool(page, "Ajouter un lien");
    await expect(field(page, "Adresse du lien")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("textbox", { name: "Adresse du lien" })).toBeHidden();

    // Lien vers un sujet du forum, trouvé par la recherche
    await textarea.fill("");
    await applyTool(page, "Lien vers un sujet du forum");
    await field(page, "Rechercher un sujet du forum").fill("éditeur sujet à lier");
    await visibleButton(page, new RegExp(LINKED.title)).click();
    await visibleButton(page, "Insérer le lien du sujet").click();
    await expect(textarea).toHaveValue(`[topic=${LINKED.id}]${LINKED.title}[/topic]`);

    // Mention par le bouton
    await textarea.fill("");
    await applyTool(page, "Mentionner un membre");
    await field(page, "Rechercher un membre").fill("Cible Mention");
    await visibleButton(page, TARGET.name).click();
    await expect(textarea).toHaveValue(`[mention=${TARGET.id}]${TARGET.name}[/mention] `);

    // Mention en tapant @ dans la zone de texte
    await textarea.fill("Bonjour ");
    await textarea.press("End");
    await textarea.press("@");
    const search = field(page, "Rechercher un membre");
    await expect(search).toBeVisible();
    await search.fill("Cible Mention");
    await page.screenshot({ path: testInfo.outputPath("outil-mention.png"), fullPage: false });
    await visibleButton(page, TARGET.name).click();
    await expect(textarea).toHaveValue(`Bonjour [mention=${TARGET.id}]${TARGET.name}[/mention] `);
  });

  test("[membre] image (adresse, options, envoi de fichier), galerie, vidéo YouTube, schéma BBScheme", async ({ page }, testInfo) => {
    // Envoi d'image simulé par le serveur en test (carte 141) : aucune image ne part vraiment
    const textarea = await openReply(page);

    // Image par adresse, centrée en taille réduite : pas d'option dans la balise
    await textarea.fill("");
    await applyTool(page, "Ajouter une image");
    await field(page, "Adresse de l'image").fill("https://img.example/a.png");
    await page.screenshot({ path: testInfo.outputPath("outil-image.png"), fullPage: false });
    await visibleButton(page, "Insérer l'image").click();
    await expect(textarea).toHaveValue("[img]https://img.example/a.png[/img]");

    // Image à gauche, texte habillé autour, taille réelle
    await textarea.fill("");
    await applyTool(page, "Ajouter une image");
    await field(page, "Adresse de l'image").fill("https://img.example/b.png");
    await visibleButton(page, "Gauche").click();
    await visibleButton(page, "Taille réduite").click();
    await visibleButton(page, "Habiller le texte autour").click();
    await visibleButton(page, "Insérer l'image").click();
    await expect(textarea).toHaveValue("[img align=left wrap=yes thumb=no]https://img.example/b.png[/img]");

    // Envoi d'un fichier depuis l'appareil (à droite)
    await textarea.fill("");
    await applyTool(page, "Ajouter une image");
    await visibleButton(page, "Droite").click();
    const chooser = page.waitForEvent("filechooser");
    await visibleButton(page, "Envoyer une image depuis l'appareil").click();
    await (await chooser).setFiles({ name: "envoi.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
    await expect(textarea).toHaveValue("[img align=right wrap=no]https://i.ibb.co/e2e/envoi.png[/img]");

    // Galerie
    await textarea.fill("");
    await applyTool(page, "Galerie d'images");
    await field(page, "Adresses des images").fill("https://img.example/1.png, https://img.example/2.png");
    await visibleButton(page, "Créer la galerie").click();
    await expect(textarea).toHaveValue("[gallery]https://img.example/1.png, https://img.example/2.png[/gallery]");

    // Vidéo YouTube, avec les mêmes options
    await textarea.fill("");
    await applyTool(page, "Vidéo YouTube");
    await field(page, "Adresse ou identifiant de la vidéo").fill("dQw4w9WgXcQ");
    await visibleButton(page, "Insérer la vidéo").click();
    await expect(textarea).toHaveValue("[youtube]dQw4w9WgXcQ[/youtube]");
    await textarea.fill("");
    await applyTool(page, "Vidéo YouTube");
    await field(page, "Adresse ou identifiant de la vidéo").fill("dQw4w9WgXcQ");
    await visibleButton(page, "Droite").click();
    await visibleButton(page, "Habiller le texte autour").click();
    await visibleButton(page, "Taille réduite").click();
    await visibleButton(page, "Insérer la vidéo").click();
    await expect(textarea).toHaveValue("[youtube align=right wrap=yes thumb=no]dQw4w9WgXcQ[/youtube]");

    // Schéma BBScheme, à l'horizontale puis à la verticale
    await textarea.fill("");
    await applyTool(page, "Schéma BBScheme");
    await field(page, "Adresse ou identifiant du schéma").fill("schema123");
    await visibleButton(page, "Insérer le schéma").click();
    await expect(textarea).toHaveValue("[bbscheme]schema123[/bbscheme]");
    await textarea.fill("");
    await applyTool(page, "Schéma BBScheme");
    await field(page, "Adresse ou identifiant du schéma").fill("schema123");
    await visibleButton(page, "Vertical").click();
    await visibleButton(page, "Insérer le schéma").click();
    await expect(textarea).toHaveValue("[bbscheme=vertical]schema123[/bbscheme]");
  });

  test("[membre] spoiler (titre facultatif), accordéon, smileys", async ({ page }, testInfo) => {
    const textarea = await openReply(page);

    await textarea.fill("");
    await applyTool(page, "Spoiler (texte caché)");
    await field(page, "Titre (facultatif)").fill("Attention");
    await field(page, "Texte à cacher").fill("Le secret");
    await visibleButton(page, "Insérer le spoiler").click();
    await expect(textarea).toHaveValue("[spoiler=Attention]Le secret[/spoiler]");

    // Sans titre, le texte sélectionné est caché
    await writeAndSelect(textarea, "caché");
    await applyTool(page, "Spoiler (texte caché)");
    await visibleButton(page, "Insérer le spoiler").click();
    await expect(textarea).toHaveValue("[spoiler]caché[/spoiler]");

    await textarea.fill("");
    await applyTool(page, "Accordéon (bloc repliable)");
    await field(page, "Titre de l'accordéon").fill("Composition");
    await expect(field(page, "Titre de l'accordéon")).toHaveValue("Composition");
    // Le champ est quitté avant l'appui : sur l'ancienne version en taille téléphone, la barre basse réapparaissait
    // au moment de l'appui, la page bougeait sous le doigt et l'appui tombait à côté du bouton
    await field(page, "Titre de l'accordéon").blur();
    await visibleButton(page, "Insérer l'accordéon").click();
    await expect(textarea).toHaveValue("[accordion=Composition][/accordion]");

    await textarea.fill("Salut ");
    await textarea.press("End");
    await applyTool(page, "Smileys");
    await page.screenshot({ path: testInfo.outputPath("outil-smileys.png"), fullPage: false });
    await visibleButton(page, "🙂").click();
    await expect(textarea).toHaveValue("Salut :)");
  });

  test("[membre] aperçu du rendu et assistant de mise en forme par IA", async ({ page, context }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const textarea = await openReply(page);

    await textarea.fill("[b]Texte en gras de l'aperçu[/b]");
    await visibleButton(page, "Aperçu").click();
    await expect(page.getByText("Texte en gras de l'aperçu", { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("apercu.png"), fullPage: false });
    await visibleButton(page, "Aperçu").click();
    await expect(page.getByText("Texte en gras de l'aperçu", { exact: true })).toBeHidden();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue("[b]Texte en gras de l'aperçu[/b]");

    // L'assistant prépare une consigne qui contient le texte du membre, à copier ou à ouvrir dans une IA
    await textarea.fill("Mon texte pour l'assistant");
    await applyTool(page, "Assistant de mise en forme par IA");
    const dialog = page.getByRole("dialog", { name: /Assistant/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Mon texte pour l'assistant/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Gemini/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Claude/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /ChatGPT/ })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("assistant-ia.png"), fullPage: false });
    await dialog.getByRole("button", { name: "Copier le prompt" }).click();
    await expect(page.getByText(/Prompt copié/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("[membre] compteur de caractères quand une longueur maximale est fixée (signature du profil)", async ({ page }) => {
    await loginAs(page, WRITER.id);
    await page.goto("/profile?tab=edit", { waitUntil: "networkidle" });
    await expect(page.getByText("0 / 250", { exact: true })).toBeVisible();
    const counter = page.getByText(/^\d+ \/ 250$/);
    const signature = page.getByRole("textbox", { name: /Signature du forum/ });
    await signature.fill("Signature de test");
    await expect(counter).toHaveText("17 / 250");
  });
});

test.describe("3.4 page de réponse", () => {
  test("[visiteur] est renvoyé vers le sujet", async ({ page }) => {
    await page.goto(`/forum/topic/${TOPIC.id}/reply`);
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}(\\?|$)`));
  });

  test("[membre] éditeur, rappel des 3 derniers messages, « Annuler » et « Publier ma réponse »", async ({ page }, testInfo) => {
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/topic/${TOPIC.id}?page=1`, { waitUntil: "networkidle" });
    await page.goto(`/forum/topic/${TOPIC.id}/reply`, { waitUntil: "networkidle" });
    const textarea = page.getByRole("textbox", { name: REPLY_PLACEHOLDER });
    await expect(textarea).toBeVisible();

    await expect(page.getByText("Rappel des derniers messages")).toBeVisible();
    for (const text of ["Message deux à citer", "Message trois du rappel", "Message quatre à modifier"]) {
      await expect(page.getByText(text)).toBeVisible();
    }
    await expect(page.getByText("Message un, trop ancien pour le rappel")).toHaveCount(0);

    // « Annuler » ramène au sujet
    await visibleButton(page, "Annuler").or(page.getByRole("link", { name: "Annuler" }).filter({ visible: true })).first().click();
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}\\?page=1`));

    // Publier : retour au sujet, le nouveau message est affiché
    await page.goto(`/forum/topic/${TOPIC.id}/reply`, { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: REPLY_PLACEHOLDER }).fill("Réponse publiée par l'inventaire de l'éditeur");
    await page.screenshot({ path: testInfo.outputPath("reponse-remplie.png"), fullPage: false });
    await visibleButton(page, "Publier ma réponse").click();
    await page.waitForURL(new RegExp(`/forum/topic/${TOPIC.id}(\\?|$)`));
    await expect(page.getByText("Réponse publiée par l'inventaire de l'éditeur")).toBeVisible({ timeout: 20_000 });
  });

  test("[membre] ?quotePostId= préremplit la citation", async ({ page }) => {
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/topic/${TOPIC.id}/reply?quotePostId=${postId(2)}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("textbox", { name: REPLY_PLACEHOLDER })).toHaveValue(
      `[quote=${WRITER.id}|${postId(2)}|${WRITER.name}]Message deux à citer[/quote]\n`
    );
  });
});

test.describe("3.5 modifier un message", () => {
  test("[auteur] éditeur prérempli, rappel avec « (Ce message) », « Annuler », enregistrement puis retour au message", async ({ page }, testInfo) => {
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/post/${postId(4)}/edit`, { waitUntil: "networkidle" });
    const textarea = page.getByRole("textbox", { name: "Modifiez votre message ici..." });
    await expect(textarea).toHaveValue("Message quatre à modifier");
    await expect(page.getByText("Rappel des derniers messages")).toBeVisible();
    await expect(page.getByText("(Ce message)")).toBeVisible();
    await expect(visibleButton(page, "Annuler").or(page.getByRole("link", { name: "Annuler" }).filter({ visible: true })).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("modification.png"), fullPage: false });

    await textarea.fill("Message quatre modifié par l'inventaire");
    await visibleButton(page, "Enregistrer les modifications").click();
    await page.waitForURL(new RegExp(`/forum/topic/${TOPIC.id}\\?page=1#post-${postId(4)}$`));
    await expect(page.locator(`[id="post-${postId(4)}"]`).getByText("Message quatre modifié par l'inventaire")).toBeVisible();
  });

  test("[modo] peut modifier le message d'un autre ; [membre] un autre est renvoyé vers le sujet", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/post/${postId(3)}/edit`, { waitUntil: "networkidle" });
    await expect(page.getByRole("textbox", { name: "Modifiez votre message ici..." })).toHaveValue("Message trois du rappel");

    await loginAs(page, WRITER.id);
    await page.goto(`/forum/post/${postId(3)}/edit`);
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}(\\?|$)`));
  });
});

test.describe("3.6 nouveau sujet", () => {
  test("[membre] titre avec smiley et aperçu, message, pas de cases de modération, « Annuler », erreur puis création", async ({ page }, testInfo) => {
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/new-topic?forumId=${E2E.forumId}`, { waitUntil: "networkidle" });

    const title = page.getByRole("textbox", { name: "Titre du sujet" });
    await title.fill("Inv éditeur créé par un membre ");
    await visibleButton(page, "Insérer un smiley dans le titre").click();
    await visibleButton(page, "🙂").click();
    await expect(title).toHaveValue("Inv éditeur créé par un membre :)");
    await expect(page.getByText(/Aperçu du titre/)).toBeVisible();
    await expect(page.getByText("Inv éditeur créé par un membre 🙂")).toBeVisible();

    await expect(page.getByRole("checkbox", { name: /Épingler/ })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: /Verrouiller le sujet/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Annuler" }).filter({ visible: true }).first()).toHaveAttribute("href", `/forum/${E2E.forumId}`);

    // Sans message : notification d'erreur, le titre reste en place
    await visibleButton(page, "Créer le sujet").click();
    await expect(page.getByText("Le titre et le message du sujet sont obligatoires.")).toBeVisible();
    await expect(title).toHaveValue("Inv éditeur créé par un membre :)");

    const message = page.getByRole("textbox", { name: "Message", exact: true });
    await message.fill("Premier message d'un sujet de l'inventaire");
    await applyTool(page, "Gras");
    await page.screenshot({ path: testInfo.outputPath("nouveau-sujet.png"), fullPage: false });
    await visibleButton(page, "Créer le sujet").click();
    await page.waitForURL(/\/forum\/topic\//);
    await expect(page.getByText("Premier message d'un sujet de l'inventaire")).toBeVisible();
  });

  test("[modo] cases « Épingler » et « Verrouiller le sujet » ; forum verrouillé refusé au membre, permis au modo", async ({ page }) => {
    // Membre dans un forum verrouillé : refus du serveur en notification
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/new-topic?forumId=${LOCKED_FORUM.id}`, { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: "Titre du sujet" }).fill("Inv éditeur créé refusé");
    await page.getByRole("textbox", { name: "Message", exact: true }).fill("Message refusé");
    await visibleButton(page, "Créer le sujet").click();
    await expect(page.getByText(/Ce forum est verrouillé/)).toBeVisible();
    await expect(page).toHaveURL(/\/forum\/new-topic/);

    // Modérateur : cases de modération, création permise dans le forum verrouillé, sujet épinglé
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/new-topic?forumId=${LOCKED_FORUM.id}`, { waitUntil: "networkidle" });
    const pin = page.getByRole("checkbox", { name: /Épingler/ });
    await expect(pin).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /Verrouiller le sujet/ })).toBeVisible();
    await pin.check();
    await page.getByRole("textbox", { name: "Titre du sujet" }).fill("Inv éditeur créé par le modo");
    await page.getByRole("textbox", { name: "Message", exact: true }).fill("Message du modo");
    await visibleButton(page, "Créer le sujet").click();
    await page.waitForURL(/\/forum\/topic\//);
    const created = await withTestDb((prisma) => prisma.topic.findFirst({ where: { title: "Inv éditeur créé par le modo" }, select: { isSticky: true, isLocked: true } }));
    expect(created).toEqual({ isSticky: true, isLocked: false });
  });
});

test.describe("réponse rapide", () => {
  test("[membre] les outils de l'éditeur et l'envoi fonctionnent dans la réponse rapide", async ({ page }, testInfo) => {
    await loginAs(page, WRITER.id);
    await page.goto(`/forum/topic/${QUICK_TOPIC}?page=1`, { waitUntil: "networkidle" });
    const textarea = page.getByRole("textbox", { name: "Écrivez votre réponse ici..." });
    await writeAndSelect(textarea, "Réponse rapide en gras");
    await applyTool(page, "Gras");
    await expect(textarea).toHaveValue("[b]Réponse rapide en gras[/b]");
    await textarea.press("End");
    await applyTool(page, "Trait horizontal");
    await expect(textarea).toHaveValue("[b]Réponse rapide en gras[/b][hr]");
    await page.screenshot({ path: testInfo.outputPath("reponse-rapide.png"), fullPage: false });
    await visibleButton(page, "Envoyer ma réponse").click();
    await expect(page.getByText("Réponse rapide en gras", { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(textarea).toHaveValue("");
  });
});
