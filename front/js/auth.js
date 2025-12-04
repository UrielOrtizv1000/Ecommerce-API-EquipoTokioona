// front/js/auth.js
// Depende de ApiClient.js (asegúrate de incluirlo primero en tu HTML)

const Auth = {
  // --- LÓGICA DE SESIÓN ---

  // Login con credenciales
  async login(credentials) {
    const result = await ApiClient.login(credentials);

    if (result.ok) {
      const token = result.data.token;
      const userData = this._decodeToken(token);

      if (userData) {
        this.setUserSession(userData, token);
        this.updateUserSection();   // pinta "Hola, usuario + carrito"
        if (this.isAuthenticated() && this.getUser().role !== 'admin') {
            this.updateCartCount();
        }
        return { success: true };
      }
      return { success: false, message: "Token inválido recibido." };
    } else {
      return { success: false, message: result.message };
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    const result = await ApiClient.signup(userData);

    if (result.ok) {
      return { success: true, message: "Registro exitoso. ¡Inicia sesión!" };
    } else {
      return { success: false, message: result.message };
    }
  },

  // Establecer sesión de usuario
  setUserSession(user, token) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  },

  // Cerrar sesión
  async logout() {
    const token = this.getToken();
    if (token) {
      await ApiClient.logout(token);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    this.updateUserSection();
    this.updateCartCount(); // limpia el contador
    window.location.href = "index.html";
  },

  // Obtener usuario actual de la sesión (solo para la UI)
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Obtener token
  getToken() {
    return localStorage.getItem("token");
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return this.getToken() !== null;
  },

  // Función para decodificar el JWT (simple, sin validación de firma)
  _decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.id,
        name: payload.email || "Usuario",
        role: payload.role,
      };
    } catch (e) {
      console.error("Error decodificando token:", e);
      return null;
    }
  },

  // --- LÓGICA DE UI Y MANEJO DE EVENTOS ---

  // Actualizar sección de usuario en la UI
  updateUserSection() {
    const section = document.getElementById("user-section");
    if (!section) return;

    const user = this.getUser();
    
    const isAdmin = user && user.role === "admin"; 
    
    if (user) {
        
        let headerButtonsHTML = '';

        if (isAdmin) {
            headerButtonsHTML = `
                    <button onclick="window.location.href='admin.html'" class="admin-panel-btn" style="margin-right: 15px; cursor: pointer;">
                        ⚙️ Panel Admin
                    </button>
            `;
        } else {

          headerButtonsHTML += `
                <a href="wishlist.html" class="header-btn wishlist-btn-header" title="Lista de Deseos">
                    <i class="fas fa-heart"></i>
                </a>
            `;

        const BACK_URL = window.APP_CONFIG.BACK_URL; 
                
            headerButtonsHTML += `  
                <div class="cart-wrapper" onclick="location.href='cart.html'">
                    <img 
                        src="${BACK_URL}/images/carrito.png"  
                        alt="Carrito" 
                        class="cart-icon"
                        style="width:26px;"
                    >
                    <span id="cart-count-badge" class="cart-count-badge"></span>
                </div>
            `;
        }
        
      section.innerHTML = `
        <div class="user-menu">
          <span>Hola, ${user.name}</span>

          ${headerButtonsHTML}            <button onclick="Auth.logout()" class="logout-btn">Cerrar sesión</button>
        </div>
      `;
    } else {
      section.innerHTML = `
        <button type="button" class="login-btn" onclick="openLoginModal()">
          Inicia sesión
        </button>
      `;
    }
    
    if (!isAdmin) {
        this.updateCartCount();
    }
  },
  // Inicializa la lógica de eventos de login/registro/captcha/recuperación
  async init() {
    await this._loadCaptcha();

    this._setupModalEvents();
    this._setupLoginHandler();
    this._setupRegisterHandler();
    this._setupForgotPasswordHandler();

    // Pintar sección de usuario (crea el carrito y el span del contador)
    this.updateUserSection();

    // Actualizar contador del carrito al cargar
    this.updateCartCount();
  },

  // Cargar CAPTCHA
  async _loadCaptcha() {
    const captchaContainer = document.getElementById("captcha-container");
    if (captchaContainer) {
      try {
        const response = await ApiClient.getCaptcha();

        if (response.ok) {
          const captchaHtml = `
            <div class="captcha-wrapper" id="captcha-wrapper-${response.captchaId}">
              <div class="captcha-image">
                <div class="captcha-text">${response.captchaText}</div>
              </div>
              <div class="captcha-controls">
                <input 
                  type="text" 
                  id="captcha-input"  
                  required
                  maxlength="6"
                  style="margin: 10px 0; padding: 8px; width: 200px;"
                >
                <button type="button" id="reload-captcha" style="margin-left: 10px; padding: 8px;">
                  ↻
                </button>
              </div>
              <input type="hidden" id="captcha-id" value="${response.captchaId}">
            </div>
          `;

          captchaContainer.innerHTML = captchaHtml;

          const reloadBtn = document.getElementById("reload-captcha");
          if (reloadBtn) {
            reloadBtn.addEventListener("click", () => this._loadCaptcha());
          }
        } else {
          captchaContainer.innerHTML =
            '<div class="captcha-error">Error al cargar CAPTCHA</div>';
        }
      } catch (error) {
        captchaContainer.innerHTML =
          '<div class="captcha-error">Error de conexión</div>';
        console.error("Error loading CAPTCHA:", error);
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

    const registerBtn = document.getElementById("register-btn");
    const forgotBtn = document.getElementById("forgot-btn");

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        window.location.href = "register.html";
      });
    }

    if (forgotBtn) {
      forgotBtn.addEventListener("click", () => {
        openForgotModal();
      });
    }
  },

  // Handler de login
  _setupLoginHandler() {
    const loginForm = document.getElementById("login-form");
    const submitBtn = document.getElementById("submit-btn");

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const captchaText = document.getElementById("captcha-input")?.value;
        const captchaId = document.getElementById("captcha-id")?.value;

        if (!username || !password) {
          this._showError(loginForm, "Por favor, completa todos los campos.");
          return;
        }

        if (!captchaText || !captchaId) {
          this._showError(loginForm, "Por favor, completa el CAPTCHA.");
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Iniciando sesión...";
        }

        try {
          const credentials = {
            username,
            password,
            captchaId,
            captchaText,
          };

          const result = await Auth.login(credentials);

          if (result.success) {
            closeLoginModal();
            this._showSuccess("¡Inicio de sesión exitoso!");
            await this._loadCaptcha();
          } else {
            this._showError(loginForm, result.message);
            await this._loadCaptcha();
          }
        } catch (error) {
          console.error("Error en login handler:", error);
          this._showError(loginForm, "Error durante el login");
          await this._loadCaptcha();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Aceptar";
          }
        }
      });
    }
  },

  // Handler de registro
  _setupRegisterHandler() {
    const registerForm = document.getElementById("registerForm");
    const errorElement = document.getElementById("error");

    if (registerForm) {
      registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirmPassword").value;
        const submitButton =
          registerForm.querySelector('button[type="submit"]');

        errorElement.textContent = "";

        if (password !== confirmPassword) {
          errorElement.textContent = "Las contraseñas no coinciden.";
          return;
        }

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Registrando...";

        try {
          const userData = { username, email, password };
          const result = await Auth.register(userData);

          if (result.success) {
            this._showSuccess(result.message);
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          } else {
            errorElement.textContent = result.message;
          }
        } catch (error) {
          errorElement.textContent = "Error durante el registro";
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    }
  },

  // Handler de "Olvidé mi contraseña"
  _setupForgotPasswordHandler() {
    const form = document.getElementById("forgot-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("forgot-email");
      const email = emailInput ? emailInput.value.trim() : "";

      if (!email) {
        alert("Ingresa tu correo");
        return;
      }

      try {
        const result = await ApiClient.forgotPassword(email);

        if (result.ok) {
          alert(
            "Te enviamos un correo con instrucciones para recuperar tu contraseña."
          );
          closeForgotModal();
        } else {
          alert(result.message || "Error enviando correo de recuperación.");
        }
      } catch (error) {
        console.error("Error en forgotPassword:", error);
        alert("Error de conexión.");
      }
    });
  },

  // Muestra un error temporal en el formulario o en la página
  _showError(parent, message) {
    const existingError = parent.querySelector(".error-message");
    if (existingError) existingError.remove();

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "red";
    errorElement.style.marginTop = "10px";
    errorElement.style.textAlign = "center";

    parent.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
  },

  // Muestra un mensaje de éxito temporal
  _showSuccess(message) {
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    successElement.style.color = "green";
    successElement.style.backgroundColor = "#f0fff0";
    successElement.style.padding = "10px";
    successElement.style.borderRadius = "5px";
    successElement.style.position = "fixed";
    successElement.style.top = "20px";
    successElement.style.left = "50%";
    successElement.style.transform = "translateX(-50%)";
    successElement.style.zIndex = "1000";

    document.body.appendChild(successElement);

    setTimeout(() => successElement.remove(), 3000);
  },

  // --- CONTADOR DEL CARRITO EN HEADER ---
  async updateCartCount() {
    const badge = document.getElementById("cart-count-badge");
    if (!badge) return;

    // Si no hay sesión, ocultamos el badge
    if (!this.isAuthenticated()) {
      badge.style.display = "none";
      return;
    }

    try {
      const result = await ApiClient.getCart();

      if (!result.ok || !result.data) {
        badge.style.display = "none";
        return;
      }

      const data = result.data || {};
      let items = data.items || data.cart || data;
      if (!Array.isArray(items)) items = [];

      const totalQty = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
      }, 0);

      if (totalQty > 0) {
        badge.textContent = totalQty > 99 ? "99+" : totalQty;
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    } catch (error) {
      console.error("Error actualizando contador del carrito:", error);
      badge.style.display = "none";
    }
  },
};

// Funciones globales para abrir/cerrar el modal (utilizadas por la UI)
function openLoginModal() {
  const modal = document.getElementById("login-modal");
  if (modal) modal.style.display = "flex";
}

function closeLoginModal() {
  const loginModal = document.getElementById("login-modal");

  if (loginModal) {
    loginModal.style.display = "none";
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.reset();
  }
}

function openForgotModal() {
  const modal = document.getElementById("forgot-modal");
  if (modal) modal.style.display = "flex";
}

function closeForgotModal() {
  const modal = document.getElementById("forgot-modal");
  if (modal) modal.style.display = "none";
}

// Inicializar Auth cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});
