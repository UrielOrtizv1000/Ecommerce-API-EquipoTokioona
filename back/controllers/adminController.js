/*this is for the admin things like
graphics: sales per category
total sales: SUM(total) every order
inventary: SELECT * FROM products GROUP BY category (for example)
*/
// src/controllers/adminController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getTotalSales = async (req, res) => {
  try {
    const totalSales = await Order.getTotalSales();

    res.status(200).json({
      ok: true,
      total_sales: Number(totalSales)
    });

  } catch (error) {
    console.error("Error fetching total sales:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
};

/**
 * Returns sales grouped by product category.
 */
exports.getSalesByCategory = async (req, res) => {
  try {
    const data = await Order.getSalesByCategory();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching category sales:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sales by category"
    });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const rows = await Product.getInventoryByCategory();

    // Transform into grouped structure (Option A)
    const result = [];

    rows.forEach(row => {
      let category = result.find(c => c.category === row.category_name);

      if (!category) {
        category = { 
          category: row.category_name, 
          products: [] 
        };
        result.push(category);
      }

      category.products.push({
        product_id: row.product_id,
        name: row.name,
        stock: row.stock
      });
    });

    return res.json(result);

  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory report"
    });
  }
};



