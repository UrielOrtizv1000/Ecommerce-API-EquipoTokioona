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
 * Aplica el tema y el tamaño de texto guardados en localStorage.
 * Ahora sincronizado con la lógica de 'rem' de accessibility.js
 */
function applyGlobalAccessibilityStyles() {
  // ==========================
  //  1. APLICAR TEMA
  // ==========================
  const theme = localStorage.getItem("tokioona_theme") || "light";
  const isDark = theme === "dark";

  // Clase en <body> para el CSS oscuro
  document.body.classList.toggle("body-dark-theme", isDark);

  // Footer (si existe)
  const footerEl = document.getElementById("footer");
  if (footerEl) {
    footerEl.classList.toggle("footer-dark-theme", isDark);
  }

  // ==========================
  //  2. APLICAR TAMAÑO DE TEXTO
  // ==========================
  // Leemos la preferencia guardada
  const textSize = localStorage.getItem("tokioona_textSize") || "normal";
  
  // Definimos el porcentaje base igual que en accessibility.js
  let rootSize = "100%"; 

  if (textSize === "small") {
    rootSize = "90%";
  } else if (textSize === "large") {
    rootSize = "115%";
  }

  // Aplicamos el cambio al HTML para que los 'rem' del CSS funcionen
  document.documentElement.style.fontSize = rootSize;
}

// Escucha eventos personalizados (si accessibility.js emite alguno)
window.addEventListener("accessibilitySettingsChanged", () => {
  applyGlobalAccessibilityStyles();
});

// Al cargar el DOM
window.addEventListener("DOMContentLoaded", () => {
  // 1) Cargar header
  loadComponent("header", "./includes/header.html");

  // 2) Cargar footer y aplicar estilos cuando esté listo
  loadComponent("footer", "./includes/footer.html", () => {
    applyGlobalAccessibilityStyles();
  });

  // 3) Inicializar Auth si existe
  if (typeof Auth !== "undefined" && Auth.init) {
    Auth.init();
  }

  // 4) Aplicar estilos inmediatamente al cuerpo de la página
  applyGlobalAccessibilityStyles();
});