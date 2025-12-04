const Product = require('../models/Product');
const Category = require("../models/Category");
const pool = require("../db/conexion"); 

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Request not found"
      });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Product query error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getCategories();
    res.status(200).json({
      ok: true,
      categories
    });
  } catch (error) {
    console.error("Category query error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

exports.filterProductsBy = async (req, res) => {
  try {
    if (Object.keys(req.query).length === 0)
      return res.status(400).json({
        ok: false,
        message: "Filters were not applied"
      });

    let numParams = 0;
    let queryControl = "SELECT * FROM products WHERE ";
    const queryValues = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (!value) continue;

      if (numParams > 0) queryControl += "AND ";

      switch (key) {
        case "category_id":
          queryControl += "p.category_id = ? ";
          break;
        case "min_price":
          // Usar precio final (con descuento)
          queryControl += `
            CASE 
              WHEN p.is_on_sale = 1 AND p.discount > 0 
              THEN ROUND(p.price - (p.price * p.discount / 100), 2)
              ELSE p.price 
            END >= ? `;
          break;
        case "max_price":
          // Usar precio final (con descuento)
          queryControl += `
            CASE 
              WHEN p.is_on_sale = 1 AND p.discount > 0 
              THEN ROUND(p.price - (p.price * p.discount / 100), 2)
              ELSE p.price 
            END <= ? `;
          break;
        case "is_on_sale":
          queryControl += "p.is_on_sale = ? ";
          break;
        default:
          return res.status(404).json({
            ok: false,
            message: "Non-existent product filter was requested"
          });
      }

      queryValues.push(value);
      numParams++;
    }

    const list = await Product.getProductsByFilter(queryControl, queryValues);
    res.status(200).json({
      ok: true,
      list
    });
  } catch (error) {
    console.log("Product filtering error");
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

exports.createProduct = async (req, res) => {
  try {
    // CORRECCIÓN 1: Agregamos 'tags' aquí
    const { name, description, price, stock, is_on_sale, category_id, tags } = req.body;
    
    let image_url = "https://placehold.co/400"; 
    
    if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
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
      tags: tags || "[]" 
    });

    res.status(201).json({ ok: true, message: 'Product created', product_id: newProductId });

  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // CORRECCIÓN 2: Agregamos 'tags' aquí también
    const { name, description, price, stock, is_on_sale, category_id, tags } = req.body;

    const existingProduct = await Product.getProductById(id);
    if (!existingProduct) {
        return res.status(404).json({ ok: false, message: "Product not found" });
    }

    let image_url = existingProduct.image_url;
    
    if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        image_url = `${baseUrl}/images/${req.file.filename}`;
    }

    const updated = await Product.update(id, {
      name,
      description,
      price,
      stock,
      image_url,
      is_on_sale,
      category_id,
      tags: tags || "[]"
    });

    if (updated === 0) return res.status(400).json({ ok: false, message: "Update failed" });

    res.status(200).json({ ok: true, message: "Product updated successfully" });

  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found"
      });
    }

    const deleted = await Product.delete(id);

    if (deleted === 0) {
      return res.status(400).json({
        ok: false,
        message: "Product deletion failed"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Product deleted successfully",
      product_id: id
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
};

// -- GET ALL PRODUCTS CONTROLLER --
exports.getAllProducts = async (req, res) => {
  try {
    // CORRECCIÓN 3: Quitamos 'WHERE p.stock > 0' para que el Admin vea todo
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
    
    res.status(200).json({
      ok: true,
      products
    });
  } catch (error) {
    console.error("Error getting all products:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
};