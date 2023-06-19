const crypto = require("crypto");

function generateSecretKey(length) {
  return crypto.randomBytes(length).toString("hex");
}

const secretKey = generateSecretKey(32);
console.log("Clé secrète générée :", secretKey);
