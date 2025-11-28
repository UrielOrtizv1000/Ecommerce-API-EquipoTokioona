// -----------------------------------------------------
// POST create product (admin only)
// -----------------------------------------------------
async function createProduct(productData, token) {
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