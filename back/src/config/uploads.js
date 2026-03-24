const fs = require("fs");
const path = require("path");

const multer = require("multer");

const { IMAGES_DIR } = require("./paths");

fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, IMAGES_DIR);
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

module.exports = multer({ storage });
