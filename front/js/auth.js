// front/js/auth.js
const Auth = {
  // Login con credenciales
  async login(credentials) {
    try {
      const result = await AuthApi.login(credentials);
      
      if (result.success) {
        this.setUserSession(result.user, result.token);
        this.updateUserSection();
        return { success: true };
      } else {
        return { 
          success: false, 
          message: result.message 
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error durante el login'
      };
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    try {
      const result = await AuthApi.register(userData);
      
      if (result.success) {
        this.setUserSession(result.user, result.token);
        this.updateUserSection();
        return { success: true };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error durante el registro'
      };
    }
  },

  // Establecer sesión de usuario
  setUserSession(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.updateUserSection();
    window.location.href = 'index.html';
  },

  // Obtener usuario actual
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
    return this.getUser() !== null && this.getToken() !== null;
  },

  // Actualizar sección de usuario en la UI
  updateUserSection() {
    const section = document.getElementById('user-section');
    if (!section) return;

    const user = this.getUser();

    if (user) {
      section.innerHTML = `
        <div class="user-menu">
          <span>Hola, ${user.name}</span>
          <img src="images/cart.svg" alt="Carrito" class="cart-icon" onclick="location.href='carrito.html'">
          <button onclick="Auth.logout()" class="logout-btn">Cerrar sesión</button>
        </div>
      `;
    } else {
      section.innerHTML = `
        <button onclick="openLoginModal()" class="login-btn">Inicia sesión</button>
      `;
    }
  }
};

// Abrir modal de login
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'flex';
}

// Cerrar modal de login
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
}

// Inicializar auth cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateUserSection();
});