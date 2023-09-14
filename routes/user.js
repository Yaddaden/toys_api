const express = require("express");
const router = express.Router();
const useCtrl = require("../controllers/user");
const authCtrl = require("../controllers/authController");

// Route pour la création d'un utilisateur
router.post("/oauth2callback", useCtrl.oauth2callback);
router.post("/signup", useCtrl.signup);
router.post("/login", useCtrl.login);

// Route pour la rénitialisation du mot de passe
router.post("/reset-password", authCtrl.generatePasswordResetToken);

// Exportez le router pour pouvoir l'utiliser ailleurs
module.exports = router;
