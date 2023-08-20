//Création de la publication

const connection = require("../db/db.mysql");
const fs = require("fs");
const path = require("path");
exports.createPublication = (req, res) => {
  const { nom, marque, age, description, etat, email, telephone, prix } =
    req.body;

  const images = req.files; // Obtenez le fichier image téléchargé

  const imagesPaths = [];

  images.forEach((image) => {
    imagesPaths.push(image.path);
  });

  const imagesString = JSON.stringify(imagesPaths);

  if (!req.auth.userId) {
    res
      .status(401)
      .json({ message: "tu n'est pas autorisé à créer l'annonce " });
  }

  if (!images || images.length === 0) {
    return res.status(400).json({ message: "Aucune image téléchargée." });
  }

  // Vérifier le nombre d'images téléchargées
  const maxImageCount = 5;
  if (images.length > maxImageCount) {
    return res.status(400).json({
      message: `Vous ne pouvez télécharger que ${maxImageCount} images.`,
    });
  }

  const query =
    "INSERT INTO publications (nom, marque, age, description, etat, email, telephone, prix, image, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const insertions = [
    nom,
    marque,
    age,
    description,
    etat,
    email,
    telephone,
    prix,
    imagesString,
    req.auth.userId,
  ];

  connection.query(query, insertions, (err) => {
    if (err) {
      res.status(500).send("Error inserting publications into database");
    }

    res.status(200).json({
      message:
        "Les images et l'annonce ont été téléchargées et traitées avec succès.",
    });
  });
};

//Affichage de toutes les annonces
exports.getAllPublication = (req, res) => {
  const query = "SELECT * FROM publications ORDER BY created_at DESC ";
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving publications from database");
    } else {
      res.status(200).json(results);
    }
  });
};

exports.getOnePublication = (req, res) => {
  const query = "SELECT * FROM publications WHERE id = ?";
  connection.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving publications from database");
    } else {
      res.status(200).json(results[0]);
    }
  });
};

//Modifier

exports.modifyPublication = (req, res) => {
  const { nom, marque, age, description, etat, email, telephone, prix } =
    req.body;

  const newImages = req.files; // Nouvelles images à ajouter
  console.log(newImages);

  const publicationId = req.params.id;

  //requête pour vérifier si l'utilisateur est propriétaire de la publication
  const userId = req.auth.userId;
  console.log(userId);

  const checkOwnershipQuery =
    "SELECT * FROM publications WHERE id = ? AND userId = ?";
  connection.query(
    checkOwnershipQuery,
    [publicationId, userId],
    (error, results) => {
      console.log("erreurQuery =>", error);
      console.log("resultQuery =>", results);
      if (error) {
        res.status(500).send("Error checking publication ownership");
      } else if (results.length === 0) {
        res.status(401).send("Unauthorized to modify this publication");
      } else {
        let query;
        let queryValues;

        connection.query(
          "SELECT image FROM publications WHERE id = ?",
          [publicationId],
          (error, oldResults) => {
            if (error) {
              return res.status(500).send("Error retrieving old image paths");
            }
            const oldImagePaths = JSON.parse(oldResults[0].image || "[]");
            const newImagePaths = [...oldImagePaths];

            if (newImages && newImages.length > 0) {
              newImages.forEach((image) => {
                newImagePaths.push(`images\\${path.basename(image.path)}`);
              });
            }

            const imagesString = JSON.stringify(newImagePaths);

            query =
              "UPDATE publications SET nom = ?, marque = ?, age = ?, description = ?, etat = ?, email = ?, telephone = ?, prix = ?, image = ? WHERE id = ? AND userId = ?";

            queryValues = [
              nom,
              marque,
              age,
              description,
              etat,
              email,
              telephone,
              prix,
              imagesString,
              publicationId,
              userId,
            ];

            console.log(userId, publicationId);

            connection.query(query, queryValues, (err, results) => {
              if (err) {
                res.status(500).send("Error updating publication in database");
              } else {
                res.status(200).json(results);
              }
            });
          }
        );
      }
    }
  );
};

//Suppression
exports.deletePublication = (req, res) => {
  const publicationId = req.params.id;
  const userId = req.auth.userId;

  // Vérifier si l'utilisateur est propriétaire de la publication
  const checkOwnershipQuery =
    "SELECT * FROM publications WHERE id = ? AND userId = ?";
  connection.query(
    checkOwnershipQuery,
    [publicationId, userId],
    (error, results) => {
      if (error) {
        res.status(500).send("Error checking publication ownership");
      } else if (results.length === 0) {
        res.status(401).send("Unauthorized to delete this publication");
      } else {
        // L'utilisateur est propriétaire, supprimer la publication

        const deleteQuery = "DELETE FROM publications WHERE id = ?";
        connection.query(deleteQuery, [publicationId], (err, result) => {
          if (err) {
            res.status(500).send("Error deleting publication from database");
          } else {
            // Supprimer les images liées à la publication du dossier backend
            const imageNamesArray = JSON.parse(results[0].image || "[]");
            imageNamesArray.forEach((imageName) => {
              deleteImage(imageName);
            });

            res.status(200).json(result);
          }
        });
      }
    }
  );
};

// Supprimer une image spécifique d'une publication
exports.deletePublicationImage = (req, res) => {
  const publicationId = req.params.id;
  const userId = req.auth.userId;
  const imageName = req.body.imageName; // Le nom de l'image à supprimer
  console.log("Image Name:", imageName);
  // Vérifier si l'utilisateur est propriétaire de la publication
  const checkOwnershipQuery =
    "SELECT * FROM publications WHERE id = ? AND userId = ?";
  connection.query(
    checkOwnershipQuery,
    [publicationId, userId],
    (error, results) => {
      if (error) {
        res.status(500).send("Error checking publication ownership");
      } else if (results.length === 0) {
        res.status(401).send("Unauthorized to modify this publication");
      } else {
        // Récupérer les noms d'images depuis la base de données
        const imageNamesArray = JSON.parse(results[0].image || "[]"); // Convertir en tableau
        const updatedImageNamesArray = imageNamesArray.filter(
          (name) => name !== imageName
        );

        // Supprimer le fichier image du dossier backend
        deleteImage(imageName);

        // Mettre à jour la base de données pour retirer le nom de l'image
        const updateImageQuery =
          "UPDATE publications SET image = ? WHERE id = ?";
        connection.query(
          updateImageQuery,
          [JSON.stringify(updatedImageNamesArray), publicationId],
          (err, result) => {
            if (err) {
              res.status(500).send("Error updating image in database");
            } else {
              res.status(200).json(result);
            }
          }
        );
      }
    }
  );
};
//Suppression dans le dossier images
const deleteImage = (imageName) => {
  // Supprimer les crochets entourant le nom de l'image
  const cleanImageName = imageName.replace(/[\[\]"]/g, "");

  // Supprimer le premier élément "images\\" du chemin
  const imagePathWithoutImages = cleanImageName.replace("images\\", "");

  const imagePath = `./images/${imagePathWithoutImages}`;
  console.log("Image Path:", imagePath);

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du fichier image :", err);
    } else {
      console.log("Fichier image supprimé avec succès !");
    }
  });
};
