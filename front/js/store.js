// front/js/store.js - VERSIÓN LIMPIA Y FUNCIONAL

class Store {
    constructor() {
        this.allProducts = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        console.log('🛍️ Inicializando tienda...');
        await this.loadProducts();
        this.setupCategoryFilters();
        this.renderProducts(this.allProducts);
    }

    async loadProducts() {
        const container = document.getElementById("products-container");
        if (!container) {
            console.error('❌ No se encontró el contenedor de productos');
            return;
        }

        container.innerHTML = "<p class='loading'>Cargando productos...</p>";

        try {
            console.log('📦 Solicitando productos a la API...');
            const result = await ApiClient.getAllProducts();
            console.log('✅ Respuesta de API:', result);

            if (result && result.ok) {
                this.allProducts = result.data.products || [];
                console.log(`🎯 ${this.allProducts.length} productos cargados`);
                
                if (this.allProducts.length === 0) {
                    container.innerHTML = "<p class='no-products'>No hay productos disponibles.</p>";
                } else {
                    container.innerHTML = ""; // Limpiar loading
                }
            } else {
                throw new Error(result?.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('💥 Error cargando productos:', error);
            container.innerHTML = `
                <div class="error">
                    <p>Error: ${error.message}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    }

    renderProducts(products) {
        const container = document.getElementById("products-container");
        if (!container) return;

        container.innerHTML = "";

        if (!products || products.length === 0) {
            container.innerHTML = "<p class='no-products'>No hay productos en esta categoría.</p>";
            return;
        }

        console.log(`🎨 Renderizando ${products.length} productos`);

        products.forEach(product => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = this.getProductCardHTML(product);
        
        // Configurar eventos
        this.setupCardEvents(card, product);
        
        return card;
    }

    getProductCardHTML(product) {
    const isOnSale = product.is_on_sale;
    const lowStock = product.stock < 10;
    
    // Manejo seguro de la imagen
    const imageUrl = product.image_url || 'https://via.placeholder.com/300x300/cccccc/969696?text=Imagen+No+Disponible';
    
    return `
        <div class="card-header">
            <span class="wishlist-btn">
                <i class="far fa-heart"></i>
            </span>
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 class="product-image">
        </div>
        <h4>${product.name || 'Producto'}</h4>
        <p>${product.description || 'Descripción no disponible'}</p>
        <p class="price">$${parseFloat(product.price || 0).toFixed(2)}</p>
        <p>Stock: ${product.stock || 0}</p>
        <div class="tags">
            ${isOnSale ? '<span class="tag">oferta</span>' : ''}
            ${lowStock ? '<span class="tag">últimas unidades</span>' : ''}
            ${product.category_name ? `<span class="tag">${product.category_name}</span>` : ''}
        </div>
        <div class="card-btn">
            <button class="add-to-cart-btn" ${(product.stock || 0) === 0 ? 'disabled' : ''}>
                ${(product.stock || 0) === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
        </div>
    `;
}

    setupCardEvents(card, product) {
        const wishlistBtn = card.querySelector('.wishlist-btn');
        const cartBtn = card.querySelector('.add-to-cart-btn');

        wishlistBtn.addEventListener('click', () => this.handleWishlist(product, wishlistBtn));
        cartBtn.addEventListener('click', () => this.handleAddToCart(product));
    }

    async handleWishlist(product, button) {
        if (!localStorage.getItem('token')) {
            alert('Debes iniciar sesión para usar la lista de deseos');
            return;
        }

        const icon = button.querySelector('i');
        const isAdding = icon.classList.contains('far');
        
        try {
            const result = isAdding ? 
                await ApiClient.addToWishlist(product.product_id) : 
                await ApiClient.removeFromWishlist(product.product_id);
                
            if (result.ok) {
                button.classList.toggle('active');
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
            } else {
                alert(result.message || 'Error en la operación');
            }
        } catch (error) {
            console.error('Error wishlist:', error);
            alert('Error de conexión');
        }
    }

    async handleAddToCart(product) {
        if (!localStorage.getItem('token')) {
            alert('Debes iniciar sesión para agregar al carrito');
            return;
        }

        if ((product.stock || 0) === 0) {
            alert('Producto sin stock');
            return;
        }

        try {
            const result = await ApiClient.addToCart({
                product_id: product.product_id, 
                quantity: 1 
            });
            
            if (result.ok) {
                alert(`¡${product.name} agregado al carrito!`);
            } else {
                alert(result.message || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error cart:', error);
            alert('Error de conexión al carrito');
        }
    }

    filterProducts(category) {
        if (category === 'all') {
            return this.allProducts;
        }
        
        return this.allProducts.filter(product => {
            const productCategory = product.category_name ? 
                product.category_name.toLowerCase() : 
                'general';
            return productCategory === category;
        });
    }

    setupCategoryFilters() {
        const buttons = document.querySelectorAll(".sidebar button");
        console.log(`🔘 Encontrados ${buttons.length} botones de categoría`);

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.category;
                console.log(`🎯 Filtrando por categoría: ${category}`);
                
                // Actualizar botón activo
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filteredProducts = this.filterProducts(category);
                this.renderProducts(filteredProducts);
            });
        });
    }
}

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 DOM listo, creando instancia de Store...');
    window.store = new Store();
});