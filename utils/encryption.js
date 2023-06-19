const crypto = require("crypto");

function generateEncryptionKey() {
  const key = crypto.randomBytes(32); // Génère une clé de 32 octets (256 bits)
  return key.toString("hex"); // Retourne la clé sous forme de chaîne hexadécimale
}

const encryptionKey = generateEncryptionKey();
console.log("Clé de chiffrement :", encryptionKey);
