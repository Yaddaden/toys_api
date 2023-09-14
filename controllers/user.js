// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const connection = require("../db/db.mysql");
// const dotenv = require("dotenv");
// dotenv.config();

// //Inscription
// exports.signup = (req, res) => {
//   const { first_name, last_name, password, email, telephone } = req.body;
//   //extraire correctement les valeurs de req.body
//   if (!first_name || !last_name || !password || !email || !telephone) {
//     return res.status(400).send("Missing required fields");
//   }
//   console.log(req.body);
//   // Hachage du mot de passe avant insertion dans la base de données
//   bcrypt.hash(password, 10, (err, hash) => {
//     if (err) {
//       console.error("Error hashing password: ", err);
//       res.status(500).send("Error hashing password");
//     } else {
//       const sql =
//         "INSERT INTO users (first_name,last_name, password, email, telephone)VALUES(?, ?, ?, ?,?)";

//       const values = [first_name, last_name, hash, email, telephone];

//       connection.query(sql, values, (error, result) => {
//         if (error) {
//           console.error("Error inserting user: ", error);
//           res.status(500).send("Error inserting user into database");
//         } else {
//           console.log("Utilisateur créé!");
//           res.send(result);
//         }
//       });
//     }
//   });
// };

// //Connexion
// exports.login = (req, res) => {
//   console.log(
//     "Requête d'inscription reçue avec les informations suivantes :",
//     req.body
//   );
//   const email = req.body.email;
//   const password = req.body.password;

//   // Vérification de l'authentification
//   connection.query(
//     "SELECT * FROM users WHERE email = ?",
//     [email],
//     (error, results) => {
//       if (error) {
//         console.log("Erreur lors de l'exécution de la requête :", error);
//         return res.status(500).json({ error });
//       }
//       if (results.length === 0) {
//         console.log("Aucun utilisateur trouvé avec cet email.");
//         return res.status(401).json({ error: "Invalid credentials" });
//       }

//       const user = results[0];

//       bcrypt.compare(password, user.password, (err, isMatch) => {
//         if (err) {
//           console.log("Erreur lors de la comparaison des mots de passe :", err);
//           return res.status(500).json({ error: "Internal server error" });
//         }

//         if (!isMatch) {
//           console.log("Le mot de passe est incorrect.");
//           return res.status(401).json({ error: "Invalid credentials" });
//         }

//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
//           expiresIn: "2h",
//         });

//         console.log("TOKENBACK:", token);

//         // Insertion des données dans la table "login" avec le mot de passe hashé

//         bcrypt.hash(password, 10, (err, hashedPassword) => {
//           if (err) {
//             console.error("Error hashing password: ", err);
//             return res.status(500).send("Error hashing password");
//           }

//           connection.query(
//             "INSERT INTO login (email, password) VALUES (?, ?)",
//             [email, hashedPassword],
//             (error) => {
//               if (error) {
//                 console.log("Erreur lors de l'insertion des données :", error);
//                 return res.status(500).json({ error });
//               }

//               console.log("Connexion réussie !");
//               res.status(200).json({ userId: user.id, token });
//             }
//           );
//         });
//       });
//     }
//   );
// };

//-------------------------------------Essaie-------------------------------
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const connection = require("../db/db.mysql");
const dotenv = require("dotenv");
dotenv.config();

// //______________________________________________
exports.oauth2callback = (req, res) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  // Création d'une instance de la bibliothèque OAuth2Client
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  // Générer l'URL d'autorisation avec access_type: "offline"
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // Pour obtenir le REFRESH_TOKEN
    scope: ["https://www.googleapis.com/auth/gmail.send"], // Les autorisations requises pour envoyer des e-mails
  });
  res.redirect(authUrl);

  console.log("Autorisez cette application en visitant cette URL :", authUrl);

  // Récupérez le code d'autorisation depuis la requête
  const code = req.query.code;
  console.log(code);

  oAuth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error("Erreur lors de l'échange du code d'autorisation:", err);
      res.status(500).send("Erreur lors de l'échange du code d'autorisation");
      return;
    }

    const REFRESH_TOKEN = tokens.refresh_token;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USERNAME,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: tokens.access_token, // le jeton d'accès obtenu
      },
    });

    const mailOptions = {
      from: EMAIL_USERNAME,
      to: "destinataire@example.com",
      subject: "Sujet de l'e-mail",
      text: "Contenu de l'e-mail",
    };

    // Envoyez l'e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Erreur lors de l'envoi de l'e-mail :", error);
        res.status(500).send("Erreur lors de l'envoi de l'e-mail");
      } else {
        console.log("E-mail envoyé avec succès :", info.response);
        res.status(200).send("E-mail envoyé avec succès");
      }
    });
  });
};
//_______________________________________________

//Inscription
exports.signup = (req, res) => {
  const { first_name, last_name, password, email } = req.body;
  //extraire correctement les valeurs de req.body
  if (!first_name || !last_name || !password || !email) {
    return res.status(400).send("Missing required fields");
  }
  console.log(req.body);

  //------------------------------------------------------------------------------------
  // Requête pour vérifier si l'utilisateur a réussi l'authentification OAuth2 en consultant la base de données
  const checkOAuthQuery = "SELECT is_oauth_verified FROM users WHERE email = ?";

  connection.query(checkOAuthQuery, [email], (error, results) => {
    if (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification OAuth2 :",
        error
      );
      return res
        .status(500)
        .send("Erreur lors de la vérification de l'authentification OAuth2");
    }

    const isOAuthVerified = results[0] ? results[0].is_oauth_verified : null;

    // Si l'utilisateur n'a pas réussi l'authentification OAuth2, renvoyez une erreur
    if (isOAuthVerified !== 1) {
      // L'utilisateur a réussi l'authentification OAuth2, vous pouvez maintenant vérifier si l'email existe déjà dans la base de données
      const checkEmailQuery = "SELECT * FROM users WHERE email = ?";

      connection.query(checkEmailQuery, [email], (emailError, emailResults) => {
        if (emailError) {
          console.error(
            "Erreur lors de la vérification de l'email :",
            emailError
          );
          return res
            .status(500)
            .send("Erreur lors de la vérification de l'email");
        }

        if (emailResults.length > 0) {
          // L'email existe déjà, renvoyer une erreur
          return res.status(409).send("L'email existe déjà");
        }
        //------------------------------------------------------------------------------------
        // Hachage du mot de passe avant insertion dans la base de données
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.error("Error hashing password: ", err);
            res.status(500).send("Error hashing password");
          } else {
            const sql =
              "INSERT INTO users (first_name,last_name, password, email)VALUES(?, ?, ?, ?)";

            const values = [first_name, last_name, hash, email];

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
      });
    }
    //-----------------------------------------------------------------------
    else {
      // L'authentification OAuth2 a échoué, renvoyer une erreur
      return res
        .status(401)
        .send("L'authentification OAuth2 est requise pour l'inscription.");
    }
  });
};
//------------------------------------------------------------------------------------
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
        return res
          .status(401)
          .json({ error: " Pour vous connecter tapez votre mail et password" });
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log("Erreur lors de la comparaison des mots de passe :", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!isMatch) {
          console.log("Le mot de passe est incorrect.");
          return res.status(401).json({ error: "Le password est incorrect" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "2h",
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
