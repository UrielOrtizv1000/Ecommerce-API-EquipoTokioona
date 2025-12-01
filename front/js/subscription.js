// front/js/subscription.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribe-form");
  const emailInput = document.getElementById("subscribe-email");
  const feedback = document.getElementById("subscribe-feedback");

  if (!form || !emailInput || !feedback) {
    console.warn("Formulario de suscripción no encontrado en el DOM.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      feedback.textContent = "Por favor, ingresa un correo.";
      feedback.style.color = "red";
      return;
    }

    feedback.textContent = "Enviando...";
    feedback.style.color = "#555";

    try {
      const result = await ApiClient.subscribe(email);

      if (result.ok) {
        const msg =
          (result.data && result.data.message) ||
          "Te hemos enviado un cupón a tu correo.";
        feedback.textContent = msg;
        feedback.style.color = "green";
        form.reset();
      } else {
        feedback.textContent = result.message || "Error al suscribirte.";
        feedback.style.color = "red";
      }
    } catch (error) {
      console.error("Error en suscripción:", error);
      feedback.textContent = "Error de conexión, inténtalo de nuevo.";
      feedback.style.color = "red";
    }
  });
});
