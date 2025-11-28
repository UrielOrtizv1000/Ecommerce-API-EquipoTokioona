// js/shop.js

const API_BASE_URL = 'http://localhost:3000/api/';

//  Renderizador de productos
function renderProducts(products, wishlistItems) {
  const container = document.getElementById("products-container");
  container.innerHTML = ""; // Limpiar antes de renderizar

  if (!products || products.length === 0) {
    container.innerHTML = "<p>No hay productos para esta categoría.</p>";
    return;
  }

  // Convertir la lista de deseos a un Set para una consulta rápida (O(1))
    // Asumimos que los items tienen una propiedad product_id o id.
  const wishlistProductIds = new Set(wishlistItems.map(item => String(item.product_id || item.id)));

  async function addToWishlistAPI(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId: productId }), 
      });
      if (response.status === 201) {
        return true;
      }
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.message || 'Fallo en la adición.'}`);
    } catch (error) {
      alert('Error al añadir el producto a la lista de deseos.');
      return false;
    }
  }

    async function deleteFromWishlistAPI(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}wishlist/delete/${productId}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                return true;
            }
            if (response.status === 404) {
                return true;
            }

            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Fallo en la eliminación.'}`);
        } catch (error) {
            alert('Error al eliminar el producto de la lista de deseos.');
            return false;
        }
    }

  products.forEach(p => {

    // Lógica para determinar el estado inicial del corazón
    const isProductInWishlist = wishlistProductIds.has(String(p.id));
    const iconClass = isProductInWishlist ? 'fas' : 'far'; // fas (lleno) o far (vacío)
    const activeClass = isProductInWishlist ? 'active' : '';
    
    const card = document.createElement("div");
    card.classList.add("card");
  
    card.innerHTML = `
      <div class="card-header">
        <span class="wishlist-btn ${activeClass}">
          <i class="${iconClass} fa-heart"></i> 
        </span>
        <img src="http://localhost:3000/images/${p.image}" alt="${p.name}">
      </div>
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

      const wishlistButton = card.querySelector('.wishlist-btn');
      const icon = wishlistButton.querySelector('i');
      
      wishlistButton.addEventListener('click', async () => {
        let success = false;
        
        // Check the current state and call the API
        if (icon.classList.contains('far')) {
          // State: Empty heart (far). Action: Add (POST)
          success = await addToWishlistAPI(p.id); 
        } else {
          // State: Filled heart (fas). Action: Remove (DELETE)
          success = await deleteFromWishlistAPI(p.id); 
        }
        // If the API call was successful, update the UI
        if (success) {
          wishlistButton.classList.toggle('active');
          icon.classList.toggle('far');
          icon.classList.toggle('fas');
        }
      });
      
      // Functionality for the "Add to Cart" button
      const addToCartButton = card.querySelector('.card-btn button');

      addToCartButton.addEventListener('click', async () => {
        const added = await addToWishlistAPI(p.id);
        if (added) {
          alert(`¡${p.name} added to the cart!`); //// PENDIENTE
        }
      });
  });
}

async function getWishlistAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}wishlist`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
        }

        const data = await response.json();
        return data.products || []; 
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return []; 
    }
}

async function renderWithWishlistData(products) {
    try {
        const wishlistItems = await getWishlistAPI();
        
        renderProducts(products, wishlistItems);
    } catch (error) {
        renderProducts(products, []); 
    }
}

//     Carga inicial
document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get("category");

  if (categoryFromURL && categoryFromURL !== "all") {
    const filtered = productsData.filter(p => p.category === categoryFromURL);
    
    renderWithWishlistData(filtered);
  } else {
    renderWithWishlistData(productsData);
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
        renderWithWishlistData(productsData);
      } else {
        const filtered = productsData.filter(p => p.category === category);
        renderWithWishlistData(filtered);
      }
    });
  });
}
