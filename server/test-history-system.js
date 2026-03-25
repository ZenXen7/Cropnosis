#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const predictionDbService = require("./services/predictionDbService");
const { resolvePredictionUserId } = require("./utils/predictionUser");

function jpegStub() {
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    Buffer.alloc(64),
  ]);
}

async function testHistorySystem() {
  console.log("🧪 Testing History System (MongoDB)");
  console.log("====================================");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const userId = await resolvePredictionUserId();

    console.log("1. Testing get all predictions...");
    const allPredictions = await predictionDbService.getAllPredictions();
    console.log(`✅ Found ${allPredictions.length} predictions`);

    console.log("\n2. Testing statistics...");
    const stats = await predictionDbService.getStatistics();
    console.log("✅ Statistics:", stats);

    console.log("\n3. Testing add new prediction...");
    const newPrediction = await predictionDbService.savePrediction({
      userId,
      imageBuffer: jpegStub(),
      mimetype: "image/jpeg",
      originalname: "test-history.jpg",
      predictions: [
        { name: "Healthy", confidence: 0.95 },
        { name: "Leaf Spot", confidence: 0.03 },
        { name: "Powdery Mildew", confidence: 0.02 },
      ],
      aiAnalysis: {
        disease: "Healthy",
        confidence: 0.95,
        severity: "none",
        description: "Test prediction - crop is healthy",
        risk_level: "low",
        estimated_loss: "0% - No risk detected",
      },
      processingTime: 1100,
    });
    console.log("✅ New prediction saved with ID:", newPrediction.id);

    console.log("\n4. Testing updated statistics...");
    const updatedStats = await predictionDbService.getStatistics();
    console.log("✅ Updated statistics:", updatedStats);

    console.log("\n5. Testing get prediction by ID...");
    const foundPrediction = await predictionDbService.getPredictionById(
      newPrediction.id
    );
    console.log("✅ Found prediction:", foundPrediction ? "Yes" : "No");

    console.log("\n🎉 History system test finished.");
    console.log(`📊 Total predictions: ${updatedStats.total}`);
    console.log(`🌱 Healthy: ${updatedStats.healthy}`);
    console.log(`⚠️  Diseased: ${updatedStats.diseased}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ History system test failed:", error.message);
    process.exit(1);
  }
}

testHistorySystem();
