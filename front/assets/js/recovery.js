document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const form = document.getElementById("resetForm");
  const successBox = document.getElementById("successMessage");
  const passwordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (!token) {
    alert("Invalid or expired link.");
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!passwordInput.value || passwordInput.value.length < 6) {
      alert("The password must contain at least 6 characters.");
      return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const result = await ApiClient.resetPassword({
        token,
        password: passwordInput.value,
      });

      if (!result.ok) {
        alert(result.message || "Unable to reset the password.");
        return;
      }

      form.classList.add("hidden");
      successBox.classList.remove("hidden");
    } catch (error) {
      console.error(error);
      alert("Server connection error.");
    }
  });
});
