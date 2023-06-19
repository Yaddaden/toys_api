const express = require("express");
const router = express.Router();

const useCtrl = require("../controllers/user");

// Route pour la création d'un utilisateur
router.post("/signup", useCtrl.signup);
router.post("/login", useCtrl.login);

// Exportez le router pour pouvoir l'utiliser ailleurs
module.exports = router;
