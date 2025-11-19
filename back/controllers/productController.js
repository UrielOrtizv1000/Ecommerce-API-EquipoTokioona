/*
here u are going to administrate the products filters
getAll, getById, getByCategory, getOnSale, 
create (admin), update (admin), delete (admin)
*/
// src/controllers/productController.js
const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image_url,
      is_on_sale,
      category_id
    } = req.body;

    const newProductId = await Product.create({
      name,
      description,
      price,
      stock,
      image_url,
      is_on_sale,
      category_id
    });

    return res.status(201).json({
      ok: true,
      message: 'Product created successfully',
      product_id: newProductId
    });

  } catch (err) {
    console.error('Error creating product:', err);

    return res.status(500).json({
      ok: false,
      message: 'Internal server error'
    });
  }
};
