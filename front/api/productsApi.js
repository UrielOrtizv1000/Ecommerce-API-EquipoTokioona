// Cambia esto a true cuando exista backend real
const USE_BACKEND = true;

const BACKEND_URL = "http://localhost:3000/api"; // futuro backend

async function getProducts() {
  if (!USE_BACKEND) {
    return mockProducts; // esto viene de productsMock.js
  }

  const res = await fetch(`${BACKEND_URL}/products`);
  const data = await res.json();
  return data;
}

// Puedes agregar más funciones cuando haya backend
/*
async function getProduct(id) { ... }
async function createProduct(producto) { ... }
async function updateStock(id, cantidad) { ... }
*/

// -----------------------------------------------------
// POST create product (admin only)
// -----------------------------------------------------
async function createProduct(productData, token) {
  if (!USE_BACKEND) return { ok: false, message: "Backend disabled" };

  const res = await fetch(`${BACKEND_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  return await res.json();
}