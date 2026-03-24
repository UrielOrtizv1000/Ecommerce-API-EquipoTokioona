const wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlistItems = await wishlist.getAllProducts(userId);

    return res.status(200).json({
      message: "Products retrieved successfully.",
      products: wishlistItems,
    });
  } catch (error) {
    console.error("Error retrieving wishlist:", error);
    return res.status(500).json({ error: "Internal server error while retrieving wishlist." });
  }
};

const addToWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    await wishlist.insertProduct(userId, productId);
    return res.status(201).json({ message: "Product added to wishlist successfully." });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while adding the product to the wishlist." });
  }
};

const deleteFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    await wishlist.deleteProduct(userId, productId);
    return res.status(200).json({ message: "Product removed from wishlist successfully." });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while removing the product from the wishlist." });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  deleteFromWishlist,
};
