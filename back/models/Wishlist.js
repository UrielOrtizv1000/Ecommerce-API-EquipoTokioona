const pool = require('../db/conexion');

async function getAllProducts(userId) {
    const [rows] =  await pool.query('SELECT * FROM wishlists WHERE user_id = ?', [userId]);
    return rows;
}

async function insertProduct(userId, productId) {
    const [result] = await pool.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', 
        [userId, productId]
    );
    return result.insertId;
}

async function deleteProduct(userId, productId) {
    const [result] = await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', 
        [userId, productId]);
    return result.affectedRows;
}

module.exports = {
    getAllProducts,
    insertProduct,
    deleteProduct
};