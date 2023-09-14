// const jwt = require("jsonwebtoken");

// const authenticateUser = (req, res, next) => {
//   // Récupérer le jeton d'authentification depuis les en-têtes de la requête
//   const token = req.headers.authorization;

//   // Vérifier si le jeton est présent
//   if (!token) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     // Vérifier et décoder le jeton
//     const decodedToken = jwt.verify(token, "your-secret-key");

//     // Ajouter les informations de l'utilisateur décodées à l'objet de requête (req.user)
//     req.user = decodedToken;

//     // Passer au middleware suivant
//     next();
//   } catch (error) {
//     // Le jeton est invalide ou a expiré
//     return res.status(401).send("Unauthorized");
//   }
// };

// module.exports = authenticateUser;
