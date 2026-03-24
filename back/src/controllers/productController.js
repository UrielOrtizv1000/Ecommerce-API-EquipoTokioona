const pool = require("../config/database");
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Product query error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

exports.getCategories = async (_req, res) => {
  try {
    const categories = await Category.getCategories();
    return res.status(200).json({
      ok: true,
      categories,
    });
  } catch (error) {
    console.error("Category query error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

exports.filterProductsBy = async (req, res) => {
  try {
    if (Object.keys(req.query).length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Filters were not applied.",
      });
    }

    let query = "SELECT * FROM products WHERE ";
    const queryValues = [];
    let filtersCount = 0;

    for (const [key, value] of Object.entries(req.query)) {
      if (!value) {
        continue;
      }

      if (filtersCount > 0) {
        query += "AND ";
      }

      switch (key) {
        case "category_id":
          query += "p.category_id = ? ";
          break;
        case "min_price":
          query += `
            CASE
              WHEN p.is_on_sale = 1 AND p.discount > 0
              THEN ROUND(p.price - (p.price * p.discount / 100), 2)
              ELSE p.price
            END >= ? `;
          break;
        case "max_price":
          query += `
            CASE
              WHEN p.is_on_sale = 1 AND p.discount > 0
              THEN ROUND(p.price - (p.price * p.discount / 100), 2)
              ELSE p.price
            END <= ? `;
          break;
        case "is_on_sale":
          query += "p.is_on_sale = ? ";
          break;
        default:
          return res.status(404).json({
            ok: false,
            message: "Requested product filter does not exist.",
          });
      }

      queryValues.push(value);
      filtersCount += 1;
    }

    const list = await Product.getProductsByFilter(query, queryValues);

    return res.status(200).json({
      ok: true,
      list,
    });
  } catch (error) {
    console.error("Product filtering error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, is_on_sale, category_id, tags } = req.body;

    let image_url = "https://placehold.co/400";
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      image_url = `${baseUrl}/images/${req.file.filename}`;
    }

    const newProductId = await Product.create({
      name,
      description,
      price,
      stock,
      image_url,
      is_on_sale: is_on_sale || 0,
      category_id,
      tags: tags || "[]",
    });

    return res.status(201).json({
      ok: true,
      message: "Product created.",
      product_id: newProductId,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, is_on_sale, category_id, tags } = req.body;

    const existingProduct = await Product.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ ok: false, message: "Product not found." });
    }

    let image_url = existingProduct.image_url;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      image_url = `${baseUrl}/images/${req.file.filename}`;
    }

    const updatedRows = await Product.update(id, {
      name,
      description,
      price,
      stock,
      image_url,
      is_on_sale,
      category_id,
      tags: tags || "[]",
    });

    if (!updatedRows) {
      return res.status(400).json({ ok: false, message: "Update failed." });
    }

    return res.status(200).json({ ok: true, message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found.",
      });
    }

    const deletedRows = await Product.delete(id);
    if (!deletedRows) {
      return res.status(400).json({
        ok: false,
        message: "Product deletion failed.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Product deleted successfully.",
      product_id: id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

exports.getAllProducts = async (_req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.is_on_sale,
        p.category_id,
        p.tags,
        p.discount,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id DESC
    `);

    return res.status(200).json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("Error getting all products:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};
