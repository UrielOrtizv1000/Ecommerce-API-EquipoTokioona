// Hashing password input (NEVER STORE PASSWORDS AS PLAINTEXT IN DB!!!)
const bcrypt = require("bcryptjs");

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return hash;
}

module.exports = hashPassword;