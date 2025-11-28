const express = require("express");
const router = express.Router();
const {subscribe} = require("../controllers/subscriptionController");

router.post("/", subscribe);

module.exports = router;