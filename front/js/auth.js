// js/auth.js
const Auth = {
  login(username) {
    localStorage.setItem('user', JSON.stringify({ username }));
    this.updateUserSection();
  },

  logout() {
    localStorage.removeItem('user');
    this.updateUserSection();
    window.location.href = 'index.html';
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateUserSection() {
    const section = document.getElementById('user-section');
    if (!section) return; // important

    const user = this.getUser();

    if (user) {
      section.innerHTML = `
        <div class="user-menu">
          <span>Hola, ${user.username}</span> <!-- Visible text in Spanish -->
          <img src="assets/cart.svg" alt="Carrito" class="cart-icon" onclick="location.href='carrito.html'">
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

// Open login modal
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'flex';
}

// Close login modal
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
}