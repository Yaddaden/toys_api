const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const connection = require("../db/db.mysql");
const dotenv = require("dotenv");
dotenv.config();

// Générer le token de réinitialisation de mot de passe
exports.generatePasswordResetToken = (req, res) => {
  const email = req.body.email;
  console.log("Received reset password request for email:", email);
  // Vérification de l'existence de l'adresse e-mail dans la base de données
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.log(
          "Erreur lors de la vérification de l'adresse e-mail :",
          error
        );
        return res.status(500).json({ error });
      }

      if (results.length === 0) {
        console.log("Aucun utilisateur trouvé avec cet e-mail.", email);
        return res
          .status(404)
          .json({ message: "Aucun utilisateur trouvé avec cet e-mail." });
      }

      const user = results[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Durée de validité du token (1 heure )
      });

      // Envoi de l'e-mail avec le lien de réinitialisation contenant le token
      const emailUsername = process.env.EMAIL_USERNAME;
      const emailPassword = process.env.EMAIL_PASSWORD;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUsername,
          pass: emailPassword,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Réinitialisation de mot de passe",
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${process.env.RESET_PASSWORD_URL}/${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Erreur lors de l'envoi de l'e-mail :", error);
          return res.status(500).json({ error });
        } else {
          console.log(
            "E-mail de réinitialisation envoyé avec succès :",
            info.response
          );
          res.status(200).json({
            message: "E-mail de réinitialisation envoyé avec succès.",
          });
        }
      });
    }
  );
};
