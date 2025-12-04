// front/js/wishlistPage.js

class WishlistPage {
    constructor() {
        this.container = document.getElementById("wishlist-products-container");
        this.emptyMessage = document.getElementById("empty-wishlist-message");
        this.init();
    }

    async init() {
        if (typeof Auth === "undefined" || !Auth.isAuthenticated()) {
            // Usar Swal.fire para la autenticación
            Swal.fire({
                icon: 'warning',
                title: 'Acceso Denegado',
                text: 'Debes iniciar sesión para ver tu lista de deseos.',
                confirmButtonText: 'Ir a Inicio'
            }).then(() => {
                window.location.href = "index.html"; 
            });
            return;
        }

        this.loadWishlist();
    }

    async loadWishlist() {
        if (!this.container) return;
        this.container.innerHTML = "<p class='loading'>Cargando productos...</p>";
        this.emptyMessage.style.display = 'none';

        try {
            const result = await ApiClient.getWishlist();
            
            if (result.ok && result.data && Array.isArray(result.data.products)) {
                const wishlistItems = result.data.products;
                
                if (wishlistItems.length === 0) {
                    this.showEmptyMessage();
                } else {
                    await this.fetchAndRenderProductDetails(wishlistItems);
                }
            } else {
                throw new Error(result?.message || "Error al cargar la lista de IDs.");
            }
        } catch (error) {
            console.error("💥 Error cargando la Wishlist:", error);
            // Mostrar error usando Swal
            Swal.fire('Error de Carga', error.message || 'Ocurrió un error al obtener la lista de deseos.', 'error');
        }
    }
    
    async fetchAndRenderProductDetails(wishlistItems) {
        
        const productDetailPromises = wishlistItems.map(item => {
            const productId = item.product_id; 
            return ApiClient.getProductById(productId); 
        });

        const results = await Promise.allSettled(productDetailPromises);
        
        const finalProducts = results
            .filter(res => res.status === 'fulfilled' && res.value.ok) 
            .map(res => res.value.data.product || res.value.data); 
            
        this.renderProducts(finalProducts);
    }

    showEmptyMessage() {
        this.container.innerHTML = "";
        this.emptyMessage.style.display = 'block';
    }

    showError(message) {
        this.container.innerHTML = `<p class='error'>Error al cargar: ${message}.</p>`;
    }

    renderProducts(products) {
        this.container.innerHTML = "";
        
        products.forEach(product => {
            const card = this.createWishlistCard(product);
            this.container.appendChild(card);
        });
    }

    createWishlistCard(product) {
        const productId = product.product_id || product.id; 
        
        const card = document.createElement("div");
        card.className = "card"; 

        const BACK_URL = window.APP_CONFIG.BACK_URL;
        const baseImageUrl = BACK_URL + "/images/";
            let imageUrl;

            if (product.image_url) {
                // Verifica si ya es una URL completa
                if (product.image_url.startsWith("http")) {
                    imageUrl = product.image_url;
                } else {
                    // Si es solo un nombre de archivo, añade la ruta base
                    imageUrl = baseImageUrl + product.image_url;
                }
            } else {
                imageUrl = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
        }
        
        const formattedPrice = parseFloat(product.price).toFixed(2) || '0.00';


        card.innerHTML = `
            <div class="card-header">
                <img src="${imageUrl}" alt="${product.name}" class="product-image"> 
            </div>
            <h4 class="product-title">${product.name}</h4>
            <p class="price">$${formattedPrice}</p>
            
            <div class="card-btn-group">
                <button class="remove-btn" data-product-id="${productId}">
                    Eliminar
                </button>
                <button class="add-to-cart-btn" data-product-id="${productId}">
                    Añadir al Carrito
                </button>
            </div>
        `;
        
        card.querySelector('.remove-btn').addEventListener('click', () => {
            this.handleRemoveFromWishlist(productId, product.name); // Pasar el nombre para el Swal
        });
        
        card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            this.handleAddToCartFromWishlist(productId, product.name); // Pasar el nombre para el Swal
        });

        return card;
    }
    
    async handleRemoveFromWishlist(productId, productName) {
        // Reemplazo de 'confirm' nativo por SweetAlert2
        const confirmation = await Swal.fire({
            title: `Eliminar ${productName}?`,
            text: "¿Estás seguro de que quieres quitar este producto de tu lista?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
            cancelButtonColor: '#7a7a7a',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            const result = await ApiClient.removeFromWishlist(productId);
            if (result.ok) {
                Swal.fire('¡Eliminado!', `${productName} ha sido eliminado de tu lista.`, 'success');
                this.loadWishlist(); 
            } else {
                Swal.fire('Error', result.message || 'No se pudo eliminar el producto.', 'error');
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            Swal.fire('Error de Conexión', 'Hubo un problema al intentar contactar al servidor.', 'error');
        }
    }
    
    async handleAddToCartFromWishlist(productId, productName) {
        try {
            const result = await ApiClient.addToCart({ product_id: productId, quantity: 1 });
            if (result.ok) {
                Swal.fire('¡Añadido!', `${productName} se agregó al carrito.`, 'success');
                
                if (typeof Auth !== "undefined" && typeof Auth.updateCartCount === "function") {
                    Auth.updateCartCount();
                }
            } else {
                // Manejar error de duplicación si el carrito no lo permite
                Swal.fire('Error', result.message || 'No se pudo añadir al carrito.', 'error');
            }
        } catch (error) {
            console.error("Error al añadir al carrito:", error);
            Swal.fire('Error de Conexión', 'Hubo un problema al añadir el producto.', 'error');
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.wishlistPage = new WishlistPage();
});