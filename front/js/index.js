function initUserSection() {
  const isLoggedIn = false;
  const userName = "Bruno";
  
  const userSection = document.getElementById("user-section");

  if (!userSection) return; // seguridad

  if (isLoggedIn) {
    userSection.innerHTML = `
      <div class="user-info">
        <p>Hola, ${userName}</p>
        <a href="#" class="cart-btn">Carrito</a>
      </div>
    `;
  } else {
    userSection.innerHTML = `
      <button class="login-btn">Login</button>
    `;
  }
}
