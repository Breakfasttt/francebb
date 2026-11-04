/**
 * Inventaire de la refonte, section 16 (administration `/administration`) de docs/refonte/inventaire.md (carte 099).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés
 * par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification
 * avant et après la refonte de l'écran.
 *
 * Quelques petites fonctions cherchent un élément à deux endroits possibles, sans changer ce qui est attendu :
 * - `adminTab` : les onglets sont dans la page, ou (avant la refonte, sur téléphone) dans le panneau « Plus » ;
 * - `forumAction` : une action sur un forum est un bouton visible, ou une entrée du menu « ⋯ » de ce forum.
 *
 * Glisser-déposer : il est fait au clavier (Espace pour prendre la poignée, flèche vers le haut, Espace pour poser),
 * ce que la bibliothèque @dnd-kit gère comme un glisser à la souris ou au doigt.
 *
 * Sécurité des données : toutes les données modifiées sont créées par le test (nommées « Inv Adm … » ou
 * « INV_ADM_… ») et supprimées à la fin ; les réglages du site touchés (invitation Discord, textes de /jouer) sont
 * remis à leur valeur d'origine. La remise à zéro du site n'est **jamais** déclenchée : le test vérifie seulement que
 * son bouton reste désactivé tant que la phrase de confirmation n'est pas exacte. L'annonce par e-mail n'est pas
 * envoyée non plus (elle écrirait à tous les membres de la base de test) : le test s'arrête à la confirmation.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { loginAs, withTestDb } from "../fixtures";

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

const ADMIN = { id: "e2e_invadm_admin", name: "Inv Adm Admin" };
const SA = { id: "e2e_invadm_sa", name: "Inv Adm Super Admin" };
const MODO = { id: "e2e_invadm_modo", name: "Inv Adm Modo" };
const TARGET = { id: "e2e_invadm_target", name: "Inv Adm Cible" };
const USER_IDS = [ADMIN.id, SA.id, MODO.id, TARGET.id];

const ROLE_A = { name: "INV_ADM_A", label: "Inv Adm Rôle A" };
const ROLE_B = { name: "INV_ADM_B", label: "Inv Adm Rôle B" };
const CATEGORY = "Inv Adm Catégorie";
const FORUM_A = "Inv Adm Forum A";
const FORUM_B = "Inv Adm Forum B";
const REF = { group: "INV_ADM", key: "INV_ADM_KEY", label: "Inv Adm Donnée" };

const SETTING_KEYS = [
  "discord_invite",
  "how_to_play_what_is_bb",
  "how_to_play_platforms",
  "how_to_play_community",
  "how_to_play_tournaments",
  "how_to_play_naf_cdf_rtc",
  "how_to_play_challenges",
];
/** Valeurs d'origine des réglages touchés par le test, remises à la fin (`null` : réglage absent). */
let savedSettings: Record<string, string | null> = {};

async function cleanUp() {
  await db(async (prisma) => {
    await prisma.forum.deleteMany({ where: { name: { in: [FORUM_A, FORUM_B] }, parentForumId: { not: null } } });
    await prisma.forum.deleteMany({ where: { name: { in: [FORUM_A, FORUM_B] } } });
    await prisma.category.deleteMany({ where: { name: CATEGORY } });
    await prisma.referenceData.deleteMany({ where: { group: REF.group } });
    await prisma.moderationLog.deleteMany({ where: { OR: [{ moderatorId: { in: USER_IDS } }, { targetId: { in: USER_IDS } }] } });
    await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
    await prisma.roleConfig.deleteMany({ where: { name: { in: [ROLE_A.name, ROLE_B.name] } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    // User.role est une clé étrangère vers RoleConfig : les rôles d'administration doivent exister
    for (const role of [
      { name: "ADMIN", label: "Administrateur", power: 90 },
      { name: "SUPERADMIN", label: "Super Admin", power: 100 },
    ]) {
      await prisma.roleConfig.upsert({ where: { name: role.name }, update: {}, create: { ...role, isBaseRole: true } });
    }
    const base = { hasFinishedOnboarding: true };
    await prisma.user.create({ data: { ...base, id: ADMIN.id, name: ADMIN.name, email: "invadm-admin@e2e.test", role: "ADMIN" } });
    await prisma.user.create({ data: { ...base, id: SA.id, name: SA.name, email: "invadm-sa@e2e.test", role: "SUPERADMIN" } });
    await prisma.user.create({ data: { ...base, id: MODO.id, name: MODO.name, email: "invadm-modo@e2e.test", role: "MODERATOR" } });
    await prisma.user.create({ data: { ...base, id: TARGET.id, name: TARGET.name, email: "invadm-target@e2e.test" } });

    const settings = await prisma.siteSetting.findMany({ where: { key: { in: SETTING_KEYS } } });
    savedSettings = Object.fromEntries(SETTING_KEYS.map((key) => [key, settings.find((s) => s.key === key)?.value ?? null]));
  });
});

test.afterAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    for (const [key, value] of Object.entries(savedSettings)) {
      if (value === null) await prisma.siteSetting.deleteMany({ where: { key } });
      else await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  });
});

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
  general: /^Configuration/,
  roles: /^Gestion des rôles/i,
  coachs: /^Membres (&|et) accès/i,
  structure: /^Structure (du )?forum/i,
  reference: /^Données de référence/i,
  howtoplay: /^Guide du débutant/i,
  "info-mails": /^Annonces (par )?e-?mail/i,
} as const;
const RESET_TAB = /^Zone de danger/i;

/**
 * Onglet de l'administration : un lien ou un bouton de la page ; avant la refonte, sur téléphone, un bouton du
 * panneau « Plus ». Renvoie l'onglet visible (le panneau est ouvert s'il le faut), ou un repère vide s'il n'existe pas.
 */
async function adminTab(page: Page, name: RegExp): Promise<Locator> {
  const main = page.getByRole("main").first();
  const inMain = main.getByRole("link", { name }).or(main.getByRole("button", { name })).filter({ visible: true });
  if ((await inMain.count()) > 0) return inMain.first();
  // Les onglets sont dans la page : celui-ci n'existe pas
  if ((await main.getByRole("link", { name: TABS.general }).or(main.getByRole("button", { name: TABS.general })).filter({ visible: true }).count()) > 0) {
    return inMain;
  }
  await page.getByRole("button", { name: "Plus", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Plus" });
  await expect(panel).toBeVisible();
  return panel.getByRole("button", { name });
}

async function closePlusPanel(page: Page) {
  if (await page.getByRole("dialog", { name: "Plus" }).isVisible()) await page.keyboard.press("Escape");
}

/** Glisser-déposer au clavier : la poignée vers le haut d'une place. */
async function moveUp(page: Page, handle: Locator) {
  await handle.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(300);
  await page.keyboard.press("Space");
}

/** Action sur un forum de la structure : bouton visible, sinon entrée du menu « ⋯ » de ce forum. */
async function forumAction(page: Page, forum: string, action: string) {
  const direct = page.getByRole("button", { name: `${action} le forum ${forum}` }).filter({ visible: true });
  if ((await direct.count()) > 0) {
    await direct.first().click();
    return;
  }
  await page.getByRole("button", { name: `Actions du forum ${forum}` }).click();
  const name = new RegExp(`^${action}`);
  await page.getByRole("menuitem", { name }).or(page.getByRole("dialog").getByRole("button", { name })).first().click();
}

/**
 * Fin de saisie : sur téléphone, la barre du bas est cachée pendant la saisie (attribut `data-typing`) et revient
 * quand le champ perd le focus ; on attend qu'elle soit revenue pour que l'appui suivant tombe au bon endroit.
 */
async function stopTyping(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
}

const toast = (page: Page, text: string | RegExp) => page.getByText(text).filter({ visible: true }).first();

test("accès : un visiteur est envoyé vers la connexion, un modérateur est renvoyé", async ({ page }) => {
  await page.goto("/administration");
  await page.waitForURL(/\/auth\/login/);

  await loginAs(page, MODO.id);
  await page.goto("/administration");
  await expect(page).not.toHaveURL(/\/administration/);
});

test("onglets gardés dans l'adresse ; plus de « Zone de danger », même pour le super administrateur (carte 158)", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration", { waitUntil: "networkidle" });

  for (const [id, name] of Object.entries(TABS)) {
    await (await adminTab(page, name)).click();
    await expect(page).toHaveURL(new RegExp(`[?&]tab=${id}(&|$)`));
    await closePlusPanel(page);
  }
  await expect(await adminTab(page, RESET_TAB)).toHaveCount(0);
  await closePlusPanel(page);

  await page.context().clearCookies();
  await loginAs(page, SA.id);
  await page.goto("/administration?tab=general", { waitUntil: "networkidle" });
  await expect(await adminTab(page, RESET_TAB)).toHaveCount(0);
});

test("general : lien d'invitation Discord", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=general", { waitUntil: "networkidle" });
  const field = page.getByRole("textbox", { name: "Lien d'invitation Discord" });
  await field.fill("https://discord.gg/inv-adm");
  await stopTyping(page);
  await page.getByRole("button", { name: /^Enregistrer/ }).click();
  await expect(toast(page, "Paramètres mis à jour !")).toBeVisible();
  await expectPoll(() => db(async (prisma) => (await prisma.siteSetting.findUnique({ where: { key: "discord_invite" } }))?.value))
    .toBe("https://discord.gg/inv-adm");
});

test("roles : créer deux rôles, les réordonner par glisser-déposer, en supprimer un", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=roles", { waitUntil: "networkidle" });

  for (const role of [ROLE_A, ROLE_B]) {
    await page.getByRole("textbox", { name: "Identifiant du rôle" }).fill(role.name);
    await page.getByRole("textbox", { name: "Libellé du rôle" }).fill(role.label);
    await stopTyping(page);
    await page.getByRole("button", { name: /^Créer/i }).click();
    await expect(toast(page, "Rôle créé !")).toBeVisible();
    await expect(page.getByText(role.label).first()).toBeVisible();
  }

  // Les deux rôles côte à côte, A au-dessus de B, puis B remonté au-dessus de A
  await db(async (prisma) => {
    await prisma.roleConfig.update({ where: { name: ROLE_A.name }, data: { power: 8 } });
    await prisma.roleConfig.update({ where: { name: ROLE_B.name }, data: { power: 6 } });
  });
  await page.reload({ waitUntil: "networkidle" });
  await moveUp(page, page.getByRole("button", { name: `Déplacer le rôle ${ROLE_B.label}`, exact: true }));
  await expect(toast(page, "Hiérarchie mise à jour !")).toBeVisible();
  await expectPoll(() => db(async (prisma) => {
      const [a, b] = await Promise.all([ROLE_A, ROLE_B].map((r) => prisma.roleConfig.findUnique({ where: { name: r.name } })));
      return (b?.power ?? 0) > (a?.power ?? 0);
    }))
    .toBe(true);

  await page.getByRole("button", { name: `Supprimer le rôle ${ROLE_A.label}` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Supprimer", exact: true }).filter({ visible: true }).first().click();
  await expect(toast(page, "Rôle supprimé !")).toBeVisible();
  await expectPoll(() => db((prisma) => prisma.roleConfig.count({ where: { name: ROLE_A.name } }))).toBe(0);
});

test("coachs : chercher un coach et changer son rôle", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=coachs", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Rechercher un coach" }).fill(TARGET.name);
  const select = page.getByRole("combobox", { name: `Rôle de ${TARGET.name}` });
  await expect(select).toBeVisible();
  await expect(page.getByRole("combobox", { name: /^Rôle de / })).toHaveCount(1);
  await select.selectOption("MODERATOR");
  await expect(toast(page, "Rôle mis à jour")).toBeVisible();
  await expectPoll(() => db(async (prisma) => (await prisma.user.findUnique({ where: { id: TARGET.id } }))?.role)).toBe("MODERATOR");
});

test("structure : catégorie et forums créés, indentés, réordonnés, réservés à un rôle puis supprimés", async ({ page }) => {
  test.slow();
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=structure", { waitUntil: "networkidle" });

  const save = async () => {
    await stopTyping(page);
    await page.getByRole("button", { name: /^Enregistrer$/ }).filter({ visible: true }).first().click();
    await expect(toast(page, "Sauvegardé")).toBeVisible();
  };

  // Nouvelle catégorie, puis deux forums dedans
  await page.getByRole("button", { name: /^Ajouter une catégorie/i }).click();
  await page.getByRole("textbox", { name: /^Nom/ }).fill(CATEGORY);
  await save();
  const category = page.getByRole("region", { name: `Catégorie ${CATEGORY}` });
  await expect(category).toBeVisible();
  for (const forum of [FORUM_A, FORUM_B]) {
    await category.getByRole("button", { name: /^Ajouter un forum/i }).click();
    await page.getByRole("textbox", { name: /^Nom/ }).fill(forum);
    await save();
    await expect(category.getByText(forum, { exact: true })).toBeVisible();
  }
  const forumRow = (name: string) => db((prisma) => prisma.forum.findUnique({ where: { name } }));

  // Indenter : B devient un sous-forum de A
  await forumAction(page, FORUM_B, "Indenter");
  await expect(toast(page, /est maintenant sous-forum de/)).toBeVisible();
  const forumA = await forumRow(FORUM_A);
  await expectPoll(async () => (await forumRow(FORUM_B))?.parentForumId).toBe(forumA?.id);

  // Désindenter : B redevient un forum de la catégorie (les sous-forums de A sont affichés d'abord s'il le faut)
  // Le bouton qui affiche les sous-forums de A apparaît quand la liste est rechargée
  const showSubForums = page.getByRole("button", { name: `Sous-forums de ${FORUM_A}` });
  await expect(showSubForums).toBeVisible();
  const forumBControls = page.getByRole("button", { name: new RegExp(`^(Déplacer le forum|Actions du forum|Modifier le forum) ${FORUM_B}$`) });
  if ((await forumBControls.filter({ visible: true }).count()) === 0) {
    await showSubForums.click();
  }
  await forumAction(page, FORUM_B, "Dédenter");
  await expect(toast(page, /est maintenant un forum racine/)).toBeVisible();
  await expectPoll(async () => (await forumRow(FORUM_B))?.parentForumId).toBeNull();

  // Glisser-déposer : B remonte au-dessus de A
  await page.reload({ waitUntil: "networkidle" });
  await moveUp(page, page.getByRole("button", { name: `Déplacer le forum ${FORUM_B}`, exact: true }));
  await expect(toast(page, "Ordre mis à jour")).toBeVisible();
  await expectPoll(async () => ((await forumRow(FORUM_B))?.order ?? 99) < ((await forumRow(FORUM_A))?.order ?? -1))
    .toBe(true);

  // Rôle minimum d'accès : A réservé aux modérateurs
  await page.reload({ waitUntil: "networkidle" });
  await forumAction(page, FORUM_A, "Modifier");
  await page.getByRole("combobox", { name: /^Droits d'accès minimum/ }).selectOption("MODERATOR");
  await save();
  await expectPoll(async () => (await forumRow(FORUM_A))?.allowedRoles).toBe("MODERATOR");

  // Suppression des deux forums, puis de la catégorie vide
  for (const forum of [FORUM_B, FORUM_A]) {
    await forumAction(page, forum, "Modifier");
    await page.getByRole("button", { name: /^Supprimer/ }).filter({ visible: true }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: /^Supprimer définitivement$/ }).filter({ visible: true }).first().click();
    await expect(toast(page, "Supprimé")).toBeVisible();
    await expectPoll(() => forumRow(forum)).toBeNull();
  }
  await page.getByRole("button", { name: `Modifier la catégorie ${CATEGORY}` }).click();
  await page.getByRole("button", { name: /^Supprimer/ }).filter({ visible: true }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: /^Supprimer définitivement$/ }).filter({ visible: true }).first().click();
  await expectPoll(() => db((prisma) => prisma.category.count({ where: { name: CATEGORY } }))).toBe(0);
});

test("reference : créer, modifier et supprimer une donnée de référence", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=reference", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /^Ajouter/ }).click();
  await page.getByRole("textbox", { name: "Groupe" }).fill(REF.group);
  await page.getByRole("textbox", { name: "Clé" }).fill(REF.key);
  await page.getByRole("textbox", { name: "Libellé" }).fill(REF.label);
  await page.getByRole("spinbutton", { name: "Ordre" }).fill("3");
  await stopTyping(page);
  await page.getByRole("button", { name: /^Créer/ }).click();
  await expect(toast(page, "Créé avec succès")).toBeVisible();
  await expect(page.getByText(REF.label, { exact: true })).toBeVisible();
  await expectPoll(() => db(async (prisma) => (await prisma.referenceData.findFirst({ where: { group: REF.group } }))?.order)).toBe(3);

  await page.getByRole("button", { name: `Modifier ${REF.label}` }).click();
  await page.getByRole("textbox", { name: "Libellé" }).fill(`${REF.label} bis`);
  await stopTyping(page);
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(toast(page, "Mis à jour")).toBeVisible();
  await expect(page.getByText(`${REF.label} bis`, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Supprimer ${REF.label} bis` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Supprimer", exact: true }).click();
  await expect(toast(page, "Supprimé")).toBeVisible();
  await expectPoll(() => db((prisma) => prisma.referenceData.count({ where: { group: REF.group } }))).toBe(0);
});

test("howtoplay : les six textes de /jouer, modifiés et enregistrés", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=howtoplay", { waitUntil: "networkidle" });
  for (const title of ["C'est quoi Blood Bowl ?", "Comment y jouer ?", "Communauté & Ligues", "Rejoindre un Tournoi", "NAF, CdF & RTC", "Challenges Régionaux"]) {
    await expect(page.getByRole("region", { name: title }).getByRole("textbox").first()).toBeVisible();
  }
  await page.getByRole("region", { name: "C'est quoi Blood Bowl ?" }).getByRole("textbox").first().fill("Inv Adm texte du guide");
  await stopTyping(page);
  await page.getByRole("button", { name: /^Enregistrer/i }).click();
  await expect(toast(page, "Guide mis à jour !")).toBeVisible();
  await expectPoll(() => db(async (prisma) => (await prisma.siteSetting.findUnique({ where: { key: "how_to_play_what_is_bb" } }))?.value))
    .toBe("Inv Adm texte du guide");
});

test("info-mails : objet et message, puis confirmation « Oui, diffuser » (annulée, rien n'est envoyé)", async ({ page }) => {
  await loginAs(page, ADMIN.id);
  await page.goto("/administration?tab=info-mails", { waitUntil: "networkidle" });
  const send = page.getByRole("button", { name: /^Diffuser/ });
  await expect(send).toBeDisabled();
  await page.getByRole("textbox", { name: "Objet du mail" }).fill("Inv Adm objet");
  await page.getByRole("textbox", { name: /^Message/i }).fill("Inv Adm [b]message[/b]");
  await stopTyping(page);
  await send.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Oui, diffuser" }).filter({ visible: true }).first()).toBeVisible();
  await dialog.getByRole("button", { name: "Annuler" }).filter({ visible: true }).first().click();
  await expect(dialog).toBeHidden();
});

