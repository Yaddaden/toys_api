//importer le package pour utiliser les variables d'environnement
const dotenv = require("dotenv");
dotenv.config();

//Importer mysql
const mysql2 = require("mysql2");

//Les paramètres de connexion a la bd
const connection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
//Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.log(`error connecting: ${err.stack}`);
  } else {
    console.log("Connecté à la base de donnée mysql");
    console.log(`connected as id ${connection.threadId}`);
  }
});

module.exports = connection;
