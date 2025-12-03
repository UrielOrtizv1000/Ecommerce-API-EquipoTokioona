const { generateCaptcha } = require('../utils/generateCaptcha');

// Solo necesitamos esta función para el frontend
const getCaptcha = (req, res) => {
  try {
    const { captchaId, captchaText } = generateCaptcha();    
    res.status(200).json({
      ok: true,
      captchaId,
      captchaText
    });
  } catch (error) {
    console.error('❌ Error generating CAPTCHA:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al generar CAPTCHA'
    });
  }
};

// Ya no exportamos validateCaptcha porque lo hacemos dentro de authController
module.exports = { getCaptcha };