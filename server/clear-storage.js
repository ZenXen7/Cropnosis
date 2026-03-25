#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const PredictionHistory = require("./models/PredictionHistory");
const Image = require("./models/Image");

async function main() {
  console.log("🧹 Clearing prediction data in MongoDB...");

  await mongoose.connect(process.env.MONGODB_URI);

  const phCount = await PredictionHistory.countDocuments();
  const imgCount = await Image.countDocuments();
  console.log(`📊 Current: ${phCount} prediction_history, ${imgCount} images`);

  await PredictionHistory.deleteMany({});
  await Image.deleteMany({});

  console.log("✅ Cleared prediction_history and images collections");
  await mongoose.disconnect();
  console.log("🎯 Next scan will start from count 0 for even/odd demo logic.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
