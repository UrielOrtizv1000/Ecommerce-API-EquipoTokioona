// Genera CAPTCHA de texto simple
const crypto = require('crypto');

// Almacén temporal en memoria (en producción usar Redis o DB)
const captchaStore = new Map();

const generateCaptcha = () => {
  // Generar texto aleatorio de 6 caracteres (solo letras y números)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  let captchaText = '';
  
  for (let i = 0; i < 6; i++) {
    captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generar ID único para este CAPTCHA
  const captchaId = crypto.randomBytes(16).toString('hex');
  
  // Guardar en memoria con expiración (5 minutos)
  captchaStore.set(captchaId, {
    text: captchaText,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutos
  });
  
  // Limpiar CAPTCHAs expirados periódicamente
  cleanupExpired();
  
  return { captchaId, captchaText };
};

const verifyCaptcha = (captchaId, userInput) => {
  const captchaData = captchaStore.get(captchaId);
  
  if (!captchaData) {
    console.log('❌ CAPTCHA no encontrado en store');
    return { valid: false, reason: 'CAPTCHA no encontrado o expirado' };
  }
  
  // Verificar expiración
  if (Date.now() > captchaData.expires) {
    captchaStore.delete(captchaId);
    console.log('❌ CAPTCHA expirado');
    return { valid: false, reason: 'CAPTCHA expirado' };
  }
  
  // Comparar texto (case insensitive)
  const isValid = captchaData.text.toLowerCase() === userInput.toLowerCase();
  

  
  return { 
    valid: isValid, 
    reason: isValid ? 'CAPTCHA válido' : 'Texto incorrecto',
    captchaData // Devolvemos los datos para uso posterior
  };
};

// Nueva función para eliminar CAPTCHA después de login exitoso
const deleteCaptcha = (captchaId) => {
  return captchaStore.delete(captchaId);
};

// Limpiar CAPTCHAs expirados
const cleanupExpired = () => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now > data.expires) {
      captchaStore.delete(id);
    }
  }
};

module.exports = { generateCaptcha, verifyCaptcha };