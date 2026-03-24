require("dotenv").config();

const cors = require("cors");
const express = require("express");

const { IMAGES_DIR } = require("./config/paths");
const { registerRoutes } = require("./routes");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images", express.static(IMAGES_DIR));

registerRoutes(app);

module.exports = app;
