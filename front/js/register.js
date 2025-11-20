document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // evita recargar la página

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const error = document.getElementById("error");

    if (password !== confirm) {
        error.textContent = "Las contraseñas no coinciden.";
        return;
    }

    error.textContent = "";
    alert("¡Registro exitoso!");
});
