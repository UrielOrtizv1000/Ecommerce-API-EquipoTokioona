// front/js/auth.js
// Depende de ApiClient.js (asegúrate de incluirlo primero en tu HTML)

const Auth = {
    // --- LÓGICA DE SESIÓN ---

    // Login con credenciales
    async login(credentials) {
        const result = await ApiClient.login(credentials);
        
        if (result.ok) {
            // No necesitas la data del usuario en el frontend, el JWT ya la tiene.
            // Opcional: Podrías decodificar el JWT aquí para obtener el nombre de usuario
            // si el backend lo incluyera en el token y lo necesitaras para la UI.
            // Para simplificar, solo guardamos el token.
            const token = result.data.token;
            // Para obtener la data del usuario de forma simple para la UI:
            const userData = this._decodeToken(token); 

            if (userData) {
                this.setUserSession(userData, token);
                this.updateUserSection();
                return { success: true };
            }
            return { success: false, message: "Token inválido recibido." };
        } else {
            return { success: false, message: result.message };
        }
    },

    // Registro de nuevo usuario
    async register(userData) {
        // En tu backend, el registro no devuelve un token, así que
        // tras el registro exitoso, el usuario debe redirigirse al login.
        const result = await ApiClient.signup(userData);
        
        if (result.ok) {
            // Registro exitoso, no hay sesión automática
            return { success: true, message: "Registro exitoso. ¡Inicia sesión!" };
        } else {
            return { success: false, message: result.message };
        }
    },

    // Establecer sesión de usuario
    setUserSession(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    },

    // Cerrar sesión
    async logout() {
        const token = this.getToken();
        if (token) {
            // Petición al backend para disponer del token (opcional, pero buena práctica)
            await ApiClient.logout(token); 
        }

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.updateUserSection();
        // Redireccionar o recargar la página principal
        window.location.href = 'index.html'; 
    },

    // Obtener usuario actual de la sesión (solo para la UI)
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Obtener token
    getToken() {
        return localStorage.getItem('token');
    },

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return this.getToken() !== null;
    },
    
    // Función para decodificar el JWT (simple, sin validación de firma)
    _decodeToken(token) {
        try {
            // Payload está en la segunda parte del JWT (entre los puntos)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            // El payload de tu backend es { id, email, role }. Usamos el email como "nombre"
            return { 
                id: payload.id, 
                name: payload.email || 'Usuario', // Usar email como nombre visible
                role: payload.role 
            };
        } catch (e) {
            console.error("Error decodificando token:", e);
            return null;
        }
    },

    // --- LÓGICA DE UI Y MANEJO DE EVENTOS ---
    
    // Actualizar sección de usuario en la UI
    updateUserSection() {
        const section = document.getElementById('user-section');
        if (!section) return;

        const user = this.getUser();

        if (user) {
            section.innerHTML = `
                <div class="user-menu">
                    <span>Hola, ${user.name}</span>
                    <img src="images/cart.svg" alt="Carrito" class="cart-icon" onclick="location.href='cart.html'">
                    <button onclick="Auth.logout()" class="logout-btn">Cerrar sesión</button>
                </div>
            `;
        } else {
            section.innerHTML = `
                <button type="button" class="login-btn" onclick="openLoginModal()">Inicia sesión</button>
            `;
        }
    },

    // Inicializa la lógica de eventos de login/registro/captcha
    async init() {
        await this._loadCaptcha();
        this._setupModalEvents();
        this._setupLoginHandler();
        this._setupRegisterHandler();
        this.updateUserSection(); // Actualiza al cargar la página
    },

    // Carga el CAPTCHA de reCAPTCHA
    async _loadCaptcha() {
        const captchaContainer = document.getElementById('captcha-container');
        if (captchaContainer) {
            const htmlWidget = await ApiClient.getCaptchaWidget();
            captchaContainer.innerHTML = htmlWidget;
            // Cargar el script de Google reCAPTCHA
            if (window.grecaptcha === undefined && htmlWidget.includes('g-recaptcha')) {
                 const script = document.createElement('script');
                 // Asume que el backend usa la clave de sitio para generar el widget
                 script.src = "https://www.google.com/recaptcha/api.js"; 
                 script.async = true;
                 script.defer = true;
                 document.head.appendChild(script);
            }
        }
    },
    
    // Configura eventos del modal (cerrar al click fuera, botones)
    _setupModalEvents() {
        const modal = document.getElementById("login-modal");
        
        // Delegación global para abrir modal
        document.addEventListener("click", (e) => {
          const btn = e.target.closest(".login-btn");
          if (btn) openLoginModal();
        });

        // Cerrar modal al hacer clic fuera
        if (modal) {
          modal.addEventListener("click", (e) => {
            if (e.target === modal) closeLoginModal();
          });
        }
        
        // Botones del modal
        const registerBtn = document.getElementById("register-btn");
        const forgotBtn = document.getElementById("forgot-btn");

        if (registerBtn) {
            registerBtn.addEventListener("click", () => {
                window.location.href = "register.html";
            });
        }
        
        if (forgotBtn) {
            forgotBtn.addEventListener("click", () => {
                // Implementar aquí la lógica o modal para Forgot Password (petición al backend)
                alert("Funcionalidad de recuperación de contraseña próximamente...");
            });
        }
    },

    // Maneja el envío del formulario de login
    _setupLoginHandler() {
        const loginForm = document.getElementById("login-form"); // Usar ID fijo
        const submitBtn = document.getElementById("submit-btn");

        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const username = document.getElementById("login-username").value; // Usar username
                const password = document.getElementById("login-password").value;
                const captchaResponse = grecaptcha ? grecaptcha.getResponse() : null; // Obtener respuesta del CAPTCHA

                if (!username || !password) {
                    this._showError(loginForm, "Por favor, completa todos los campos.");
                    return;
                }
                
                if (!captchaResponse) {
                    this._showError(loginForm, "Por favor, verifica el CAPTCHA.");
                    return;
                }
                
                // Deshabilitar botón durante la petición
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Iniciando sesión...";
                }

                try {
                    const credentials = { 
                        username, 
                        password, 
                        'g-recaptcha-response': captchaResponse // Nombre de campo que espera el backend
                    };
                    
                    const result = await Auth.login(credentials);
                    
                    if (result.success) {
                        closeLoginModal();
                        this._showSuccess("¡Inicio de sesión exitoso!");
                        this.updateUserSection();
                        // setTimeout(() => window.location.reload(), 1000);
                    } else {
                        this._showError(loginForm, result.message);
                        grecaptcha.reset(); // Resetear CAPTCHA después de un intento fallido
                    }
                } catch (error) {
                    this._showError(loginForm, "Error durante el login");
                } finally {
                    // Rehabilitar botón
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Aceptar";
                    }
                }
            });
        }
    },

    // Maneja el envío del formulario de registro
    _setupRegisterHandler() {
        const registerForm = document.getElementById("registerForm");
        const errorElement = document.getElementById("error");

        if (registerForm) {
            registerForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const username = document.getElementById("name").value; // Asumiendo 'name' es 'username'
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                const confirmPassword = document.getElementById("confirmPassword").value;
                const submitButton = registerForm.querySelector('button[type="submit"]');

                errorElement.textContent = "";

                // Validaciones del frontend (simples)
                if (password !== confirmPassword) {
                    errorElement.textContent = "Las contraseñas no coinciden.";
                    return;
                }
                
                // Deshabilitar botón durante el registro
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = "Registrando...";

                try {
                    const userData = { username, email, password };
                    const result = await Auth.register(userData);
                    
                    if (result.success) {
                        this._showSuccess(result.message); // Muestra mensaje de éxito de registro
                        // Redirigir a la página principal/login
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 2000);
                    } else {
                        errorElement.textContent = result.message;
                    }
                } catch (error) {
                    errorElement.textContent = "Error durante el registro";
                } finally {
                    // Rehabilitar botón
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            });
        }
    },
    
    // Muestra un error temporal en el formulario o en la página
    _showError(parent, message) {
        // Lógica de visualización de error (como la que ya tenías)
        const existingError = parent.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '10px';
        errorElement.style.textAlign = 'center';
        
        parent.appendChild(errorElement);
        // Opcional: remover el error después de 5 segundos
        setTimeout(() => errorElement.remove(), 5000);
    },

    // Muestra un mensaje de éxito temporal
    _showSuccess(message) {
        // Lógica de visualización de éxito (similar a la que ya tenías)
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        successElement.style.color = 'green';
        successElement.style.backgroundColor = '#f0fff0';
        successElement.style.padding = '10px';
        successElement.style.borderRadius = '5px';
        successElement.style.position = 'fixed';
        successElement.style.top = '20px';
        successElement.style.left = '50%';
        successElement.style.transform = 'translateX(-50%)';
        successElement.style.zIndex = '1000';

        document.body.appendChild(successElement);
        
        setTimeout(() => successElement.remove(), 3000);
    }
};

// Funciones globales para abrir/cerrar el modal (utilizadas por la UI)
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    // Opcional: Limpiar el CAPTCHA al cerrar
    if (window.grecaptcha) grecaptcha.reset(); 
}

// Inicializar Auth cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});