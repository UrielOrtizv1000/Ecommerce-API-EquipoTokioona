const Address = require("../models/Address");

exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    // VALIDAR CAMPOS QUE LLEGAN DEL FRONTEND
    if (
      !data.recipientName ||
      !data.addressLine1 ||
      !data.city ||
      !data.postalCode ||
      !data.country ||
      !data.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const addressId = await Address.createAddress(userId, {
      recipientName: data.recipientName,
      addressLine1: data.addressLine1,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone
    });

    res.json({
      success: true,
      message: "Address saved successfully",
      addressId
    });

  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
