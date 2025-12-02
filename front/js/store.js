// front/js/store.js - TIENDA CON CATEGORÍAS DINÁMICAS + FILTRO DE PRECIO + OFERTAS

class Store {
    constructor() {
        this.allProducts = [];
        this.currentCategory = "all";
        this.priceMin = null;
        this.priceMax = null;
        this.onlyOffers = false;

        this.init();
    }

    async init() {
        console.log("🛍️ Inicializando tienda...");

        // 1) Cargar productos
        await this.loadProducts();

        // 2) Cargar categorías desde la BD y crear botones
        await this.loadCategories();

        // 3) Conectar eventos de botones de categoría
        this.setupCategoryFilters();

        // 4) Conectar eventos de filtros (precio + ofertas)
        this.setupFilterControls();

        // 5) Primer render con todos los productos
        this.applyFilters();
    }

    // ==========================
    // CARGA DE PRODUCTOS
    // ==========================
    async loadProducts() {
        const container = document.getElementById("products-container");
        if (!container) {
            console.error("❌ No se encontró el contenedor de productos");
            return;
        }

        container.innerHTML = "<p class='loading'>Cargando productos...</p>";

        try {
            console.log("📦 Solicitando productos a la API...");
            const result = await ApiClient.getAllProducts();
            console.log("✅ Respuesta de API:", result);

            if (result && result.ok) {
                const data = result.data || {};
                // Soporta:
                // - { products: [...] }
                // - [ ... ]
                this.allProducts = Array.isArray(data)
                    ? data
                    : (data.products || []);

                console.log(`🎯 ${this.allProducts.length} productos cargados`);

                if (this.allProducts.length === 0) {
                    container.innerHTML = "<p class='no-products'>No hay productos disponibles.</p>";
                } else {
                    container.innerHTML = "";
                }
            } else {
                throw new Error(result?.message || "Error desconocido");
            }
        } catch (error) {
            console.error("💥 Error cargando productos:", error);
            container.innerHTML = `
                <div class="error">
                    <p>Error: ${error.message}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    }

    // ==========================
    // CARGA DE CATEGORÍAS (BD)
    // ==========================
    async loadCategories() {
        const list = document.getElementById("category-list");
        if (!list) {
            console.error("❌ No existe #category-list en el HTML");
            return;
        }

        try {
            console.log("📂 Pidiendo categorías a la API...");
            const result = await ApiClient.getCategories();
            console.log("✅ Respuesta de categorías:", result);

            if (!result.ok || !result.data) {
                console.warn("⚠️ No se pudieron cargar categorías desde la API");
                return;
            }

            const data = result.data;
            const categories = Array.isArray(data)
                ? data
                : (data.categories || []);

            if (!Array.isArray(categories) || categories.length === 0) {
                console.warn("⚠️ La API no devolvió categorías válidas");
                return;
            }

            // Asumimos que ya tienes un botón "Todos" en el HTML.
            categories.forEach((cat) => {
                const li = document.createElement("li");
                const btn = document.createElement("button");

                const categoryName = cat.category_name || "Categoría";

                btn.dataset.category = categoryName.toLowerCase().trim();
                btn.textContent = categoryName;

                li.appendChild(btn);
                list.appendChild(li);
            });
        } catch (error) {
            console.error("💥 Error cargando categorías desde la API:", error);
        }
    }

    // ==========================
    // RENDER DE PRODUCTOS
    // ==========================
    renderProducts(products) {
        const container = document.getElementById("products-container");
        if (!container) return;

        container.innerHTML = "";

        if (!products || products.length === 0) {
            container.innerHTML =
                "<p class='no-products'>No hay productos que coincidan con los filtros.</p>";
            return;
        }

        console.log(`🎨 Renderizando ${products.length} productos`);

        products.forEach((product) => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    // ==========================
    // TARJETA DE PRODUCTO
    // ==========================
    createProductCard(product) {
        const card = document.createElement("div");
        card.className = "card";

        const baseImageUrl = "http://localhost:3000/images/";
        let imageUrl;

        if (product.image_url) {
            imageUrl = product.image_url.startsWith("http")
                ? product.image_url
                : baseImageUrl + product.image_url;
        } else {
            imageUrl =
                "https://via.placeholder.com/300x200/cccccc/969696?text=Imagen+No+Disponible";
        }

        let tagsArray = [];
        try {
            if (product.tags) {
                if (typeof product.tags === "string") {
                    tagsArray = JSON.parse(product.tags);
                } else if (Array.isArray(product.tags)) {
                    tagsArray = product.tags;
                }
            }
        } catch (error) {
            console.error("Error parseando tags para el producto:", product.name, error);
            tagsArray = [];
        }

        const tagsHTML = tagsArray
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("");

        // Marcamos si está en oferta
        const isOnOffer =
            product.on_offer ||
            product.is_offer ||
            product.offer ||
            product.isOffer ||
            false;

        const offerBadge = isOnOffer
            ? `<span class="badge-offer">Oferta</span>`
            : "";

        card.innerHTML = `
            <div class="card-header">
                <span class="wishlist-btn">
                    <i class="far fa-heart"></i>
                </span>
                ${offerBadge}
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
            </div>
            <h4 class="product-title">${product.name}</h4>
            <p>${product.description || "Descripción no disponible"}</p>
            <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
            <p>Stock: ${product.stock}</p>
            <div class="tags">
                ${tagsHTML}
            </div>
            <div class="card-btn">
                <button class="add-to-cart-btn" ${product.stock === 0 ? "disabled" : ""}>
                    ${product.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                </button>
            </div>
        `;

        const wishlistBtn = card.querySelector(".wishlist-btn");
        const cartBtn = card.querySelector(".add-to-cart-btn");
        const imageEl = card.querySelector(".product-image");
        const titleEl = card.querySelector(".product-title");

        // ❤️ Wishlist
        wishlistBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleWishlist(product, wishlistBtn);
        });

        // 🛒 Botón agregar al carrito
        cartBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(product);
        });

        // 🔗 Navegar al detalle al hacer clic en imagen o título
        const goToDetail = () => {
            window.location.href = `product.html?id=${product.product_id}`;
        };

        imageEl.addEventListener("click", goToDetail);
        titleEl.addEventListener("click", goToDetail);

        return card;
    }

    // ==========================
    // WISHLIST
    // ==========================
    async handleWishlist(product, button) {
        if (!localStorage.getItem("token")) {
            alert("Debes iniciar sesión para usar la lista de deseos");
            return;
        }

        const icon = button.querySelector("i");
        const isAdding = icon.classList.contains("far");

        try {
            const result = isAdding
                ? await ApiClient.addToWishlist(product.product_id)
                : await ApiClient.removeFromWishlist(product.product_id);

            if (result.ok) {
                button.classList.toggle("active");
                icon.classList.toggle("far");
                icon.classList.toggle("fas");
            } else {
                alert(result.message || "Error en la operación");
            }
        } catch (error) {
            console.error("Error wishlist:", error);
            alert("Error de conexión");
        }
    }

    // ==========================
    // CARRITO
    // ==========================
    async handleAddToCart(product) {
        if (!localStorage.getItem("token")) {
            alert("Debes iniciar sesión para agregar al carrito");
            return;
        }

        if ((product.stock || 0) === 0) {
            alert("Producto sin stock");
            return;
        }

        try {
            const result = await ApiClient.addToCart({
                product_id: product.product_id,
                quantity: 1,
            });

            if (result.ok) {
                alert(`¡${product.name} agregado al carrito!`);
                // Si quieres actualizar el contador del header:
                if (window.Auth && typeof Auth.updateCartCount === "function") {
                    Auth.updateCartCount();
                }
            } else {
                alert(result.message || "Error al agregar al carrito");
            }
        } catch (error) {
            console.error("Error cart:", error);
            alert("Error de conexión al carrito");
        }
    }

    // ==========================
    // FILTROS (CATEGORÍA + PRECIO + OFERTA)
    // ==========================
    applyFilters() {
        let products = [...this.allProducts];

        // 1) Filtro por categoría
        if (this.currentCategory && this.currentCategory !== "all") {
            products = products.filter((product) => {
                const productCategory = product.category_name
                    ? product.category_name.toLowerCase().trim()
                    : "";
                return productCategory === this.currentCategory;
            });
        }

        // 2) Filtro por rango de precios
        if (this.priceMin !== null) {
            products = products.filter(
                (p) => Number(p.price) >= this.priceMin
            );
        }

        if (this.priceMax !== null) {
            products = products.filter(
                (p) => Number(p.price) <= this.priceMax
            );
        }

        // 3) Filtro por productos en oferta
        if (this.onlyOffers) {
            products = products.filter((p) => {
                const flag =
                    p.on_offer ?? 
                    p.is_offer ?? 
                    p.offer ?? 
                    p.isOffer ?? 
                    0;
                return flag === true || flag === 1 || flag === "1";
            });
        }

        this.renderProducts(products);
    }

    // ==========================
    // BOTONES DE CATEGORÍA
    // ==========================
    setupCategoryFilters() {
        const buttons = document.querySelectorAll(".sidebar button");
        console.log(`🔘 Encontrados ${buttons.length} botones de categoría`);

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.category;
                console.log(`🎯 Filtrando por categoría: ${category}`);

                this.currentCategory = category || "all";

                // Actualizar botón activo
                buttons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                this.applyFilters();
            });
        });
    }

    // ==========================
    // CONTROLES DE FILTRO (PRECIO + OFERTA)
    // ==========================
    setupFilterControls() {
        const minInput = document.getElementById("price-min");
        const maxInput = document.getElementById("price-max");
        const offerCheckbox = document.getElementById("filter-offer");

        if (minInput) {
            minInput.addEventListener("input", () => {
                const value = parseFloat(minInput.value);
                this.priceMin = isNaN(value) ? null : value;
                this.applyFilters();
            });
        }

        if (maxInput) {
            maxInput.addEventListener("input", () => {
                const value = parseFloat(maxInput.value);
                this.priceMax = isNaN(value) ? null : value;
                this.applyFilters();
            });
        }

        if (offerCheckbox) {
            offerCheckbox.addEventListener("change", () => {
                this.onlyOffers = offerCheckbox.checked;
                this.applyFilters();
            });
        }
    }
}

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 DOM listo, creando instancia de Store...");
    window.store = new Store();
});
