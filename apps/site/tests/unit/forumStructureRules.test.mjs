/**
 * Tests unitaires des règles de la structure du forum (`lib/forumStructureRules.ts`, carte 199) : forum protégé,
 * dernier forum ouvert à tous, nom unique, nombre de sous-forums, forum non vide.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_SUBFORUMS,
  PROTECTED_FORUM_NAME,
  forumCreationRefusal,
  forumDeletionRefusal,
  forumUpdateRefusal,
} from "../../lib/forumStructureRules.ts";

const emptyForum = { name: "Discussions", access: "ALL", otherPublicForums: 3, subForums: 0, visibleTopics: 0, deletedTopics: 0 };

test("un forum vide qui n'est ni protégé ni le dernier public peut être supprimé", () => {
  assert.equal(forumDeletionRefusal(emptyForum), null);
});

test("le forum des tournois ne peut pas être supprimé, même vide", () => {
  assert.match(forumDeletionRefusal({ ...emptyForum, name: PROTECTED_FORUM_NAME }), /protégé/);
});

test("le dernier forum ouvert à tous ne peut pas être supprimé", () => {
  assert.match(forumDeletionRefusal({ ...emptyForum, otherPublicForums: 0 }), /dernier forum ouvert à tous/);
  // Un forum réservé peut l'être, même s'il ne reste aucun autre forum public
  assert.equal(forumDeletionRefusal({ ...emptyForum, access: "ADMIN", otherPublicForums: 0 }), null);
});

test("un forum qui a des sous-forums, des sujets ou des sujets supprimés est refusé", () => {
  assert.match(forumDeletionRefusal({ ...emptyForum, subForums: 2 }), /2 sous-forums/);
  assert.match(forumDeletionRefusal({ ...emptyForum, visibleTopics: 1 }), /encore 1 sujet\./);
  assert.match(forumDeletionRefusal({ ...emptyForum, deletedTopics: 3 }), /3 sujets supprimés/);
});

test("création : nom obligatoire, emplacement obligatoire, nom unique, sous-forums limités", () => {
  const ok = { name: "Nouveau", hasContainer: true, nameTaken: false, siblingSubForums: null };
  assert.equal(forumCreationRefusal(ok), null);
  assert.match(forumCreationRefusal({ ...ok, name: "   " }), /obligatoire/);
  assert.match(forumCreationRefusal({ ...ok, hasContainer: false }), /catégorie ou à un forum parent/);
  assert.match(forumCreationRefusal({ ...ok, nameTaken: true }), /porte déjà le nom « Nouveau »/);
  assert.equal(forumCreationRefusal({ ...ok, siblingSubForums: MAX_SUBFORUMS - 1 }), null);
  assert.match(forumCreationRefusal({ ...ok, siblingSubForums: MAX_SUBFORUMS }), /maximum de sous-forums/);
});

test("modification : le forum des tournois garde son nom, et un forum public reste au moins", () => {
  const ok = { currentName: "Discussions", newName: "Discussions", currentAccess: "ALL", newAccess: "ALL", nameTaken: false, otherPublicForums: 2 };
  assert.equal(forumUpdateRefusal(ok), null);
  assert.match(forumUpdateRefusal({ ...ok, currentName: PROTECTED_FORUM_NAME, newName: "Tournois" }), /ne peut pas être renommé/);
  assert.equal(forumUpdateRefusal({ ...ok, currentName: PROTECTED_FORUM_NAME, newName: PROTECTED_FORUM_NAME }), null);
  assert.match(forumUpdateRefusal({ ...ok, newAccess: "ADMIN", otherPublicForums: 0 }), /au moins un forum ouvert à tous/);
  assert.match(forumUpdateRefusal({ ...ok, newName: "Autre", nameTaken: true }), /porte déjà le nom/);
});
