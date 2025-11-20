// front/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const errorElement = document.getElementById("error");
      const submitButton = registerForm.querySelector('button[type="submit"]');

      // Reset error
      errorElement.textContent = "";

      // Validaciones
      if (password !== confirmPassword) {
        errorElement.textContent = "Las contraseñas no coinciden.";
        return;
      }

      if (password.length < 6) {
        errorElement.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
      }

      if (!email.includes('@')) {
        errorElement.textContent = "Por favor, ingresa un email válido.";
        return;
      }

      // Deshabilitar botón durante el registro
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Registrando...";

      try {
        const result = await Auth.register({ name, email, password });
        
        if (result.success) {
          showRegisterSuccess("¡Registro exitoso! Redirigiendo...");
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
});

function showRegisterSuccess(message) {
  const successElement = document.createElement('div');
  successElement.className = 'register-success success-message';
  successElement.textContent = message;
  successElement.style.color = 'green';
  successElement.style.marginTop = '10px';
  successElement.style.textAlign = 'center';
  successElement.style.padding = '10px';
  successElement.style.backgroundColor = '#f0fff0';
  successElement.style.borderRadius = '5px';

  const form = document.getElementById("registerForm");
  if (form) form.appendChild(successElement);
}