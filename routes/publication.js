const express = require("express");
const router = express.Router();
const upload = require("../middelware/upload");
const publicationCtrl = require("../controllers/publication");
const auth = require("../middelware/auth");

//Route pour la création de l'annonce
router.post(
  "/",
  auth,
  upload.single("imageFile"),
  publicationCtrl.createPublication
);

// Route pour afficher toutes les publications
router.get("/", publicationCtrl.getAllPublication);

router.get("/:id", publicationCtrl.getOnePublication);

// modifications de la publication
router.put(
  "/:id",
  auth,
  upload.single("imageFile"),
  publicationCtrl.modifyPublication
);

// Suppression de la publication
router.delete("/:id", auth, publicationCtrl.deletePublication);

module.exports = router;
