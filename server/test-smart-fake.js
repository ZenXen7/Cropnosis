#!/usr/bin/env node

// Test the smart fake prediction function
function smartFakePrediction(imageBuffer, filename) {
  // Simulate processing time
  const processingTime = Math.random() * 1000 + 500; // 500-1500ms
  
  // Smart detection based on filename
  const lowerFilename = filename.toLowerCase();
  let predictedDisease = "Healthy";
  let confidence = 0.85;
  
  // Check filename for hints
  if (lowerFilename.includes('healthy') || lowerFilename.includes('good') || lowerFilename.includes('normal')) {
    predictedDisease = "Healthy";
    confidence = 0.92;
  } else if (lowerFilename.includes('spot') || lowerFilename.includes('leaf') || lowerFilename.includes('brown')) {
    predictedDisease = "Leaf Spot";
    confidence = 0.78;
  } else if (lowerFilename.includes('mildew') || lowerFilename.includes('white') || lowerFilename.includes('powder')) {
    predictedDisease = "Powdery Mildew";
    confidence = 0.85;
  } else if (lowerFilename.includes('fungi') || lowerFilename.includes('fungus') || lowerFilename.includes('mold')) {
    predictedDisease = "Fungal Infection";
    confidence = 0.82;
  } else if (lowerFilename.includes('disease') || lowerFilename.includes('sick') || lowerFilename.includes('bad')) {
    // Random disease for generic "disease" files
    const diseases = ["Leaf Spot", "Powdery Mildew", "Fungal Infection"];
    predictedDisease = diseases[Math.floor(Math.random() * diseases.length)];
    confidence = 0.75 + Math.random() * 0.15;
  } else {
    // Default to healthy for unknown files
    predictedDisease = "Healthy";
    confidence = 0.88;
  }
  
  // Create prediction results
  const predictions = [
    { name: predictedDisease, confidence: confidence },
    { name: "Healthy", confidence: (1 - confidence) * 0.7 },
    { name: predictedDisease === "Leaf Spot" ? "Powdery Mildew" : "Leaf Spot", confidence: (1 - confidence) * 0.3 }
  ];
  
  // Ensure confidences sum to 1
  const total = predictions.reduce((sum, d) => sum + d.confidence, 0);
  predictions.forEach(d => d.confidence = d.confidence / total);
  
  console.log(`🎭 Smart fake prediction: ${predictedDisease} (${(confidence * 100).toFixed(1)}%) based on filename: ${filename}`);
  
  return {
    predictions: predictions,
    processingTime: Math.round(processingTime),
    imageSize: imageBuffer.length,
    timestamp: new Date().toISOString()
  };
}

// Test different filenames
const testFilenames = [
  'healthy_lettuce.jpg',
  'leaf_spot_demo.png',
  'powdery_mildew_crop.jpg',
  'fungi_infection.jpg',
  'disease_plant.jpg',
  'random_image.jpg'
];

console.log('🧪 Testing Smart Fake Prediction System');
console.log('=====================================');

testFilenames.forEach(filename => {
  console.log(`\n📸 Testing: ${filename}`);
  const result = smartFakePrediction(Buffer.from('fake image data'), filename);
  console.log(`✅ Result: ${result.predictions[0].name} (${(result.predictions[0].confidence * 100).toFixed(1)}%)`);
});

console.log('\n🎉 Smart fake prediction system is working!');
console.log('💡 Just name your images with keywords to control the results!');
