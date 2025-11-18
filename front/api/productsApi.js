// Cambia esto a true cuando exista backend real
const USE_BACKEND = false;

const BACKEND_URL = "http://localhost:3000"; // futuro backend

async function getProducts() {
  if (!USE_BACKEND) {
    return mockProducts; // esto viene de productsMock.js
  }

  const res = await fetch(`${BACKEND_URL}/productos`);
  const data = await res.json();
  return data;
}

// Puedes agregar más funciones cuando haya backend
/*
async function getProduct(id) { ... }
async function createProduct(producto) { ... }
async function updateStock(id, cantidad) { ... }
*/
