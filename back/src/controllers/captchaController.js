const { generateCaptcha } = require("../utils/generateCaptcha");

const getCaptcha = (_req, res) => {
  try {
    const { captchaId, captchaText } = generateCaptcha();

    return res.status(200).json({
      ok: true,
      captchaId,
      captchaText,
    });
  } catch (error) {
    console.error("Error generating CAPTCHA:", error);
    return res.status(500).json({
      ok: false,
      message: "Error generating CAPTCHA.",
    });
  }
};

module.exports = { getCaptcha };
