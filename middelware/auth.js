const jwt = require("jsonwebtoken"); // Package téléchargé.
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Pour récupérer le token

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        (req.auth = null),
          res.status(401).json({
            message: "Vous n'etes pas autorisé pour la modification ",
          });
      } else {
        req.auth = {
          userId: decoded.userId,
        };
        next();
      }
    });
  } catch (error) {
    res.status(401).json({ error: "Problème avec votre token" });
  }
};
