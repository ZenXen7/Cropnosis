const express = require("express");
const multer = require("multer");
const router = express.Router();
const geminiService = require("../services/geminiService");
const predictionDbService = require("../services/predictionDbService");
const {
  resolvePredictionUserId,
  PredictionUserError,
} = require("../utils/predictionUser");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Smart fake prediction — even scan numbers = healthy, odd = diseases
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

router.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imageBuffer = req.file.buffer;

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: "Image too large. Maximum size is 10MB." });
    }

    const isValidImage =
      (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) ||
      (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) ||
      (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49);

    if (!isValidImage) {
      return res.status(400).json({
        error: "Invalid image format. Please upload JPEG, PNG, or GIF.",
      });
    }

    console.log(
      `Processing image: ${req.file.originalname}, Size: ${imageBuffer.length} bytes`
    );

    let userId;
    try {
      userId = await resolvePredictionUserId(req.body?.userId);
    } catch (e) {
      if (e instanceof PredictionUserError) {
        return res.status(500).json({
          success: false,
          error: e.message,
        });
      }
      throw e;
    }

    const totalScans = await predictionDbService.getTotalScans();
    const result = smartFakePrediction(
      imageBuffer,
      req.file.originalname,
      totalScans
    );

    console.log("🤖 Generating AI analysis with Gemini...");
    const aiAnalysis = await geminiService.generateCropAnalysis(result);

    const saved = await predictionDbService.savePrediction({
      userId,
      imageBuffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      predictions: result.predictions,
      aiAnalysis,
      processingTime: result.processingTime,
    });

    res.json({
      success: true,
      ...result,
      aiAnalysis: aiAnalysis,
      predictionId: saved.id,
      message:
        "Prediction completed successfully with AI analysis (using mock data)",
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      error: "Prediction failed",
      details: error.message,
      success: false,
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "crop-disease-prediction",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.get("/ai-tip", async (req, res) => {
  try {
    console.log("🤖 Generating AI tip...");
    const tip = await geminiService.generateQuickTip();

    res.json({
      success: true,
      tip: tip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI tip error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate AI tip",
      tip: "Regular monitoring and early detection are key to healthy crops! 🌱",
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    const resolvedUserId = await resolvePredictionUserId(req.query?.userId);
    const predictions = await predictionDbService.getAllPredictions(resolvedUserId);
    const statistics = await predictionDbService.getStatistics(resolvedUserId);

    res.json({
      success: true,
      predictions: predictions,
      statistics: statistics,
      total: predictions.length,
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
});

router.get("/history/stats", async (req, res) => {
  try {
    const resolvedUserId = await resolvePredictionUserId(req.query?.userId);
    const statistics = await predictionDbService.getStatistics(resolvedUserId);

    res.json({
      success: true,
      statistics: statistics,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

router.get("/history/:id", async (req, res) => {
  try {
    const resolvedUserId = await resolvePredictionUserId(req.query?.userId);
    const prediction = await predictionDbService.getPredictionById(
      req.params.id,
      resolvedUserId
    );

    if (prediction) {
      res.json({
        success: true,
        prediction: prediction,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Prediction not found",
      });
    }
  } catch (error) {
    console.error("Prediction detail error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch prediction details",
    });
  }
});

module.exports = router;
