// front/js/cartPage.js

document.addEventListener("DOMContentLoaded", () => {
  loadCart(); // lo que ya tienes

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }
});


async function loadCart() {
  const itemsContainer = document.getElementById("cart-items");
  const emptyMessage   = document.getElementById("empty-cart");
  const summaryBox     = document.getElementById("cart-summary");

  const subtotalEl = document.getElementById("subtotal");
  const taxesEl    = document.getElementById("taxes");
  const shippingEl = document.getElementById("shipping");
  const discountEl = document.getElementById("discount");
  const totalEl    = document.getElementById("total");

  if (!itemsContainer) return;

  // Mensaje de carga
  itemsContainer.innerHTML = "<p class='loading'>Cargando carrito...</p>";

  // 1) Pedir carrito al backend
  const result = await ApiClient.getCart();

  if (!result.ok) {
    console.error("Error al obtener el carrito:", result.message);
    itemsContainer.innerHTML = `
      <div class="empty-cart-message">
        <p>No se pudo cargar tu carrito.</p>
        <p>${result.message || "Intenta de nuevo más tarde."}</p>
      </div>
    `;
    if (summaryBox) summaryBox.style.display = "none";
    return;
  }

  // La respuesta puede venir de varias formas; lo hacemos tolerante:
  const data = result.data || {};
  let items = data.items || data.cart || data;

  if (!Array.isArray(items)) {
    items = [];
  }

  // 2) Si no hay productos → mostrar mensaje vacío
  if (!items.length) {
    itemsContainer.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    if (summaryBox) summaryBox.style.display = "none";
    return;
  }

  // 3) Hay productos → ocultar "vacío" y mostrar resumen
  if (emptyMessage) emptyMessage.style.display = "none";
  if (summaryBox) summaryBox.style.display = "block";

  renderCartItems(items, itemsContainer);
  updateSummary(items, { subtotalEl, taxesEl, shippingEl, discountEl, totalEl });
}

// Pinta los items del carrito en el DOM
function renderCartItems(items, container) {
  container.innerHTML = "";

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.productId = item.product_id;

    const price = Number(item.price || 0);
    const qty   = Number(item.quantity || 0);
    const subtotal = Number(item.subtotal ?? price * qty);

    row.innerHTML = `
      <div class="item-info">
        <div class="item-text">
          <h3 class="item-title">${item.name}</h3>
          <p class="item-meta">ID: ${item.product_id}</p>
        </div>
      </div>

      <div class="item-price">
        $${price.toFixed(2)}
      </div>

      <div class="item-quantity">
        <button class="qty-decrease">-</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-increase">+</button>
      </div>

      <div class="item-subtotal">
        $${subtotal.toFixed(2)}
      </div>

      <div class="item-actions">
        <button class="remove-item">Eliminar</button>
      </div>
    `;

    const btnPlus   = row.querySelector(".qty-increase");
    const btnMinus  = row.querySelector(".qty-decrease");
    const btnRemove = row.querySelector(".remove-item");

    btnPlus.addEventListener("click", () => changeQuantity(item.product_id, qty + 1));
    btnMinus.addEventListener("click", () => changeQuantity(item.product_id, qty - 1));
    btnRemove.addEventListener("click", () => removeItem(item.product_id));

    container.appendChild(row);
  });
}

// Actualiza subtotal, impuestos, total (simple: IVA 16%, envío 0, sin descuento)
function updateSummary(items, els) {
  const { subtotalEl, taxesEl, shippingEl, discountEl, totalEl } = els;

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.price || 0);
    const qty   = Number(item.quantity || 0);
    const rowSubtotal = Number(item.subtotal ?? price * qty);
    return acc + rowSubtotal;
  }, 0);

  const taxes    = subtotal * 0.16;
  const shipping = 0;
  const discount = 0;
  const total    = subtotal + taxes + shipping - discount;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxesEl)    taxesEl.textContent    = `$${taxes.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
  if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;
}

// Cambiar cantidad (+/-)
async function changeQuantity(productId, newQty) {
  if (newQty <= 0) {
    const confirmed = confirm("¿Deseas eliminar este producto del carrito?");
    if (!confirmed) return;
    await removeItem(productId);
    return;
  }

  const result = await ApiClient.updateCartItem({
    product_id: productId,
    quantity: newQty
  });

  if (!result.ok) {
    alert(result.message || "Error al actualizar cantidad");
    return;
  }

  // Volver a cargar el carrito actualizado
  loadCart();
}

// Eliminar item
async function removeItem(productId) {
  const result = await ApiClient.removeFromCart(productId);

  if (!result.ok) {
    alert(result.message || "Error al eliminar producto del carrito");
    return;
  }

  loadCart();
}
