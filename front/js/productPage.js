// front/js/productPage.js

document.addEventListener("DOMContentLoaded", async () => {
    // 1) Leer el id de la URL: product.html?id=123
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("Producto no encontrado");
        window.location.href = "store.html";
        return;
    }

    // 2) Pedir el producto al backend
    const result = await ApiClient.getProductById(productId);

    if (!result.ok || !result.data) {
        alert("Error cargando el producto.");
        window.location.href = "store.html";
        return;
    }

    // Dependiendo de cómo responda tu backend:
    // - { product: {...} }  → result.data.product
    // - o solo el objeto   → result.data
    const product = result.data.product || result.data;

    // 3) Rellenar la página
    const nameEl = document.getElementById("product-name");
    const descEl = document.getElementById("product-description");
    const priceEl = document.getElementById("product-price");
    const stockEl = document.getElementById("product-stock");
    const imageEl = document.getElementById("product-image");
    const tagsContainer = document.getElementById("product-tags");

    if (nameEl)  nameEl.textContent = product.name;

    if (descEl)  descEl.textContent = product.description || "Sin descripción.";
    if (priceEl) {
      const originalPrice = parseFloat(product.price);
      const discount = product.discount || 0;
      const isOnSale = product.is_on_sale && discount > 0;
      const finalPrice = isOnSale 
        ? originalPrice - (originalPrice * discount / 100)
        : originalPrice;

      if (isOnSale) {
        priceEl.innerHTML = `
          <div class="price-discount-container">
            <span class="original-price"><s>$${originalPrice.toFixed(2)}</s></span>
            <span class="final-price">$${finalPrice.toFixed(2)}</span>
            <span class="discount-badge">-${discount}%</span>
          </div>
        `;
      } else {
        priceEl.textContent = `$${originalPrice.toFixed(2)}`;
      }
    }
    if (stockEl) stockEl.textContent = product.stock;

    if (imageEl) {
        const baseImageUrl = "http://localhost:3000/images/";

        if (product.image_url) {
            const imgPath = product.image_url.startsWith("http")
                ? product.image_url
                : baseImageUrl + product.image_url;
            imageEl.src = imgPath;
        } else {
            imageEl.src = "https://via.placeholder.com/400x300?text=Sin+imagen";
        }

        imageEl.alt = product.name;
    }

    // 4) Tags (si tienes campo tags tipo JSON)
    if (tagsContainer) {
        let tags = [];
        try {
            if (typeof product.tags === "string") {
                tags = JSON.parse(product.tags);
            } else if (Array.isArray(product.tags)) {
                tags = product.tags;
            }
        } catch (e) {
            console.error("Error parseando tags", e);
        }

        tagsContainer.innerHTML = tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join("");
    }

    // 5) Botón "Agregar al carrito"
    const addBtn = document.getElementById("add-to-cart-btn");

    const user = Auth.getUser();
    const isAdmin = user && user.role === 'admin';

    if (addBtn) {
        if (isAdmin) {
            addBtn.disabled = true;
            addBtn.textContent = "Vista de Administrador";
            addBtn.style.backgroundColor = "#ccc";
            addBtn.style.cursor = "not-allowed";
        } else if ((product.stock || 0) <= 0) {
            addBtn.disabled = true;
            addBtn.textContent = "Sin Stock";
        } else {
            addBtn.disabled = false;
            addBtn.textContent = "Agregar al Carrito";
        }

        addBtn.addEventListener("click", async () => {
            if (isAdmin) {
                alert("Los administradores no pueden realizar compras.");
                return;
            }

            // 2. Verificación de autenticación
            if (!Auth.isAuthenticated()) {
                alert("Debes iniciar sesión para agregar al carrito.");
                // Opcional: openLoginModal();
                return;
            }

            // 3. Verificación de stock
            if ((product.stock || 0) <= 0) {
                alert("Este producto no tiene stock disponible.");
                return;
            }

            // 4. Llamada a la API
            const res = await ApiClient.addToCart({
                product_id: product.product_id || productId,
                quantity: 1
            });

            if (res.ok) {
                alert("Producto agregado al carrito.");
            } else {
                alert(res.message || "Error al agregar al carrito.");
            }
        });
    }
});
