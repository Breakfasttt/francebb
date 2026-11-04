/**
 * Inventaire de la refonte, section 8 (messagerie) de docs/refonte/inventaire.md (carte 093) : la page
 * `/messagerie`, sa liste de conversations, une conversation (`?id=`), l'ouverture directe d'une conversation à deux
 * (`?userId=`) et les fenêtres de création, d'invitation, de renommage et de départ. Rejoué en taille ordinateur
 * (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés par leur rôle, leur nom
 * accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification avant et après la
 * refonte de ces écrans.
 *
 * Deux petites fonctions cherchent un élément à deux endroits possibles, sans changer ce qui est attendu :
 * - `conversationAction` : une action sur la conversation est un bouton visible, ou une entrée du menu « ⋯ » ;
 * - `participantsScope` : la liste des participants est affichée dans la page, ou dans un panneau à ouvrir.
 * Quand un libellé a deux formes possibles (« Nouvelle conversation » ou « Nouvelle discussion »), l'expression
 * régulière accepte les deux.
 *
 * Les messages sont chiffrés dans la base, mais le site affiche tel quel un texte qui n'a pas la forme d'un message
 * chiffré (`decrypt` de lib/crypto.ts) : le test peut donc écrire des messages en clair directement dans la base.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Msg … » : le membre « Inv Msg Moi »,
 * quatre autres membres, une conversation à deux de 31 messages (les deux derniers non lus), deux groupes, et
 * 20 membres de remplissage avec chacun une conversation plus ancienne (la liste montre 20 conversations).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test. La petite base locale coupe parfois une connexion pendant que le site garde la sienne, ou
 * mélange deux requêtes (« bind message supplies … parameters ») : on réessaie alors, 10 fois au plus (withTestDb ne
 * réessaie que l'erreur « Server has closed the connection »).
 */
async function db<T>(run: Parameters<typeof withTestDb<T>>[0]): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await withTestDb(run);
    } catch (error) {
      const cut = error instanceof Error && /Connection terminated|ECONNRESET|ConnectionClosed|bind message supplies/.test(error.message);
      if (!cut || attempt >= 10) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const ME = { id: "e2e_msg_me", name: "Inv Msg Moi" };
const OTHER = { id: "e2e_msg_other", name: "Inv Msg Autre" };
const THIRD = { id: "e2e_msg_third", name: "Inv Msg Troisième" };
const NEWBIE = { id: "e2e_msg_newbie", name: "Inv Msg Nouveau" };
const STARTER = { id: "e2e_msg_starter", name: "Inv Msg Démarrage" };
const STRANGER = { id: "e2e_msg_stranger", name: "Inv Msg Inconnu" };

const DUO = { id: "e2e_msg_duo" };
const GROUP = { id: "e2e_msg_group", name: "Inv Msg Groupe" };
const LEAVE = { id: "e2e_msg_leave", name: "Inv Msg À quitter" };

const MESSAGES = 31;
const messageText = (n: number) => `Inv Msg n°${String(n).padStart(2, "0")}`;

const FILLERS = 20;
const fillerId = (n: number) => `e2e_msg_m${String(n).padStart(2, "0")}`;
const fillerName = (n: number) => `Inv Msg Membre ${String(n).padStart(2, "0")}`;

const ALL_USER_IDS = [
  ME.id, OTHER.id, THIRD.id, NEWBIE.id, STARTER.id, STRANGER.id,
  ...Array.from({ length: FILLERS }, (_, i) => fillerId(i + 1)),
];

async function cleanUp() {
  await db(async (prisma) => {
    // Les messages et les participants sont supprimés avec leur conversation (suppression en cascade)
    await prisma.conversation.deleteMany({ where: { participants: { some: { userId: { in: ALL_USER_IDS } } } } });
    await prisma.privateMessage.deleteMany({ where: { authorId: { in: ALL_USER_IDS } } });
    await prisma.user.deleteMany({ where: { id: { in: ALL_USER_IDS } } });
  });
}

test.describe("Inventaire : messagerie", () => {
  test.beforeAll(async () => {
    await cleanUp();
    await db(async (prisma) => {
      const base = { hasFinishedOnboarding: true };
      await prisma.user.createMany({
        data: [
          { ...base, id: ME.id, name: ME.name, email: "msg-me@e2e.test", theme: "vestiaire" },
          { ...base, id: OTHER.id, name: OTHER.name, email: "msg-other@e2e.test" },
          { ...base, id: THIRD.id, name: THIRD.name, email: "msg-third@e2e.test" },
          { ...base, id: NEWBIE.id, name: NEWBIE.name, email: "msg-newbie@e2e.test" },
          { ...base, id: STARTER.id, name: STARTER.name, email: "msg-starter@e2e.test" },
          { ...base, id: STRANGER.id, name: STRANGER.name, email: "msg-stranger@e2e.test" },
          ...Array.from({ length: FILLERS }, (_, i) => ({ ...base, id: fillerId(i + 1), name: fillerName(i + 1), email: `msg-m${i + 1}@e2e.test` })),
        ],
      });

      const now = Date.now();
      // Conversation à deux, la plus récente : 31 messages, les deux derniers (de l'autre membre) non lus. Chaque
      // participant a sa date de lecture (carte 170) : celle de « Moi » tombe entre l'avant-dernier message lu
      // (il y a 3 minutes) et le premier non lu (il y a 2 minutes).
      await prisma.conversation.create({
        data: {
          id: DUO.id, isGroup: false, updatedAt: new Date(now),
          participants: { create: [{ userId: ME.id, isAdmin: true, lastReadAt: new Date(now - 150_000) }, { userId: OTHER.id }] },
        },
      });
      for (let n = 1; n <= MESSAGES; n++) {
        const unread = n >= MESSAGES - 1;
        await prisma.privateMessage.create({
          data: {
            conversationId: DUO.id, content: messageText(n),
            authorId: unread || n % 2 === 0 ? OTHER.id : ME.id,
            createdAt: new Date(now - (MESSAGES - n + 1) * 60_000),
          },
        });
      }
      await prisma.conversation.update({ where: { id: DUO.id }, data: { updatedAt: new Date(now) } });

      // Deux groupes de trois membres
      for (const [index, group] of [GROUP, LEAVE].entries()) {
        await prisma.conversation.create({
          data: {
            id: group.id, name: group.name, isGroup: true,
            participants: { create: [{ userId: ME.id, isAdmin: true, lastReadAt: new Date(now) }, { userId: OTHER.id }, { userId: THIRD.id }] },
            messages: { create: { content: `Inv Msg bienvenue dans ${group.name}`, authorId: OTHER.id, createdAt: new Date(now - (index + 2) * 60 * 60_000) } },
          },
        });
        await prisma.conversation.update({ where: { id: group.id }, data: { updatedAt: new Date(now - (index + 1) * 60_000) } });
      }

      // 20 conversations plus anciennes : avec les 3 précédentes, « Inv Msg Moi » en a 23, la liste en montre 20
      for (let n = 1; n <= FILLERS; n++) {
        await prisma.conversation.create({
          data: {
            id: `e2e_msg_fill_${String(n).padStart(2, "0")}`, isGroup: false,
            participants: { create: [{ userId: ME.id, isAdmin: true }, { userId: fillerId(n) }] },
          },
        });
        await prisma.conversation.update({ where: { id: `e2e_msg_fill_${String(n).padStart(2, "0")}` }, data: { updatedAt: new Date(now - (10 + n) * 60 * 60_000) } });
      }
    });
  });

  test.afterAll(async () => {
    await cleanUp();
  });

  // Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  });

  const content = (page: Page) => page.getByRole("main").first();

  /** Liens de la liste des conversations qui contiennent ce texte (nom du membre, titre du groupe, dernier message). */
  const conversationLink = (page: Page, text: string | RegExp) =>
    content(page).getByRole("link").filter({ hasText: text }).filter({ visible: true });

  /** Lance une action sur la conversation ouverte : bouton visible, ou entrée du menu « ⋯ ». */
  async function conversationAction(page: Page, action: RegExp) {
    const button = content(page).getByRole("button", { name: action }).filter({ visible: true });
    if ((await button.count()) > 0) {
      await button.first().click();
      return;
    }
    await content(page).getByRole("button", { name: /Actions|Plus d'actions/ }).filter({ visible: true }).first().click();
    await page.getByRole("menuitem", { name: action }).or(page.getByRole("dialog").getByRole("button", { name: action })).first().click();
  }

  /** Endroit où la liste des participants est affichée : la page, ou le panneau « Participants » une fois ouvert. */
  async function participantsScope(page: Page): Promise<Locator> {
    const inMain = content(page).getByRole("link", { name: OTHER.name, exact: true }).filter({ visible: true });
    if ((await inMain.count()) > 0) return content(page);
    await conversationAction(page, /Participants/);
    const panel = page.getByRole("dialog", { name: /Participants/ });
    await expect(panel).toBeVisible();
    return panel;
  }

  async function closeDialogs(page: Page) {
    while (await page.getByRole("dialog").filter({ visible: true }).count()) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }
  }

  test("liste : 20 conversations, dernier message et nombre de non-lus", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/messagerie", { waitUntil: "networkidle" });

    // La conversation à deux : nom de l'autre membre, lien vers ?id=, dernier message, 2 non lus
    const duo = conversationLink(page, messageText(MESSAGES));
    await expect(duo).toHaveAttribute("href", `/messagerie?id=${DUO.id}`);
    await expect(duo).toContainText(OTHER.name);
    await expect(duo.getByRole("img", { name: /^2 messages?(\(s\))? non lus?(\(s\))?$/ })).toBeVisible();

    // Un groupe : son titre et son dernier message, aucun non-lu
    const group = conversationLink(page, `Inv Msg bienvenue dans ${GROUP.name}`);
    await expect(group).toHaveAttribute("href", `/messagerie?id=${GROUP.id}`);
    await expect(group).toContainText(GROUP.name);
    await expect(group.getByRole("img", { name: /non lu/ })).toHaveCount(0);

    // 20 conversations au plus : les trois plus anciennes ne sont pas affichées
    await expect(conversationLink(page, /Inv Msg/)).toHaveCount(20);
    await expect(conversationLink(page, fillerName(17))).toBeVisible();
    await expect(conversationLink(page, fillerName(18))).toHaveCount(0);
  });

  test("conversation : 30 derniers messages, marqués comme lus, rafraîchis toutes les 10 secondes", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/messagerie", { waitUntil: "networkidle" });
    await conversationLink(page, messageText(MESSAGES)).click();
    await expect(page).toHaveURL(new RegExp(`/messagerie\\?id=${DUO.id}$`));

    const main = content(page);
    await expect(main.getByRole("heading", { name: OTHER.name })).toBeVisible();
    await expect(main.getByText(messageText(MESSAGES), { exact: true })).toBeVisible();
    // Les 30 derniers : le n°02 est chargé, le n°01 ne l'est pas
    await expect(main.getByText(messageText(2), { exact: true })).toHaveCount(1);
    await expect(main.getByText(messageText(1), { exact: true })).toHaveCount(0);

    // Marqués comme lus à l'ouverture : la date de lecture de « Moi » dépasse le dernier message (carte 170)
    await expect.poll(() => db(async (prisma) => {
      const [me, last] = await Promise.all([
        prisma.conversationParticipant.findUnique({ where: { userId_conversationId: { userId: ME.id, conversationId: DUO.id } } }),
        prisma.privateMessage.findFirst({ where: { conversationId: DUO.id }, orderBy: { createdAt: "desc" } }),
      ]);
      return !!me?.lastReadAt && !!last && me.lastReadAt >= last.createdAt;
    })).toBe(true);

    // Un message arrivé pendant la lecture apparaît sans recharger la page (rafraîchissement toutes les 10 secondes)
    await db((prisma) => prisma.privateMessage.create({ data: { conversationId: DUO.id, authorId: OTHER.id, content: "Inv Msg arrivé pendant la lecture" } }));
    await expect(main.getByText("Inv Msg arrivé pendant la lecture", { exact: true })).toBeVisible({ timeout: 15_000 });

    // De retour à la liste, la conversation n'a plus de non-lus
    await page.goto("/messagerie", { waitUntil: "networkidle" });
    const duo = conversationLink(page, "Inv Msg arrivé pendant la lecture");
    await expect(duo).toHaveAttribute("href", `/messagerie?id=${DUO.id}`);
    await expect(duo.getByRole("img", { name: /non lu/ })).toHaveCount(0);
  });

  test("saisie avec l'éditeur BBCode et « Envoyer »", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto(`/messagerie?id=${DUO.id}`, { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: OTHER.name })).toBeVisible();

    // L'éditeur BBCode : sa barre d'outils et sa zone de texte
    await expect(main.getByRole("toolbar", { name: "Mise en forme du message" })).toBeVisible();
    const before = await db((prisma) => prisma.privateMessage.count({ where: { conversationId: DUO.id, authorId: ME.id } }));
    const textbox = main.getByRole("textbox", { name: /message/i });
    await textbox.fill("Inv Msg réponse [b]en gras[/b]");
    await main.getByRole("button", { name: /^Envoyer/ }).click();

    // Le message est enregistré, affiché mis en forme, et la zone de texte est vidée
    await expect.poll(() => db((prisma) => prisma.privateMessage.count({ where: { conversationId: DUO.id, authorId: ME.id } }))).toBe(before + 1);
    await expect(main.getByText("en gras", { exact: true })).toBeVisible();
    await expect(textbox).toHaveValue("");
  });

  test("groupe : liste des participants, ajouter des participants, renommer", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto(`/messagerie?id=${GROUP.id}`, { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: GROUP.name })).toBeVisible();

    // Liste des participants, avec un lien vers leur profil
    let scope = await participantsScope(page);
    await expect(scope.getByRole("link", { name: OTHER.name, exact: true })).toHaveAttribute("href", `/spy/${OTHER.id}`);
    await expect(scope.getByRole("link", { name: THIRD.name, exact: true })).toHaveAttribute("href", `/spy/${THIRD.id}`);
    await closeDialogs(page);

    // Ajouter un participant : recherche d'un coach, sélection, ajout
    await conversationAction(page, /^Ajouter (un|des) participants?$/);
    const invite = page.getByRole("dialog", { name: /Ajouter des participants/ });
    await expect(invite).toBeVisible();
    await invite.getByRole("textbox", { name: "Rechercher un coach" }).fill("Inv Msg Nouv");
    const result = invite.getByRole("button", { name: new RegExp(NEWBIE.name) });
    await result.click();
    await expect(result).toHaveAttribute("aria-pressed", "true");
    await invite.getByRole("button", { name: /^Ajouter/ }).click();
    await expect(invite).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.conversationParticipant.count({ where: { conversationId: GROUP.id, userId: NEWBIE.id } }))).toBe(1);
    scope = await participantsScope(page);
    await expect(scope.getByRole("link", { name: NEWBIE.name, exact: true })).toHaveAttribute("href", `/spy/${NEWBIE.id}`);
    await closeDialogs(page);

    // Renommer le groupe
    await conversationAction(page, /^Renommer/);
    const rename = page.getByRole("dialog", { name: /Renommer/ });
    await expect(rename).toBeVisible();
    await rename.getByRole("textbox", { name: "Nouveau titre" }).fill("Inv Msg Groupe renommé");
    await rename.getByRole("button", { name: "Enregistrer" }).click();
    await expect(main.getByRole("heading", { name: "Inv Msg Groupe renommé" })).toBeVisible();
    await expect.poll(() => db(async (prisma) => (await prisma.conversation.findUnique({ where: { id: GROUP.id } }))?.name)).toBe("Inv Msg Groupe renommé");
  });

  test("« Quitter la conversation », avec confirmation", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto(`/messagerie?id=${LEAVE.id}`, { waitUntil: "networkidle" });
    await expect(content(page).getByRole("heading", { name: LEAVE.name })).toBeVisible();

    // Annuler ne fait rien
    await conversationAction(page, /^Quitter la conversation$/);
    let confirm = page.getByRole("dialog", { name: /Quitter la conversation/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Annuler" }).click();
    await expect(confirm).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`id=${LEAVE.id}`));

    // Confirmer : retour à la liste, la conversation n'y est plus
    await conversationAction(page, /^Quitter la conversation$/);
    confirm = page.getByRole("dialog", { name: /Quitter la conversation/ });
    await confirm.getByRole("button", { name: "Quitter", exact: true }).click();
    await expect(page).toHaveURL(/\/messagerie$/);
    await expect(conversationLink(page, GROUP.name)).toBeVisible();
    await expect(conversationLink(page, LEAVE.name)).toHaveCount(0);
    const left = await db((prisma) => prisma.conversationParticipant.findUnique({ where: { userId_conversationId: { userId: ME.id, conversationId: LEAVE.id } } }));
    expect(left?.deletedAt).not.toBeNull();
  });

  test("?userId= reprend la conversation à deux existante, ou en ouvre une nouvelle", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto(`/messagerie?userId=${OTHER.id}`);
    await expect(page).toHaveURL(new RegExp(`/messagerie\\?id=${DUO.id}$`));
    await expect(content(page).getByRole("heading", { name: OTHER.name })).toBeVisible();

    await page.goto(`/messagerie?userId=${STRANGER.id}`);
    await expect(page).toHaveURL(/\/messagerie\?id=(?!e2e_msg_)/);
    await expect(content(page).getByRole("heading", { name: STRANGER.name })).toBeVisible();
    await expect.poll(() => db((prisma) => prisma.conversation.count({
      where: { isGroup: false, AND: [{ participants: { some: { userId: ME.id } } }, { participants: { some: { userId: STRANGER.id } } }] },
    }))).toBe(1);
  });

  test("« Nouvelle discussion » : note sur le chiffrement, recherche de coachs, titre facultatif", async ({ page }) => {
    await loginAs(page, ME.id);
    await page.goto("/messagerie", { waitUntil: "networkidle" });

    // Sans titre, avec un seul coach : conversation à deux
    await content(page).getByRole("button", { name: /^Nouvelle (conversation|discussion)$/ }).filter({ visible: true }).first().click();
    let dialog = page.getByRole("dialog", { name: /Nouvelle discussion/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/messages sont chiffrés/)).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: /Titre de la discussion/ })).toHaveValue("");
    await dialog.getByRole("textbox", { name: "Rechercher un coach" }).fill("Inv Msg Dém");
    const starter = dialog.getByRole("button", { name: new RegExp(STARTER.name) });
    await starter.click();
    await expect(starter).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("button", { name: /^(Démarrer|Créer)/ }).click();
    await expect(page).toHaveURL(/\/messagerie\?id=/);
    await expect(content(page).getByRole("heading", { name: STARTER.name })).toBeVisible();

    // Avec un titre et deux coachs : un groupe qui porte ce titre
    await page.goto("/messagerie", { waitUntil: "networkidle" });
    await content(page).getByRole("button", { name: /^Nouvelle (conversation|discussion)$/ }).filter({ visible: true }).first().click();
    dialog = page.getByRole("dialog", { name: /Nouvelle discussion/ });
    await dialog.getByRole("textbox", { name: /Titre de la discussion/ }).fill("Inv Msg Sujet neuf");
    const search = dialog.getByRole("textbox", { name: "Rechercher un coach" });
    await search.fill("Inv Msg Dém");
    await dialog.getByRole("button", { name: new RegExp(STARTER.name) }).click();
    await search.fill("Inv Msg Troi");
    await dialog.getByRole("button", { name: new RegExp(THIRD.name) }).click();
    await dialog.getByRole("button", { name: /^Créer le groupe/ }).click();
    await expect(page).toHaveURL(/\/messagerie\?id=/);
    await expect(content(page).getByRole("heading", { name: "Inv Msg Sujet neuf" })).toBeVisible();
    await expect.poll(() => db((prisma) => prisma.conversation.count({ where: { name: "Inv Msg Sujet neuf", isGroup: true, participants: { some: { userId: THIRD.id } } } }))).toBe(1);
  });
});
