// front/js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("login-modal");
  const loginForm = modal ? modal.querySelector('form') : null;

  // Delegación global para abrir modal
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".login-btn");
    if (btn) {
      openLoginModal();
    }
  });

  // Cerrar modal al hacer clic fuera
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeLoginModal();
      }
    });
  }

  // Botones del modal
  const registerBtn = document.getElementById("register-btn");
  const forgotBtn = document.getElementById("forgot-btn");
  const submitBtn = document.getElementById("submit-btn");

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      alert("Funcionalidad de recuperación de contraseña próximamente...");
    });
  }

  // Manejar envío del formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      
      // Validación básica
      if (!email || !password) {
        showLoginError("Por favor, completa todos los campos");
        return;
      }

      // Deshabilitar botón durante la petición
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Iniciando sesión...";
      }

      try {
        const result = await Auth.login({ email, password });
        
        if (result.success) {
          closeLoginModal();
          showLoginSuccess("¡Inicio de sesión exitoso!");
          // Recargar para actualizar estado en toda la app
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showLoginError(result.message);
        }
      } catch (error) {
        showLoginError("Error durante el login");
      } finally {
        // Rehabilitar botón
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Aceptar";
        }
      }
    });
  }
});

function showLoginError(message) {
  // Eliminar mensajes anteriores
  const existingError = document.querySelector('.login-error');
  if (existingError) existingError.remove();

  const errorElement = document.createElement('div');
  errorElement.className = 'login-error error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'red';
  errorElement.style.marginTop = '10px';
  errorElement.style.textAlign = 'center';

  const form = document.querySelector('#login-modal form');
  if (form) form.appendChild(errorElement);
}

function showLoginSuccess(message) {
  const successElement = document.createElement('div');
  successElement.className = 'login-success success-message';
  successElement.textContent = message;
  successElement.style.color = 'green';
  successElement.style.marginTop = '10px';
  successElement.style.textAlign = 'center';
  successElement.style.position = 'fixed';
  successElement.style.top = '20px';
  successElement.style.left = '50%';
  successElement.style.transform = 'translateX(-50%)';
  successElement.style.backgroundColor = 'white';
  successElement.style.padding = '10px 20px';
  successElement.style.borderRadius = '5px';
  successElement.style.zIndex = '1000';

  document.body.appendChild(successElement);
  
  setTimeout(() => {
    successElement.remove();
  }, 3000);
}