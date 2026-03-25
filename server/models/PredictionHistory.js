const mongoose = require("mongoose");
const { predictionHistorySchema } = require("../migrations/001_initial_schema");

module.exports =
  mongoose.models.PredictionHistory ||
  mongoose.model("PredictionHistory", predictionHistorySchema);
