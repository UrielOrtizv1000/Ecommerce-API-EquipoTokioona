document.addEventListener("DOMContentLoaded", () => {

    // Obtener token desde la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const form = document.getElementById("resetForm");
    const captchaInput = document.getElementById("captcha");
    const captchaError = document.getElementById("captchaError");
    const successBox = document.getElementById("successMessage");

    // inputs nuevos para password
    const pass1 = document.getElementById("new-password");
    const pass2 = document.getElementById("confirm-password");

    // Captcha DOM
    const captchaText = document.getElementById("captchaText");
    const refreshCaptcha = document.getElementById("refreshCaptcha");

    // Validación de token
    if (!token) {
        alert("Enlace inválido o expirado.");
        window.location.href = "index.html";
        return;
    }

    /** ENVIAR FORMULARIO **/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        


        // Validar contraseñas
        if (!pass1.value || pass1.value.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (pass1.value !== pass2.value) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        /** ENVIAR AL BACKEND **/
        try {
            const response = await fetch(
                `https://tookiona-backend-production-5312.up.railway.app/api/auth/resetPassword?token=${token}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: pass1.value })
                }
            );

            const data = await response.json();

            if (!data.ok) {
                alert(data.message || "Error al restablecer la contraseña.");
                return;
            }

            // Mostrar mensaje de éxito
            form.classList.add("hidden");
            successBox.classList.remove("hidden");

        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor.");
        }
    });
});
