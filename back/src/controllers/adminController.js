const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getTotalSales = async (_req, res) => {
  try {
    const totalSales = await Order.getTotalSales();

    return res.status(200).json({
      ok: true,
      total_sales: Number(totalSales || 0),
    });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

exports.getSalesByCategory = async (_req, res) => {
  try {
    const data = await Order.getSalesByCategory();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching category sales:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sales by category.",
    });
  }
};

exports.getInventoryReport = async (_req, res) => {
  try {
    const rows = await Product.getInventoryByCategory();
    const groupedInventory = [];

    rows.forEach((row) => {
      let category = groupedInventory.find((entry) => entry.category === row.category_name);

      if (!category) {
        category = {
          category: row.category_name,
          products: [],
        };
        groupedInventory.push(category);
      }

      category.products.push({
        product_id: row.product_id,
        name: row.name,
        stock: row.stock,
      });
    });

    return res.json(groupedInventory);
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory report.",
    });
  }
};

exports.getDashboardStats = async (_req, res) => {
  try {
    const [totalSales, activeProducts, pendingOrders, totalUsers] = await Promise.all([
      Order.getTotalSales(),
      Product.countActive(),
      Order.countPending(),
      User.countAll(),
    ]);

    return res.status(200).json({
      ok: true,
      stats: {
        sales: Number(totalSales || 0),
        products: activeProducts,
        orders: pendingOrders,
        users: totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
};

exports.getSalesPageData = async (_req, res) => {
  try {
    const [daily, history] = await Promise.all([Order.getDailyStats(), Order.getRecentOrders()]);

    return res.status(200).json({
      ok: true,
      daily: {
        total: daily.total || 0,
        count: daily.count || 0,
      },
      history,
    });
  } catch (error) {
    console.error("Error fetching sales page data:", error);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};

exports.getInventoryData = async (_req, res) => {
  try {
    const products = await Product.getInventoryReport();
    const stats = {
      outOfStock: 0,
      byCategory: {},
    };

    products.forEach((product) => {
      if (product.stock <= 0) {
        stats.outOfStock += 1;
      }

      const category = product.category_name || "Uncategorized";
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = 0;
      }

      stats.byCategory[category] += 1;
    });

    return res.status(200).json({
      ok: true,
      stats,
      products,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};
