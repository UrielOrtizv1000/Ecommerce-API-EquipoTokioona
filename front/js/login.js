document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("login-modal");

  // Global delegation: works even if header is loaded later
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".login-btn"); // any element with class 'login-btn' opens the modal
    if (btn) {
      modal.classList.add("active"); // show modal
    }
  });

  // Close modal by clicking overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active"); // hide modal
    }
  });

  // Modal internal buttons
  document.getElementById("register-btn").addEventListener("click", () => {
    alert("Redirecting to registration page...");
  });

  document.getElementById("forgot-btn").addEventListener("click", () => {
    alert("Recovering password...");
  });

  document.getElementById("submit-btn").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Login submitted.");
    modal.classList.remove("active"); // hide modal after submit
  });
});
