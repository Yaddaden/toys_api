const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../db/db.mysql");
const dotenv = require("dotenv");
dotenv.config();

//Inscription
exports.signup = (req, res) => {
  const { first_name, last_name, password, email, telephone } = req.body;
  //extraire correctement les valeurs de req.body
  if (!first_name || !last_name || !password || !email || !telephone) {
    return res.status(400).send("Missing required fields");
  }
  console.log(req.body);
  // Hachage du mot de passe avant insertion dans la base de données
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password: ", err);
      res.status(500).send("Error hashing password");
    } else {
      const sql =
        "INSERT INTO users (first_name,last_name, password, email, telephone)VALUES(?, ?, ?, ?,?)";

      const values = [first_name, last_name, hash, email, telephone];

      connection.query(sql, values, (error, result) => {
        if (error) {
          console.error("Error inserting user: ", error);
          res.status(500).send("Error inserting user into database");
        } else {
          console.log("Utilisateur créé!");
          res.send(result);
        }
      });
    }
  });
};

//Connexion
exports.login = (req, res) => {
  console.log(
    "Requête d'inscription reçue avec les informations suivantes :",
    req.body
  );
  const email = req.body.email;
  const password = req.body.password;

  // Vérification de l'authentification
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.log("Erreur lors de l'exécution de la requête :", error);
        return res.status(500).json({ error });
      }
      if (results.length === 0) {
        console.log("Aucun utilisateur trouvé avec cet email.");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log("Erreur lors de la comparaison des mots de passe :", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!isMatch) {
          console.log("Le mot de passe est incorrect.");
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        console.log("TOKENBACK:", token);

        // Insertion des données dans la table "login" avec le mot de passe hashé

        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password: ", err);
            return res.status(500).send("Error hashing password");
          }

          connection.query(
            "INSERT INTO login (email, password) VALUES (?, ?)",
            [email, hashedPassword],
            (error) => {
              if (error) {
                console.log("Erreur lors de l'insertion des données :", error);
                return res.status(500).json({ error });
              }

              console.log("Connexion réussie !");
              res.status(200).json({ userId: user.id, token });
            }
          );
        });
      });
    }
  );
};
