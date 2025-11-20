async function loadComponent(id, file, callback) {
  const response = await fetch(file);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;

  if (callback) callback(); // Ejecutar después de cargar el HTML
}

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "./includes/header.html", () => {
    // Aquí se ejecuta index.js correctamente
    initUserSection();
  });

  loadComponent("footer", "./includes/footer.html");
});
