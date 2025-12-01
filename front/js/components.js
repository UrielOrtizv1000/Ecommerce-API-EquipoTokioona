// front/js/components.js

async function loadComponent(id, file, callback) {
  try {
    const response = await fetch(file);
    const html = await response.text();
    const target = document.getElementById(id);

    if (target) {
      target.innerHTML = html;
      if (callback) callback();
    }
  } catch (error) {
    console.error(`Error loading component ${file}:`, error);
  }
}

/**
 * Aplica el tema (claro/oscuro) y tamaño de texto
 * guardados en localStorage a TODAS las páginas
 * que cargan este archivo.
 */
function applyGlobalAccessibilityStyles() {
  // ---- TEMA ----
  const theme = localStorage.getItem("tokioona_theme") || "light";
  const isDark = theme === "dark";

  // Clase en <body> para que el master_styles.css pinte todo
  document.body.classList.toggle("body-dark-theme", isDark);

  // Footer (el header NO lo tocamos a propósito)
  const footerEl = document.getElementById("footer");
  if (footerEl) {
    footerEl.classList.toggle("footer-dark-theme", isDark);
  }

  // ---- TAMAÑO DE TEXTO ----
  const textSize = localStorage.getItem("tokioona_textSize") || "normal";

  document.body.classList.remove("text-small", "text-normal", "text-large");

  switch (textSize) {
    case "small":
      document.body.classList.add("text-small");
      break;
    case "large":
      document.body.classList.add("text-large");
      break;
    default:
      document.body.classList.add("text-normal");
      break;
  }
}

// Escucha el evento que dispara accesibility.js
window.addEventListener("accessibilitySettingsChanged", () => {
  applyGlobalAccessibilityStyles();
});

// Cuando se carga el DOM en CUALQUIER página:
window.addEventListener("DOMContentLoaded", () => {
  // 1) Cargar header
  loadComponent("header", "./includes/header.html", () => {
    // El header mantiene sus estilos propios
  });

  // 2) Cargar footer y aplicar tema/texto después
  loadComponent("footer", "./includes/footer.html", () => {
    applyGlobalAccessibilityStyles();
  });

  // 3) Inicializar Auth
  if (typeof Auth !== "undefined" && Auth.init) {
    Auth.init();
  }

  // 4) Aplicar tema/tamaño una vez más por si footer tarda
  applyGlobalAccessibilityStyles();
});
