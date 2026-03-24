const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const TEMP_DIR = path.join(ROOT_DIR, "tmp");

module.exports = {
  ROOT_DIR,
  PUBLIC_DIR,
  IMAGES_DIR,
  TEMP_DIR,
};
