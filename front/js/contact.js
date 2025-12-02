// front/js/contact.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-container");
  const modal = document.getElementById("contact-modal");
  const closeModalBtn = document.querySelector(".close-modal-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const asunto = document.getElementById("asunto").value.trim();

    const fullName = `${nombre} ${apellidos}`.trim();

    try {
      const result = await ApiClient.sendContact({
        name: fullName,
        email: correo,
        message: asunto
      });

      if (result.ok) {
        // Mostrar modal
        modal.classList.remove("hidden");

        // Limpiar formulario
        form.reset();
      } else {
        alert("Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error("Error en contacto:", err);
      alert("Error de conexión.");
    }
  });

  // Cerrar modal con tachita
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Cerrar tocando fuera del contenido
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});
