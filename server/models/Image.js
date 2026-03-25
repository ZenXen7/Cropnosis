const mongoose = require("mongoose");
const { imageSchema } = require("../migrations/001_initial_schema");

module.exports = mongoose.models.Image || mongoose.model("Image", imageSchema);
