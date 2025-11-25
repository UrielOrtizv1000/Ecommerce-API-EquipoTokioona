// front/js/apiClient.js

/**
 * Cliente centralizado para todas las peticiones al Backend.
 * Reemplaza la antigua carpeta 'api'.
 */
const BASE_URL = 'http://localhost:3000/api'; // ASUMIR URL BASE DEL BACKEND

const ApiClient = {
    // Función de utilidad para manejar la respuesta
    _handleResponse: async (response) => {
        const data = await response.json();
        // El backend maneja 'ok: true/false' y un status http adecuado
        if (response.ok) {
            return { ok: true, data };
        } else {
            // El mensaje de error viene del backend
            return { ok: false, message: data.message || 'Error desconocido del servidor' };
        }
    },

    // --- AUTENTICACIÓN ---

    /**
     * Petición de Login.
     * @param {Object} credentials - { username, password, 'g-recaptcha-response' }
     * @returns {Promise<Object>} - { ok: boolean, data/message }
     */
    async login(credentials) {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            return ApiClient._handleResponse(response);
        } catch (error) {
            return { ok: false, message: 'Error de conexión con el servidor.' };
        }
    },

    /**
     * Petición de Registro.
     * @param {Object} userData - { username, email, password }
     * @returns {Promise<Object>} - { ok: boolean, data/message }
     */
    async signup(userData) {
        try {
            const response = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            return ApiClient._handleResponse(response);
        } catch (error) {
            return { ok: false, message: 'Error de conexión con el servidor.' };
        }
    },

    /**
     * Petición de Logout (protegida por token).
     * @param {string} token - JWT del usuario.
     * @returns {Promise<Object>} - { ok: boolean, data/message }
     */
    async logout(token) {
        try {
            const response = await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Usar JWT
                },
            });
            return ApiClient._handleResponse(response);
        } catch (error) {
            return { ok: false, message: 'Error de conexión al cerrar sesión.' };
        }
    },

    // --- CAPTCHA ---
    
    /**
     * Obtiene el script del Captcha Widget.
     * @returns {Promise<string>} - HTML del widget.
     */
    async getCaptchaWidget() {
        try {
            const response = await fetch(`${BASE_URL}/auth/getCaptchaWidget`);
            if (!response.ok) {
                 return '<div class="captcha-error">No se pudo cargar el CAPTCHA.</div>';
            }
            return await response.text();
        } catch (error) {
            return '<div class="captcha-error">Error de red al cargar el CAPTCHA.</div>';
        }
    },

    // [Añadir otras peticiones (productos, carrito, etc.) aquí]
};