window.APP_CONFIG = {
    BACK_URL: "https://tookiona-backend-production-5312.up.railway.app" 
};

document.addEventListener('DOMContentLoaded', () => {
    const BACK_URL = window.APP_CONFIG.BACK_URL;

    if (!BACK_URL) {
        console.error("Error de configuración: BACK_URL no definida en window.APP_CONFIG");
        return; 
    }

    const imagesToUpdate = document.querySelectorAll('img[data-path]');
    
    imagesToUpdate.forEach(img => {
        const imagePath = img.getAttribute('data-path');
        img.src = BACK_URL + imagePath;
    });
});