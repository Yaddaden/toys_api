// const express = require("express");

// const connection = require("../db/db.mysql");

// // Middleware d'autorisation
// exports.authorizeUser = (req, res, next) => {
//   const publicationId = req.params.id;
//   console.log("PUBLICATION:", publicationId);
//   const userId = req.user.id;
//   console.log("USERID:", userId);

//   // Vérifier si l'utilisateur est le propriétaire de la publication
//   const query = "SELECT * FROM publications WHERE id = ? AND user_id = ?";
//   connection.query(query, [publicationId, userId], (err, results) => {
//     if (err) {
//       // Erreur lors de la vérification de l'autorisation, renvoyer une erreur 500 (erreur interne du serveur)
//       res.status(500).send("Error checking authorization");
//     } else if (results.length === 0) {
//       // L'utilisateur n'est pas autorisé à modifier cette publication, renvoyer une erreur 403 (interdit)
//       res.status(403).send("Forbidden");
//     } else {
//       // L'utilisateur est autorisé, passer à l'étape suivante
//       next();
//     }
//   });
// };
