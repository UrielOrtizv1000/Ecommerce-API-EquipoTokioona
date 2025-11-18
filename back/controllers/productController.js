/*
here u are going to administrate the products filters
getAll, getById, getByCategory, getOnSale, 
create (admin), update (admin), delete (admin)
*/
const Product = require("../models/Product");
const Category = require("../models/Category");

// -- GET PRODUCT CONTROLLER --
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Product query error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await Category.getCategories();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Category query error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const filterProductsBy = async (req, res) => {
  try {
    // Creating query string

    // Check if there are no query parameters
    if (Object.keys(req.query).length === 0)
      return res.status(400).json({ message: "Filters were not applied" });

    // Setup variables for generating a query string
    let numParams = 0;
    let queryControl = "SELECT * FROM products WHERE ";
    const queryValues = [];

    for (const [key, value] of Object.entries(req.query)) {
      // If current parameter has empty value
      if (!value)
        continue;

      // If there are more than one parameters, append 'AND' into the query string
      if (numParams > 0)
        queryControl += "AND ";

      // Switch for every valid parameter value
      switch (key) {
        case "category_id":
          queryControl += "category_id = ? ";
          break;
        case "min_price":
          queryControl += "price >= ? ";
          break;
        case "max_price":
          queryControl += "price <= ? ";
          break;
        case "is_on_sale":
          queryControl += "is_on_sale = ? ";
          break;
        default:
          // If a wrong parameter was requested, return a 404 code
          return res.status(404).json({ message: "Non-existent product filter was requested"});
      }

      // Add current parameter value to result array
      queryValues.push(value);
      
      numParams++;
    }

    // Execute query
    const list = await Product.getProductsByFilter(queryControl, queryValues);
    res.status(200).json({ list });
  } catch (error) {
    console.log("Product filtering error");
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getProductById, getCategories, filterProductsBy }