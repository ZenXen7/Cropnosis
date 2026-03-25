#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const predictionDbService = require("./services/predictionDbService");
const { resolvePredictionUserId } = require("./utils/predictionUser");
const PredictionHistory = require("./models/PredictionHistory");
const Image = require("./models/Image");

function smartFakePrediction(imageBuffer, filename, totalScans) {
  const processingTime = Math.random() * 1000 + 500;
  const scanNumber = totalScans + 1;

  let predictedDisease = "Healthy";
  let confidence = 0.85;

  if (scanNumber % 2 === 0) {
    predictedDisease = "Healthy";
    confidence = 0.88 + Math.random() * 0.1;
  } else {
    const diseases = ["Leaf Spot", "Powdery Mildew", "Fungal Infection"];
    predictedDisease = diseases[Math.floor(Math.random() * diseases.length)];
    confidence = 0.75 + Math.random() * 0.15;
  }

  const predictions = [
    { name: predictedDisease, confidence: confidence },
    { name: "Healthy", confidence: (1 - confidence) * 0.7 },
    {
      name:
        predictedDisease === "Leaf Spot" ? "Powdery Mildew" : "Leaf Spot",
      confidence: (1 - confidence) * 0.3,
    },
  ];

  const total = predictions.reduce((sum, d) => sum + d.confidence, 0);
  predictions.forEach((d) => (d.confidence = d.confidence / total));

  console.log(
    `🎭 Smart fake prediction: ${predictedDisease} (${(confidence * 100).toFixed(1)}%) - Scan #${scanNumber} (${scanNumber % 2 === 0 ? "EVEN = Healthy" : "ODD = Disease"})`
  );

  return {
    predictions: predictions,
    processingTime: Math.round(processingTime),
    imageSize: imageBuffer.length,
    timestamp: new Date().toISOString(),
  };
}

const mockAiAnalysis = {
  disease: "Healthy",
  confidence: 0.9,
  severity: "none",
  description: "Test run",
  risk_level: "low",
  estimated_loss: "0%",
};

function jpegStub() {
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    Buffer.alloc(64),
  ]);
}

async function main() {
  console.log("🧪 Testing Even/Odd Scan Number System (MongoDB)");
  console.log("================================================");
  await mongoose.connect(process.env.MONGODB_URI);
  const userId = await resolvePredictionUserId();

  await PredictionHistory.deleteMany({});
  await Image.deleteMany({});

  for (let i = 1; i <= 10; i++) {
    console.log(`\n📸 Scan #${i}:`);
    const totalScans = await predictionDbService.getTotalScans();
    const result = smartFakePrediction(jpegStub(), `scan_${i}.jpg`, totalScans);
    console.log(
      `✅ Result: ${result.predictions[0].name} (${(result.predictions[0].confidence * 100).toFixed(1)}%)`
    );

    await predictionDbService.savePrediction({
      userId,
      imageBuffer: jpegStub(),
      mimetype: "image/jpeg",
      originalname: `scan_${i}.jpg`,
      predictions: result.predictions,
      aiAnalysis: mockAiAnalysis,
      processingTime: result.processingTime,
    });
  }

  await mongoose.disconnect();
  console.log("\n🎉 Even/Odd scan system completed (data in MongoDB).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
