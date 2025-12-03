const pool = require("../db/conexion");

const Address = {
    async createAddress(userId, data) {
        const sql = `
            INSERT INTO addresses 
                (user_id, recipient_name, address_line_1, city, postal_code, country, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            userId,
            data.recipientName,
            data.addressLine1,
            data.city,
            data.postalCode,
            data.country,
            data.phone
        ]);

        return result.insertId; // Return ID of the new address
    },

    async getAddressesByUser(userId) {
        const [rows] = await pool.query(
            "SELECT * FROM addresses WHERE user_id = ?",
            [userId]
        );
        return rows;
    }
};

module.exports = Address;
