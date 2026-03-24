const BASE_URL = `${window.APP_CONFIG.BACK_URL}/api`;

const ApiClient = {
  async _handleResponse(response) {
    let data = null;

    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }

    if (response.ok) {
      return { ok: true, data };
    }

    return {
      ok: false,
      status: response.status,
      message: (data && (data.message || data.error)) || "Unknown server error.",
    };
  },

  _authHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      return { ...extraHeaders };
    }

    return {
      ...extraHeaders,
      Authorization: `Bearer ${token}`,
    };
  },

  async signup(userData) {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to reach the server." };
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to reach the server." };
    }
  },

  async logout() {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to close the session." };
    }
  },

  async getCaptcha() {
    try {
      const response = await fetch(`${BASE_URL}/auth/captcha`);
      if (!response.ok) {
        throw new Error("Failed to fetch CAPTCHA.");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      return {
        ok: false,
        message: "Unable to load the CAPTCHA.",
        error: error.message,
      };
    }
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to request password recovery." };
    }
  },

  async resetPassword({ token, password }) {
    try {
      const response = await fetch(
        `${BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to reset the password." };
    }
  },

  async getAllProducts() {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load products." };
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
    } catch (_error) {
      return { ok: false, message: "Unable to load products." };
    }
  },

  async getProductById(productId) {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`);
      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load the product." };
    }
  },

  async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/products/categories`);
      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load categories." };
    }
  },

  async getCart() {
    try {
      const response = await fetch(`${BASE_URL}/cart`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load the cart." };
    }
  },

  async addToCart({ product_id, quantity }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ product_id, quantity }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to add the product to the cart." };
    }
  },

  async updateCartItem({ product_id, quantity }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/update`, {
        method: "PUT",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ product_id, quantity }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to update the cart." };
    }
  },

  async removeFromCart(product_id) {
    try {
      const response = await fetch(`${BASE_URL}/cart/remove`, {
        method: "DELETE",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ product_id }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to remove the product from the cart." };
    }
  },

  async clearCart() {
    try {
      const response = await fetch(`${BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to clear the cart." };
    }
  },

  async calculateTotals({ state, shippingMethod }) {
    try {
      const response = await fetch(`${BASE_URL}/cart/calculate`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ state, shippingMethod }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to calculate totals." };
    }
  },

  async checkout(payload) {
    try {
      const response = await fetch(`${BASE_URL}/cart/checkout`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to process the purchase." };
    }
  },

  async getWishlist() {
    try {
      const response = await fetch(`${BASE_URL}/wishlist`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load the wishlist." };
    }
  },

  async addToWishlist(productId) {
    try {
      const response = await fetch(`${BASE_URL}/wishlist/add`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ productId }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to add the product to the wishlist." };
    }
  },

  async removeFromWishlist(productId) {
    try {
      const response = await fetch(`${BASE_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to remove the product from the wishlist." };
    }
  },

  async applyCoupon(code) {
    try {
      const response = await fetch(`${BASE_URL}/coupons/apply`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ code }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to apply the coupon." };
    }
  },

  async removeCoupon(code) {
    try {
      const response = await fetch(`${BASE_URL}/coupons/remove`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ code }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to remove the coupon." };
    }
  },

  async sendContact({ name, email, message }) {
    try {
      const response = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to send the message." };
    }
  },

  async subscribe(email) {
    try {
      const response = await fetch(`${BASE_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to subscribe." };
    }
  },

  async createOrder(orderData) {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(orderData),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to create the order." };
    }
  },

  async getOrders() {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load orders." };
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load the order." };
    }
  },

  async getTotalSales() {
    try {
      const response = await fetch(`${BASE_URL}/admin/total-sales`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load total sales." };
    }
  },

  async getSalesByCategory() {
    try {
      const response = await fetch(`${BASE_URL}/admin/sales/category`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load sales by category." };
    }
  },

  async createAddress(addressData) {
    try {
      const response = await fetch(`${BASE_URL}/address`, {
        method: "POST",
        headers: this._authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(addressData),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to save the address." };
    }
  },

  async getInventoryReport() {
    try {
      const response = await fetch(`${BASE_URL}/admin/inventory-report`, {
        method: "GET",
        headers: this._authHeaders(),
      });

      return this._handleResponse(response);
    } catch (_error) {
      return { ok: false, message: "Unable to load inventory." };
    }
  },
};
