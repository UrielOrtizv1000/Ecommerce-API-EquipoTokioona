/*this is for the admin things like
graphics: sales per category
total sales: SUM(total) every order
inventary: SELECT * FROM products GROUP BY category (for example)
*/
// src/controllers/adminController.js
const Order = require("../models/Order");

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
