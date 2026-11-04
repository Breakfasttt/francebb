/**
 * Tests unitaires des règles d'envoi de photos depuis l'éditeur (carte 184) : balise de galerie, texte de la
 * progression, message d'échec, dimensions d'une photo réduite et choix de réduire ou non une photo.
 * La réduction elle-même (zone de dessin du navigateur) n'est pas testée ici : elle demande un navigateur.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHOTO_MAX_SIDE,
  fitWithin,
  galleryTag,
  jpegFileName,
  photoFailureMessage,
  shouldShrinkPhoto,
  uploadProgressLabel,
} from "../../common/utils/photoUpload.ts";

const LIMIT = 4 * 1024 * 1024;

test("galerie : adresses séparées par des virgules", () => {
  assert.equal(galleryTag(["https://i.ibb.co/a.jpg", "https://i.ibb.co/b.jpg"]), "[gallery]https://i.ibb.co/a.jpg,https://i.ibb.co/b.jpg[/gallery]");
});

test("progression : « Envoi 2 sur 4… », ou « Envoi en cours… » pour une seule photo", () => {
  assert.equal(uploadProgressLabel(2, 4), "Envoi 2 sur 4…");
  assert.equal(uploadProgressLabel(1, 1), "Envoi en cours…");
});

test("échec : singulier, pluriel et photo seule", () => {
  assert.equal(photoFailureMessage(1, 4, "Trop lourde."), "1 photo sur 4 n'a pas pu être envoyée : Trop lourde.");
  assert.equal(photoFailureMessage(2, 4, "Trop lourde."), "2 photos sur 4 n'ont pas pu être envoyées : Trop lourde.");
  assert.equal(photoFailureMessage(1, 1, "Trop lourde."), "Trop lourde.");
});

test("dimensions : plus grand côté ramené à 2000 pixels, proportions gardées", () => {
  assert.deepEqual(fitWithin(4000, 3000, PHOTO_MAX_SIDE), { width: 2000, height: 1500 });
  assert.deepEqual(fitWithin(3024, 4032, PHOTO_MAX_SIDE), { width: 1500, height: 2000 });
  assert.deepEqual(fitWithin(1200, 800, PHOTO_MAX_SIDE), { width: 1200, height: 800 });
});

test("réduire : grande photo JPEG oui, petite non, GIF jamais, PNG seulement s'il est trop lourd", () => {
  assert.equal(shouldShrinkPhoto({ type: "image/jpeg", size: 3_000_000, width: 4032, height: 3024 }, LIMIT), true);
  assert.equal(shouldShrinkPhoto({ type: "image/jpeg", size: 300_000, width: 1600, height: 1200 }, LIMIT), false);
  assert.equal(shouldShrinkPhoto({ type: "image/gif", size: 9_000_000, width: 4000, height: 4000 }, LIMIT), false);
  assert.equal(shouldShrinkPhoto({ type: "image/png", size: 2_000_000, width: 2532, height: 1170 }, LIMIT), false);
  assert.equal(shouldShrinkPhoto({ type: "image/png", size: 6_000_000, width: 2532, height: 1170 }, LIMIT), true);
  assert.equal(shouldShrinkPhoto({ type: "image/heic", size: 1_000_000, width: 1000, height: 800 }, LIMIT), true);
});

test("nom du fichier réduit en .jpg", () => {
  assert.equal(jpegFileName("IMG_1234.HEIC"), "IMG_1234.jpg");
  assert.equal(jpegFileName("photo"), "photo.jpg");
  assert.equal(jpegFileName(".png"), "photo.jpg");
});
