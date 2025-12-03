// front/js/apiClient.js

const BASE_URL = 'http://localhost:3000/api';

const ApiClient = {
  // ==========================
  // Helpers
  // ==========================

  async _handleResponse(response) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (response.ok) {
      return { ok: true, data };
    } else {
      return {
        ok: false,
        status: response.status,
        message: (data && (data.message || data.error)) || 'Error desconocido del servidor'
      };
    }
  },

  _authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    if (!token) return { ...extra };
    return {
      ...extra,
      'Authorization': `Bearer ${token}`
    };
  },

  // ==========================
  // AUTH
  // ==========================

  async signup(userData) {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error de conexión con el servidor.' };
    }
  },

async login(credentials) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this._handleResponse(response);
  } catch (error) {
    return { ok: false, message: 'Error de conexión con el servidor.' };
  }
},

  async logout() {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error de conexión al cerrar sesión.' };
    }
  },

async getCaptcha() {
  try {
    console.log('🔍 Solicitando CAPTCHA al backend...');
    const response = await fetch(`${BASE_URL}/auth/getCaptcha`);
    
    console.log('🔍 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Error en respuesta de CAPTCHA:', response.status);
      throw new Error('Failed to fetch CAPTCHA');
    }
    
    const data = await response.json();
    console.log('✅ CAPTCHA recibido - ID:', data.captchaId?.substring(0, 10) + '...');
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching CAPTCHA:', error);
    return { 
      ok: false, 
      message: 'No se pudo cargar el CAPTCHA',
      error: error.message 
    };
  }
},

  async forgotPassword(email) {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al solicitar recuperación de contraseña.' };
    }
  },

  async resetPassword({ token, password }) {
    try {
      const response = await fetch(`${BASE_URL}/auth/resetPassword?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al restablecer contraseña.' };
    }
  },

  // ==========================
  // PRODUCTS
  // ==========================

  // Si params viene vacío → GET /api/products (todos)
  // Si trae filtros → GET /api/products/query?... (usa filterProductsBy)
  // En la sección PRODUCTS de apiClient.js
  // En la sección PRODUCTS de apiClient.js
  // En la sección PRODUCTS de apiClient.js
async getAllProducts() {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    return this._handleResponse(response);
  } catch (error) {
    return { ok: false, message: 'Error al obtener productos.' };
  }
},
  async getProducts(params = {}) {
    const hasParams = Object.keys(params).length > 0;

    const url = hasParams
      ? `${BASE_URL}/products/query?${new URLSearchParams(params).toString()}`
      : `${BASE_URL}/products`;

    try {
      const response = await fetch(url);
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener productos.' };
    }
  },

  async getProductById(productId) {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`);
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener el producto.' };
    }
  },

  async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/products/categories`);
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener categorías.' };
    }
  },

  // ==========================
  // CART
  // ==========================

  async getCart() {
    try {
      const response = await fetch(`${BASE_URL}/cart`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener el carrito.' };
    }
  },

  // body esperado por el controller: { product_id, quantity }
  async addToCart({ product_id, quantity }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ product_id, quantity })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al agregar al carrito.' };
    }
  },

  // body esperado: { product_id, quantity }
  async updateCartItem({ product_id, quantity }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/update`, {
        method: 'PUT',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ product_id, quantity })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al actualizar el carrito.' };
    }
  },

  // controller espera req.body.product_id
  async removeFromCart(product_id) {
    try {
      const response = await fetch(`${BASE_URL}/cart/remove`, {
        method: 'DELETE',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ product_id })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al eliminar del carrito.' };
    }
  },

  async clearCart() {
    try {
      const response = await fetch(`${BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al vaciar el carrito.' };
    }
  },

  // body esperado: { state, shippingMethod }
  async calculateTotals({ state, shippingMethod }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/calculate`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ state, shippingMethod })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al calcular totales.' };
    }
  },

  // body esperado: { shipping: {...}, payment: {...} }
  async checkout(payload) {
    try {
      const response = await fetch(`${BASE_URL}/cart/checkout`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al procesar la compra.' };
    }
  },

  // ==========================
  // WISHLIST
  // ==========================

  async getWishlist() {
    try {
      const response = await fetch(`${BASE_URL}/wishlist`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener la lista de deseos.' };
    }
  },

  async addToWishlist(productId) {
    try {
      const response = await fetch(`${BASE_URL}/wishlist`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ productId })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al agregar a la lista de deseos.' };
    }
  },

  async removeFromWishlist(productId) {
    try {
      const response = await fetch(`${BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al eliminar de la lista de deseos.' };
    }
  },

  // ==========================
  // COUPONS
  // ==========================

  // controller.applyCoupon
  async applyCoupon(code) {
    try {
      const response = await fetch(`${BASE_URL}/coupons/apply`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ code })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al aplicar el cupón.' };
    }
  },

  async removeCoupon(code) {
    try {
      const response = await fetch(`${BASE_URL}/coupons/remove`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ code })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al eliminar el cupón.' };
    }
  },

  // ==========================
  // CONTACT
  // ==========================

  async sendContact({ name, email, message }) {
    try {
      const response = await fetch(`${BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al enviar el mensaje.' };
    }
  },

  // ==========================
  // SUBSCRIPTION
  // ==========================

// front/js/apiClient.js

async subscribe(email) {
  try {
    const response = await fetch(`${BASE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return this._handleResponse(response);
  } catch (error) {
    return { ok: false, message: 'Error al suscribirse.' };
  }
},


  // ==========================
  // ORDERS
  // ==========================

  // Usa orderController.createOrder
  async createOrder(orderData) {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: this._authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(orderData)
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al crear la orden.' };
    }
  },

  // Solo útiles si tienes endpoints GET /orders y /orders/:id
  async getOrders() {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener órdenes.' };
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener la orden.' };
    }
  },

  // ==========================
  // ADMIN
  // ==========================

  async getTotalSales() {
    try {
      const response = await fetch(`${BASE_URL}/admin/total-sales`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener ventas totales.' };
    }
  },

  async getSalesByCategory() {
    try {
      const response = await fetch(`${BASE_URL}/admin/sales-by-category`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener ventas por categoría.' };
    }
  },

  async getInventoryReport() {
    try {
      const response = await fetch(`${BASE_URL}/admin/inventory-report`, {
        method: 'GET',
        headers: this._authHeaders()
      });
      return this._handleResponse(response);
    } catch (error) {
      return { ok: false, message: 'Error al obtener inventario.' };
    }
  }
};
