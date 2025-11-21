//here u are going to generate image + aletory text
//save it in session or temporal DB
const Recaptcha = require('express-recaptcha').RecaptchaV2;

// Initialize with keys stored in .env file
const recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

module.exports = recaptcha;