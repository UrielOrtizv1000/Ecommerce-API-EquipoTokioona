// front/js/components.js
async function loadComponent(id, file, callback) {
  try {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;

    if (callback) callback();
  } catch (error) {
    console.error(`Error loading component ${file}:`, error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "./includes/header.html"); 

  loadComponent("footer", "./includes/footer.html");

  Auth.init();
});