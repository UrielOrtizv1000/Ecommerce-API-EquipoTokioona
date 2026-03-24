// front/js/checkout.js

// Vamos a tener estos refs globales para no estar buscándolos mil veces
let orderItemsContainer;
let subtotalEl, taxesEl, shippingEl, discountEl, totalEl;
let countrySelect;

document.addEventListener('DOMContentLoaded', () => {
  // Asegurarnos de que Auth ya se inicializó (viene de auth.js)
  // y luego inicializar el checkout.
  initCheckoutPage();
});

async function initCheckoutPage() {
  // Referencias a elementos del DOM
  orderItemsContainer = document.getElementById('order-summary');
  subtotalEl        = document.getElementById('order-subtotal');
  taxesEl           = document.getElementById('order-taxes');
  shippingEl        = document.getElementById('order-shipping');
  discountEl        = document.getElementById('order-discount');
  totalEl           = document.getElementById('order-total');
  countrySelect     = document.getElementById('country');

  // Si no hay contenedor, salimos (por si se usa este JS en otra página sin querer)
  if (!orderItemsContainer) return;

  // 1) Verificar que el usuario esté logueado
  if (!Auth.isAuthenticated()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Inicio de sesión requerido',
      text: 'Debes iniciar sesión para usar la lista de deseos',
      confirmButtonText: 'Entendido'
    });
    window.location.href = 'store.html';
    return;
  }

  // 2) Preparar eventos de UI
  setupPaymentMethodToggles();
  setupPlaceOrderHandler();
  setupCountryChangeHandler();

  // 3) Cargar carrito y totales
  await loadCartAndTotals();
}

/* =========================================================
   Cargar carrito y mostrar en el resumen del checkout
   ========================================================= */
async function loadCartAndTotals() {
  // Limpiar contenido mientras carga
  orderItemsContainer.innerHTML = '<p>Cargando tu carrito...</p>';

  try {
    const result = await ApiClient.getCart();

    if (!result.ok || !result.data || result.data.success === false) {
      orderItemsContainer.innerHTML = `
        <p>No pudimos obtener tu carrito.</p>
        <a href="cart.html" class="btn btn-secondary">Volver al carrito</a>
      `;
      setFallbackTotals(0);
      return;
    }

    const { items, subtotal } = result.data;

    if (!items || items.length === 0) {
      orderItemsContainer.innerHTML = `
        <p>Tu carrito está vacío.</p>
        <a href="store.html" class="btn btn-primary">Ir a la tienda</a>
      `;
      setFallbackTotals(0);
      return;
    }

    // Renderizar items del pedido (nombre, cantidad, subtotal)
    renderOrderItems(items);

    // Intentar calcular totales “reales” con impuestos/envío/cupón
    await recalculateTotals(subtotal);
  } catch (error) {
    console.error('Error cargando carrito en checkout:', error);
    orderItemsContainer.innerHTML = `
      <p>Ocurrió un error al cargar el carrito.</p>
      <a href="cart.html" class="btn btn-secondary">Volver al carrito</a>
    `;
    setFallbackTotals(0);
  }
}

/* Renderiza la lista de productos del pedido en la columna "Order Summary" */
function renderOrderItems(items) {
  orderItemsContainer.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'summary-item';
    row.innerHTML = `
      <div class="summary-item-main">
        <span class="summary-item-name">${item.name}</span>
        <span class="summary-item-qty">x${item.quantity}</span>
      </div>
      <div class="summary-item-price">
        $${Number(item.subtotal).toFixed(2)}
      </div>
    `;
    orderItemsContainer.appendChild(row);
  });
}

/* =========================================================
   Totales: usar /cart/calculate si existe, o fallback
   ========================================================= */
async function recalculateTotals(subtotalFromCart) {
  // Si no tenemos subtotal desde el carrito, cae a 0
  const baseSubtotal = Number(subtotalFromCart || 0);

  // Tomar “state” desde el formulario (por ahora usamos country como state)
  const state = countrySelect && countrySelect.value
    ? countrySelect.value
    : 'MX'; // valor por defecto

  try {
    const result = await ApiClient.calculateTotals({
      state,
      shippingMethod: 'standard'
    });

    if (result.ok && result.data && result.data.success !== false) {
      const data = result.data;

      const subtotal   = Number(data.subtotal || baseSubtotal);
      const taxes      = Number(data.taxes || 0);
      const shipping   = Number(data.shippingCost || 0);
      const discount   = Number(data.discount || 0);
      const total      = Number(data.total || (subtotal + taxes + shipping - discount));

      const currency = data.currency || "$";

      // Actualiza UI con moneda correcta
      subtotalEl.textContent = `${currency} ${subtotal.toFixed(2)}`;
      taxesEl.textContent    = `${currency} ${taxes.toFixed(2)}`;
      shippingEl.textContent = `${currency} ${shipping.toFixed(2)}`;
      discountEl.textContent = `-${currency} ${discount.toFixed(2)}`;
      totalEl.textContent    = `${currency} ${total.toFixed(2)}`;
    } else {
      // Si falla el endpoint de cálculo, usar solo el subtotal
      setFallbackTotals(baseSubtotal);
    }

  } catch (error) {
    console.error('Error recalculando totales:', error);
    setFallbackTotals(baseSubtotal);
  }
}

/* Totales simples cuando no hay cálculo avanzado en el backend */
function setFallbackTotals(subtotal) {
  const currency = "$"; // Default
  subtotalEl.textContent = `${currency} ${subtotal.toFixed(2)}`;
  taxesEl.textContent = `${currency} 0.00`;
  shippingEl.textContent = `${currency} 0.00`;
  discountEl.textContent = `-${currency} 0.00`;
  totalEl.textContent = `${currency} ${subtotal.toFixed(2)}`;
}

/* Recalcular totales cuando el usuario cambia de país/estado */
function setupCountryChangeHandler() {
  if (!countrySelect) return;

  countrySelect.addEventListener("change", async () => {
    const currentSubtotal = parseFloat(subtotalEl.textContent.replace("$", "")) || 0;
    await recalculateTotals(currentSubtotal);
  });
}

/* =========================================================
   Métodos de pago: mostrar/ocultar detalles según el radio
   ========================================================= */
function setupPaymentMethodToggles() {
  const radios = document.querySelectorAll('input[name="payment-method"]');

  const creditDetails = document.getElementById('credit-card-details');
  const bankDetails   = document.getElementById('bank-transfer-details');
  const oxxoDetails   = document.getElementById('oxxo-details');

  function updateVisibility(selected) {
    if (creditDetails) creditDetails.style.display = (selected === 'credit-card') ? 'block' : 'none';
    if (bankDetails)   bankDetails.style.display   = (selected === 'bank-transfer') ? 'block' : 'none';
    if (oxxoDetails)   oxxoDetails.style.display   = (selected === 'oxxo') ? 'block' : 'none';
  }

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateVisibility(radio.value);
    });
  });

  // Estado inicial (el radio de "credit-card" viene checked en tu HTML)
  const checked = document.querySelector('input[name="payment-method"]:checked');
  updateVisibility(checked ? checked.value : 'credit-card');
}

async function saveAddress(shipping) {
  const result = await ApiClient.createAddress({
    recipientName: shipping.name,
    addressLine1: shipping.address,
    city: shipping.city,
    postalCode: shipping.zipCode,
    country: shipping.country,
    phone: shipping.phone
  });

  if (!result.ok || !result.data || result.data.success !== true) {
    throw new Error(result.data?.message || "No se pudo guardar la dirección");
  }

  return result.data.addressId;
}

/* =========================================================
   Place Order: mandar todo al backend (/cart/checkout)
   ========================================================= */
function setupPlaceOrderHandler() {
  const placeOrderBtn = document.getElementById('place-order');
  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener('click', async () => {

    const shipping = collectShippingData();
    if (!shipping) return;

    const payment = collectPaymentData();
    if (!payment) return;

    placeOrderBtn.disabled = true;
    const originalText = placeOrderBtn.textContent;
    placeOrderBtn.textContent = "Procesando...";

    try {
      // 1. Guardar dirección → obtener ID
      const addressId = await saveAddress(shipping);

      // 2. Crear payload para backend
      const payload = {
      shipping: {
      recipientName: shipping.name,
      addressId: addressId,
      state: shipping.state,
      method: shipping.method
    },
    payment
  };


      // 3. Checkout real
      const result = await ApiClient.checkout(payload);

      if (result.data && result.data.success) {
        await Swal.fire({
          icon: 'success',
          title: '🎉',
          text: `¡Compra realizada exitosamente! `,
          timer: 1500,
          showConfirmButton: false
        });
        window.location.href = "index.html";
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "Error al agregar al carrito",
          confirmButtonText: 'Entendido'
        });
      }

    } catch (error) {
      console.error("Error en checkout:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Hubo un error durante la compra",
        confirmButtonText: 'Entendido'
      });
    } finally {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = originalText;
    }
  });
}

/* Lee y valida la información de envío del formulario */
function collectShippingData() {
  const fullName = document.getElementById('full-name')?.value.trim();
  const email    = document.getElementById('email')?.value.trim();
  const address  = document.getElementById('address')?.value.trim();
  const city     = document.getElementById('city')?.value.trim();
  const zipCode  = document.getElementById('zip-code')?.value.trim();
  const country  = document.getElementById('country')?.value;
  const phone    = document.getElementById('phone')?.value.trim();

  if (!fullName || !email || !address || !city || !zipCode || !country || !phone) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos faltantes',
      text: 'Por favor, llena los campos de envío',
      timer: 1500,
      showConfirmButton: false
    });
    return null;
  }

  return {
    name: fullName,
    email,
    address,
    city,
    zipCode,
    country,
    // Aquí el backend espera "state", así que por ahora usamos country
    state: country,
    method: 'standard',
    phone
  };
}

/* Lee la información de pago según el método seleccionado */
function collectPaymentData() {
  const selected = document.querySelector('input[name="payment-method"]:checked');
  const method = selected ? selected.value : 'credit-card';

  if (method === "credit-card") {
    const cardNumber = document.getElementById("card-number").value.trim();
    const cardName = document.getElementById("card-name").value.trim();
    const expiryDate = document.getElementById("expiry-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Swal.fire({
        icon: 'warning',
        title: '💳',
        text: 'Por favor, Completa todos los datos de tarjeta',
        timer: 1500,
        showConfirmButton: false
      });
      return null;
    }

    return { method, cardNumber, cardName, expiryDate, cvv };
  }

  if (method === "bank-transfer") {
    const accountHolder = document.getElementById("account-holder").value.trim();

    if (!accountHolder) {
      Swal.fire({
        icon: 'warning',
        title: '👤',
        text: "Ingresa el titular de la cuenta",
        timer: 1500,
        showConfirmButton: false
      });
      return null;
    }

    return { method, accountHolder };
  }

  return { method };
}
