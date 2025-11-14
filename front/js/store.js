// js/shop.js

//  Renderizador de productos
function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = ""; // Limpiar antes de renderizar

  if (!products || products.length === 0) {
    container.innerHTML = "<p>No hay productos para esta categoría.</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p class="price">$${p.price}</p>
      <p>Stock: ${p.stock}</p>
      <div class="tags">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="card-btn">
        <button>Agregar al carrito</button>
      </div>
    `;

    container.appendChild(card);
  });
}

//     Carga inicial
document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get("category");

  if (categoryFromURL && categoryFromURL !== "all") {
    const filtered = productsData.filter(p => p.category === categoryFromURL);
    renderProducts(filtered);
  } else {
    renderProducts(productsData);
  }

  setupCategoryFilters();
});

//  Filtro por categorías
function setupCategoryFilters() {
  const buttons = document.querySelectorAll(".sidebar button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      if (category === "all") {
        renderProducts(productsData);
      } else {
        const filtered = productsData.filter(p => p.category === category);
        renderProducts(filtered);
      }
    });
  });
}
