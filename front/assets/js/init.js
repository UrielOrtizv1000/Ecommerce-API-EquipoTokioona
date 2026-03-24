const DEFAULT_BACKEND_URL = "https://tookiona-backend-production-5312.up.railway.app";

window.APP_CONFIG = {
  BACK_URL: window.APP_CONFIG?.BACK_URL || DEFAULT_BACKEND_URL,
  getImageUrl(imagePath = "") {
    return `${this.BACK_URL}${imagePath}`;
  },
  applyRemoteImagePaths(root = document) {
    const imagesToUpdate = root.querySelectorAll("img[data-path]");

    imagesToUpdate.forEach((image) => {
      const imagePath = image.getAttribute("data-path");
      image.src = this.getImageUrl(imagePath);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  if (!window.APP_CONFIG.BACK_URL) {
    console.error("Configuration error: BACK_URL is not defined in window.APP_CONFIG.");
    return;
  }

  window.APP_CONFIG.applyRemoteImagePaths();
});
