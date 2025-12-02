// front/js/accessibility.js

(function () {
  const THEME_KEY = "tokioona_theme";        // 'light' | 'dark'
  const FONT_KEY  = "tokioona_textSize";   // 'small' | 'normal' | 'large'

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    // Controles del DOM
    const lightBtn      = document.getElementById("light-theme");
    const darkBtn       = document.getElementById("dark-theme");
    const decreaseBtn   = document.getElementById("decrease-text");
    const increaseBtn   = document.getElementById("increase-text");
    const currentSizeEl = document.getElementById("current-size");
    const resetBtn      = document.getElementById("reset-settings");

    // Si no estamos en la página de accesibilidad, salimos tranquilos
    if (!lightBtn || !darkBtn || !decreaseBtn || !increaseBtn || !currentSizeEl || !resetBtn) {
      return;
    }

    // ==========================
    //  CARGAR PREFERENCIAS
    // ==========================

    let currentTheme = localStorage.getItem(THEME_KEY) || "light";
    let currentFont  = localStorage.getItem(FONT_KEY)  || "normal";

    applyTheme(currentTheme);
    applyFontSize(currentFont);

    // ==========================
    //  EVENTOS TEMA
    // ==========================

    lightBtn.addEventListener("click", () => {
      currentTheme = "light";
      applyTheme(currentTheme);
      saveTheme(currentTheme);
    });

    darkBtn.addEventListener("click", () => {
      currentTheme = "dark";
      applyTheme(currentTheme);
      saveTheme(currentTheme);
    });

    // ==========================
    //  EVENTOS TAMAÑO DE TEXTO
    // ==========================

    decreaseBtn.addEventListener("click", () => {
      if (currentFont === "large") {
        currentFont = "normal";
      } else if (currentFont === "normal") {
        currentFont = "small";
      } else {
        // ya está en small, no baja más
        return;
      }
      applyFontSize(currentFont);
      saveFont(currentFont);
    });

    increaseBtn.addEventListener("click", () => {
      if (currentFont === "small") {
        currentFont = "normal";
      } else if (currentFont === "normal") {
        currentFont = "large";
      } else {
        // ya está en large
        return;
      }
      applyFontSize(currentFont);
      saveFont(currentFont);
    });

    // ==========================
    //  RESET
    // ==========================

    resetBtn.addEventListener("click", () => {
      currentTheme = "light";
      currentFont  = "normal";

      applyTheme(currentTheme);
      applyFontSize(currentFont);

      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(FONT_KEY);
    });

    // ==========================
    //  FUNCIONES AUXILIARES
    // ==========================

    function applyTheme(theme) {
      // 1) Clase en body para activar estilos de modo oscuro
      if (theme === "dark") {
        body.classList.add("body-dark-theme");
      } else {
        body.classList.remove("body-dark-theme");
      }

      // 2) Estado visual de botones
      lightBtn.classList.remove("active");
      darkBtn.classList.remove("active");

      if (theme === "dark") {
        darkBtn.classList.add("active");
      } else {
        lightBtn.classList.add("active");
      }

      // 3) Pequeña animación suave opcional
      body.classList.add("highlight-accessibility");
      setTimeout(() => body.classList.remove("highlight-accessibility"), 800);
    }

    function applyFontSize(size) {
      // Ajustamos el tamaño base del documento
      // (afecta rem y texto que hereda del body)
      switch (size) {
        case "small":
          document.documentElement.style.fontSize = "90%";
          currentSizeEl.textContent = "Pequeño";
          updateCurrentSizeClasses("small");
          break;
        case "large":
          document.documentElement.style.fontSize = "115%";
          currentSizeEl.textContent = "Grande";
          updateCurrentSizeClasses("large");
          break;
        default:
          document.documentElement.style.fontSize = "100%";
          currentSizeEl.textContent = "Normal";
          updateCurrentSizeClasses("normal");
          break;
      }

      // animación sutil
      currentSizeEl.classList.add("highlight-accessibility");
      setTimeout(() => currentSizeEl.classList.remove("highlight-accessibility"), 700);
    }

    function updateCurrentSizeClasses(mode) {
      currentSizeEl.classList.remove(
        "current-size--small",
        "current-size--normal",
        "current-size--large"
      );

      if (mode === "small") {
        currentSizeEl.classList.add("current-size--small");
      } else if (mode === "large") {
        currentSizeEl.classList.add("current-size--large");
      } else {
        currentSizeEl.classList.add("current-size--normal");
      }
    }

    function saveTheme(theme) {
      try {
        localStorage.setItem(THEME_KEY, theme); 
      } catch (e) {
        console.warn("No se pudo guardar el tema en localStorage:", e);
      }
    }

    function saveFont(size) {
      try {
        localStorage.setItem(FONT_KEY, size); 
      } catch (e) {
        console.warn("No se pudo guardar el tamaño de fuente:", e);
      }
    }
  });
})();
