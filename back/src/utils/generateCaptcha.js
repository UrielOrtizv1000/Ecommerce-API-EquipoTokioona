const crypto = require("crypto");

const captchaStore = new Map();

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captchaText = "";

  for (let index = 0; index < 6; index += 1) {
    captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const captchaId = crypto.randomBytes(16).toString("hex");

  captchaStore.set(captchaId, {
    text: captchaText,
    expires: Date.now() + 5 * 60 * 1000,
  });

  cleanupExpired();

  return { captchaId, captchaText };
};

const verifyCaptcha = (captchaId, userInput) => {
  const captchaData = captchaStore.get(captchaId);

  if (!captchaData) {
    return { valid: false, reason: "CAPTCHA was not found or already expired." };
  }

  if (Date.now() > captchaData.expires) {
    captchaStore.delete(captchaId);
    return { valid: false, reason: "CAPTCHA expired." };
  }

  if (!userInput) {
    return { valid: false, reason: "CAPTCHA text is required." };
  }

  const isValid = captchaData.text.toLowerCase() === userInput.toLowerCase();
  if (isValid) {
    captchaStore.delete(captchaId);
  }

  return {
    valid: isValid,
    reason: isValid ? "CAPTCHA validated." : "Incorrect CAPTCHA text.",
  };
};

const deleteCaptcha = (captchaId) => captchaStore.delete(captchaId);

const cleanupExpired = () => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now > data.expires) {
      captchaStore.delete(id);
    }
  }
};

module.exports = { generateCaptcha, verifyCaptcha, deleteCaptcha };
