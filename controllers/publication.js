// //Création de la publication

// const connection = require("../db/db.mysql");
// const fs = require("fs");

// exports.createPublication = (req, res) => {
//   const { nom, marque, age, description, etat, email, telephone, prix } =
//     req.body;

//   const image = req.file; // Obtenez le fichier image téléchargé
//   if (!req.auth.userId) {
//     res
//       .status(401)
//       .json({ message: "tu n'est pas autorisé à créer l'annonce " });
//   }
//   const query =
//     "INSERT INTO publications (nom, marque, age, description, etat, email, telephone, prix, image, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

//   connection.query(
//     query,
//     [
//       nom,
//       marque,
//       age,
//       description,
//       etat,
//       email,
//       telephone,
//       prix,
//       image.filename,
//       req.auth.userId,
//     ],
//     (err, results) => {
//       if (err) {
//         res.status(500).send("Error inserting publication into database");
//       } else {
//         res.status(200).json(results);
//       }
//     }
//   );
// };

// //Affichage de toutes les annonces
// exports.getAllPublication = (req, res) => {
//   const query = "SELECT * FROM publications";
//   connection.query(query, (err, results) => {
//     if (err) {
//       res.status(500).send("Error retrieving publications from database");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };

// exports.getOnePublication = (req, res) => {
//   const query = "SELECT * FROM publications WHERE id = ?";
//   connection.query(query, [req.params.id], (err, results) => {
//     if (err) {
//       res.status(500).send("Error retrieving publications from database");
//     } else {
//       res.status(200).json(results[0]);
//     }
//   });
// };

// //Modifier

// exports.modifyPublication = (req, res) => {
//   const { nom, marque, age, description, etat, email, telephone, prix } =
//     req.body;

//   const image = req.file;
//   console.log(image);

//   const publicationId = req.params.id;

//   //requête pour vérifier si l'utilisateur est propriétaire de la publication
//   const userId = req.auth.userId;
//   console.log(userId);

//   const checkOwnershipQuery =
//     "SELECT * FROM publications WHERE id = ? AND userId = ?";
//   connection.query(
//     checkOwnershipQuery,
//     [publicationId, userId],
//     (error, results) => {
//       console.log("erreurQuery =>", error);
//       console.log("resultQuery =>", results);
//       if (error) {
//         res.status(500).send("Error checking publication ownership");
//       } else if (results.length === 0) {
//         res.status(401).send("Unauthorized to modify this publication");
//       } else {
//         // Supprimer l'ancienne image
//         const getOldImageNameQuery =
//           "SELECT image FROM publications WHERE id = ? AND userId = ?";
//         connection.query(
//           getOldImageNameQuery,
//           [publicationId, userId],
//           (error, results) => {
//             if (error) {
//               res.status(500).send("Error retrieving old image name");
//             } else if (results.length > 0) {
//               const oldImageName = results[0].image;
//               deleteImage(oldImageName);
//             }
//           }
//         );

//         let query;
//         let queryValues;
//         if (image) {
//           query =
//             "UPDATE publications SET nom = ?, marque = ?, age = ?, description = ?, etat = ?, email = ?, telephone = ?, prix = ?, image = ? WHERE id = ? AND userId = ?";

//           queryValues = [
//             nom,
//             marque,
//             age,
//             description,
//             etat,
//             email,
//             telephone,
//             prix,
//             image.filename,
//             publicationId,
//             userId,
//           ];
//         } else {
//           query =
//             "UPDATE publications SET nom = ?, marque = ?, age = ?, description = ?, etat = ?, email = ?, telephone = ?, prix = ? WHERE id = ? AND userId = ?";
//           queryValues = [
//             nom,
//             marque,
//             age,
//             description,
//             etat,
//             email,
//             telephone,
//             prix,
//             publicationId,
//             userId,
//           ];
//         }
//         console.log(userId, publicationId),
//           connection.query(query, queryValues, (err, results) => {
//             if (err) {
//               res.status(500).send("Error updating publication in database");
//             } else {
//               res.status(200).json(results);
//             }
//           });
//       }
//     }
//   );
// };

// //Suppression
// exports.deletePublication = (req, res) => {
//   const publicationId = req.params.id;
//   const userId = req.auth.userId;

//   // Vérifier si l'utilisateur est propriétaire de la publication
//   const checkOwnershipQuery =
//     "SELECT * FROM publications WHERE id = ? AND userId = ?";
//   connection.query(
//     checkOwnershipQuery,
//     [publicationId, userId],
//     (error, results) => {
//       if (error) {
//         res.status(500).send("Error checking publication ownership");
//       } else if (results.length === 0) {
//         res.status(401).send("Unauthorized to delete this publication");
//       } else {
//         // L'utilisateur est propriétaire, supprimer la publication
//         const deleteQuery = "DELETE FROM publications WHERE id = ?";
//         connection.query(deleteQuery, [publicationId], (err, result) => {
//           if (err) {
//             res.status(500).send("Error deleting publication from database");
//           } else {
//             // Obtenir le nom du fichier image de la publication supprimée
//             const imageName = results[0].image;
//             res.status(200).json(result);

//             // Appeler une fonction pour supprimer le fichier image du dossier backend
//             deleteImage(imageName);
//             console.log(imageName);
//           }
//         });
//       }
//     }
//   );
// };

// //Suppression des images
// const deleteImage = (imageName) => {
//   const imagePath = `C:\\Users\\Pitch\\OneDrive\\Documents\\toys_api\\images\\${imageName}`;

//   fs.unlink(imagePath, (err) => {
//     if (err) {
//       console.error("Erreur lors de la suppression du fichier image :", err);
//     } else {
//       console.log("Fichier image supprimé avec succès !");
//     }
//   });
// };

//----------------------------Essaie------------------------------
//Création de la publication

const connection = require("../db/db.mysql");
const fs = require("fs");

exports.createPublication = (req, res) => {
  const { nom, marque, age, description, etat, email, telephone, prix } =
    req.body;

  const image = req.files; // Obtenez le fichier image téléchargé
  if (!req.auth.userId) {
    res
      .status(401)
      .json({ message: "tu n'est pas autorisé à créer l'annonce " });
  }
  console.log(image);
  if (!image || image.length === 0) {
    res.status(400).json({ message: "Aucune image téléchargée." });
    return;
  }

  const userId = req.auth.userId;
  const query =
    "INSERT INTO publications (nom, marque, age, description, etat, email, telephone, prix, image, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const insertions = [];
  console.log(image);
  image.forEach((image) => {
    insertions.push([
      nom,
      marque,
      age,
      description,
      etat,
      email,
      telephone,
      prix,
      image.filename,
      userId,
    ]);
  });
  console.log(insertions);
  console.log(image);
  connection.beginTransaction((err) => {
    if (err) {
      res.status(500).send("Error beginning database transaction");
      return;
    }

    connection.query(query, insertions, (err, results) => {
      if (err) {
        connection.rollback(() => {
          res.status(500).send("Error inserting publications into database");
        });
      } else {
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              res.status(500).send("Error committing database transaction");
            });
          } else {
            res.status(200).json({
              message:
                "Les images ont été téléchargées et traitées avec succès.",
            });
          }
        });
      }
    });
  });
};

//Affichage de toutes les annonces
exports.getAllPublication = (req, res) => {
  const query = "SELECT * FROM publications";
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

  const image = req.files;
  console.log(image);

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
        // Supprimer l'ancienne image
        const getOldImageNameQuery =
          "SELECT image FROM publications WHERE id = ? AND userId = ?";
        connection.query(
          getOldImageNameQuery,
          [publicationId, userId],
          (error, results) => {
            if (error) {
              res.status(500).send("Error retrieving old image name");
            } else if (results.length > 0) {
              const oldImageName = results[0].image;
              deleteImage(oldImageName);
            }
          }
        );

        let query;
        let queryValues;
        if (image) {
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
            image.filename,
            publicationId,
            userId,
          ];
        } else {
          query =
            "UPDATE publications SET nom = ?, marque = ?, age = ?, description = ?, etat = ?, email = ?, telephone = ?, prix = ? WHERE id = ? AND userId = ?";
          queryValues = [
            nom,
            marque,
            age,
            description,
            etat,
            email,
            telephone,
            prix,
            publicationId,
            userId,
          ];
        }
        console.log(userId, publicationId),
          connection.query(query, queryValues, (err, results) => {
            if (err) {
              res.status(500).send("Error updating publication in database");
            } else {
              res.status(200).json(results);
            }
          });
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
            // Obtenir le nom du fichier image de la publication supprimée
            const imageName = results[0].image;
            res.status(200).json(result);

            // Appeler une fonction pour supprimer le fichier image du dossier backend
            deleteImage(imageName);
            console.log(imageName);
          }
        });
      }
    }
  );
};

//Suppression des images
const deleteImage = (imageName) => {
  const imagePath = `C:\\Users\\Pitch\\OneDrive\\Documents\\toys_api\\images\\${imageName}`;

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du fichier image :", err);
    } else {
      console.log("Fichier image supprimé avec succès !");
    }
  });
};
