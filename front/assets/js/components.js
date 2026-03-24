async function loadComponent(targetId, filePath, callback) {
  try {
    const response = await fetch(filePath);
    const html = await response.text();
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.innerHTML = html;
    window.APP_CONFIG?.applyRemoteImagePaths(target);

    if (callback) {
      callback();
    }
  } catch (error) {
    console.error(`Error loading component ${filePath}:`, error);
  }
}

function applyGlobalAccessibilityStyles() {
  const theme = localStorage.getItem("tokioona_theme") || "light";
  const isDarkTheme = theme === "dark";
  const textSize = localStorage.getItem("tokioona_textSize") || "normal";

  document.body.classList.toggle("body-dark-theme", isDarkTheme);

  const footer = document.getElementById("footer");
  if (footer) {
    footer.classList.toggle("footer-dark-theme", isDarkTheme);
  }

  let rootFontSize = "100%";
  if (textSize === "small") {
    rootFontSize = "90%";
  } else if (textSize === "large") {
    rootFontSize = "115%";
  }

  document.documentElement.style.fontSize = rootFontSize;
}

window.addEventListener("accessibilitySettingsChanged", () => {
  applyGlobalAccessibilityStyles();
});

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "./partials/header.html", () => {
    if (typeof Auth !== "undefined") {
      Auth.updateUserSection();
      Auth.updateCartCount();
    }

    applyGlobalAccessibilityStyles();
  });

  loadComponent("footer", "./partials/footer.html", () => {
    applyGlobalAccessibilityStyles();
  });

  applyGlobalAccessibilityStyles();
});
