const express = require("express");
//Pour créer une application express
const app = express();
const cors = require("cors");
const path = require("path");
const multer = require("multer");

//Transformer le corps(body)en json objet js utilisable req.body.
app.use(express.json());

// Utiliser body-parser pour analyser les données du corps de la requête
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Le middleware d'authentification pour toutes les routes

//Importation user
const userRoutes = require("./routes/user");
// Utilisation des routes
app.use("/users", userRoutes);

// // Route pour la connexion

//Publication

const publicationRoutes = require("./routes/publication");
app.use("/publications", publicationRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur Multer (par exemple, taille maximale du fichier dépassée)
    res.status(400).json({ message: "Erreur lors de l'upload du fichier" });
  } else {
    // Autre erreur
    res.status(500).json({ message: "Une erreur interne s'est produite" });
  }
});
module.exports = app;
