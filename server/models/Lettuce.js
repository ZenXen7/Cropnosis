const mongoose = require("mongoose");

const LettuceImageSchema = new mongoose.Schema({
  img: Buffer,
  contentType: String,
});

module.exports = mongoose.model("LettuceImage", LettuceImageSchema);
