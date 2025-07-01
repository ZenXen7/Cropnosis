const express = require("express");
const path = require("path");
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const canvas = require("canvas");

// Global model cache
let model = null;
let modelLoadingPromise = null;

// Model loading with caching and error handling
const loadModel = async () => {
  if (model) return model;
  
  if (modelLoadingPromise) return modelLoadingPromise;
  
  modelLoadingPromise = (async () => {
    try {
      const modelPath = path.resolve(
        __dirname,
        "./cropnoses/cropnoses/model.json"
      );
      
      console.log("🔄 Loading ML model...");
      const startTime = Date.now();
      
      model = await tf.loadLayersModel(`file://${modelPath}`);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Model loaded successfully in ${loadTime}ms`);
      
      // Warm up the model with a dummy prediction to optimize first inference
      const dummyInput = tf.zeros([1, 224, 224, 3]);
      await model.predict(dummyInput).data();
      dummyInput.dispose();
      
      console.log("🔥 Model warmed up successfully");
      
      return model;
    } catch (error) {
      console.error("❌ Failed to load model:", error);
      model = null;
      modelLoadingPromise = null;
      throw error;
    }
  })();
  
  return modelLoadingPromise;
};

// Initialize model loading on server start
loadModel().catch(console.error);

// Optimized multer configuration with size limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Enhanced prediction endpoint with performance optimizations
router.post("/predict", upload.single("image"), async (req, res) => {
  let imageTensor = null;
  let resized = null;
  
  try {
    const startTime = Date.now();
    
    // Validate image upload
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    console.log(`📸 Processing image: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Ensure model is loaded
    const currentModel = await loadModel();
    if (!currentModel) {
      return res.status(503).json({ error: "Model not available" });
    }

    // Image preprocessing with memory management
    const imageBuffer = req.file.buffer;
    
    // Decode image with error handling
    try {
      imageTensor = tf.node.decodeImage(imageBuffer, 3); // RGB channels
    } catch (decodeError) {
      console.error("Image decode error:", decodeError);
      return res.status(400).json({ error: "Invalid image format" });
    }

    // Preprocess the image: resize and normalize
    resized = tf.image
      .resizeBilinear(imageTensor, [224, 224]) // Resize to model input size
      .div(255.0) // Normalize to [0, 1]
      .expandDims(0); // Add batch dimension

    // Performance monitoring
    const preprocessTime = Date.now() - startTime;
    console.log(`⚡ Preprocessing completed in ${preprocessTime}ms`);

    // Model inference
    const inferenceStart = Date.now();
    const prediction = currentModel.predict(resized);
    const result = await prediction.data(); // Use async data() for better performance
    
    const inferenceTime = Date.now() - inferenceStart;
    console.log(`🧠 Inference completed in ${inferenceTime}ms`);

    // Convert to array and add confidence scores
    const predictions = Array.from(result);
    const maxPrediction = Math.max(...predictions);
    const predictedIndex = predictions.indexOf(maxPrediction);
    
    // Class names mapping
    const classNames = ['Bacterial', 'Fungal', 'Healthy'];
    const predictedClass = classNames[predictedIndex] || 'Unknown';
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Total processing time: ${totalTime}ms`);

    // Enhanced response with performance metrics
    const response = {
      prediction: {
        class: predictedClass,
        confidence: parseFloat((maxPrediction * 100).toFixed(2)),
        all_predictions: predictions.map((pred, idx) => ({
          class: classNames[idx],
          confidence: parseFloat((pred * 100).toFixed(2))
        }))
      },
      performance: {
        total_time_ms: totalTime,
        preprocessing_time_ms: preprocessTime,
        inference_time_ms: inferenceTime
      },
      image_info: {
        original_size: req.file.size,
        filename: req.file.originalname
      }
    };

    // Clean up prediction tensor
    prediction.dispose();

    res.json(response);
    
  } catch (error) {
    console.error("Prediction error:", error);
    
    // Detailed error response
    const errorResponse = {
      error: "Prediction failed",
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(errorResponse);
  } finally {
    // Clean up tensors to prevent memory leaks
    if (imageTensor) imageTensor.dispose();
    if (resized) resized.dispose();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const modelStatus = model ? "loaded" : "not_loaded";
    
    res.json({
      status: "healthy",
      model_status: modelStatus,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Model info endpoint
router.get("/model-info", async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({ error: "Model not loaded" });
    }
    
    res.json({
      model_loaded: true,
      input_shape: model.inputs[0].shape,
      output_shape: model.outputs[0].shape,
      total_params: model.countParams(),
      class_names: ['Bacterial', 'Fungal', 'Healthy']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
