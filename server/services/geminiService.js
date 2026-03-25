const https = require('https');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'demo-key';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    // Try different model names in order of preference
    this.modelNames = [
      'gemini-2.5-flash',  // Latest model
      'gemini-1.5-flash',  // Alternative model
      'gemini-1.5-pro',    // Fallback model
      'gemini-pro'         // Legacy model
    ];
    
    console.log(`🤖 Using Gemini REST API with models: ${this.modelNames.join(', ')}`);
  }

  async makeGeminiRequest(prompt, modelName) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/models/${modelName}:generateContent`;
      const data = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      });

      const options = {
        method: 'POST',
        headers: {
          'x-goog-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            
            if (res.statusCode === 200 && response.candidates && response.candidates[0]) {
              const text = response.candidates[0].content.parts[0].text;
              resolve(text);
            } else {
              reject(new Error(`API Error: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (parseError) {
            reject(new Error(`Parse Error: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request Error: ${error.message}`));
      });

      req.write(data);
      req.end();
    });
  }

  async tryWithDifferentModels(prompt) {
    for (const modelName of this.modelNames) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const text = await this.makeGeminiRequest(prompt, modelName);
        console.log(`✅ Success with model: ${modelName}`);
        return text;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All Gemini models failed');
  }

  async generateCropAnalysis(predictionData) {
    try {
      // Extract the highest confidence prediction
      const topPrediction = predictionData.predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );

      const prompt = `
You are an expert agricultural AI assistant. Based on the following crop disease prediction data, provide a comprehensive analysis:

Prediction Results:
- Disease: ${topPrediction.name}
- Confidence: ${(topPrediction.confidence * 100).toFixed(1)}%
- Processing Time: ${predictionData.processingTime}ms
- Image Size: ${predictionData.imageSize} bytes

Please provide a detailed analysis in the following JSON format:
{
  "disease": "${topPrediction.name}",
  "confidence": ${topPrediction.confidence},
  "severity": "low|moderate|high|critical",
  "description": "Brief description of the disease",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "causes": ["cause1", "cause2"],
  "treatment": {
    "immediate": "Immediate action to take",
    "long_term": "Long-term management strategy"
  },
  "prevention": ["prevention1", "prevention2", "prevention3"],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "risk_level": "low|moderate|high|critical",
  "estimated_loss": "percentage or description",
  "next_steps": "What the farmer should do next"
}

Make the analysis realistic and helpful for farmers. If the disease is "Healthy", provide general plant care advice.
`;

      const text = await this.tryWithDifferentModels(prompt);
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Failed to parse JSON, using fallback response');
      }

      // Fallback response if JSON parsing fails
      return this.generateFallbackAnalysis(topPrediction, predictionData);
      
    } catch (error) {
      console.error('Gemini AI Error:', error.message);
      // Return fallback analysis if Gemini fails
      const topPrediction = predictionData.predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );
      return this.generateFallbackAnalysis(topPrediction, predictionData);
    }
  }

  generateFallbackAnalysis(topPrediction, predictionData) {
    const isHealthy = topPrediction.name.toLowerCase() === 'healthy';
    
    if (isHealthy) {
      return {
        disease: "Healthy",
        confidence: topPrediction.confidence,
        severity: "none",
        description: "Your crop appears to be in good health with no visible signs of disease.",
        symptoms: ["No visible symptoms detected"],
        causes: ["N/A - Plant is healthy"],
        treatment: {
          immediate: "Continue current care practices",
          long_term: "Maintain regular monitoring and preventive care"
        },
        prevention: [
          "Continue proper watering schedule",
          "Maintain soil health",
          "Regular monitoring for early detection"
        ],
        recommendations: [
          "Keep up the excellent plant care!",
          "Continue regular monitoring",
          "Consider soil testing for optimal nutrition"
        ],
        risk_level: "low",
        estimated_loss: "0% - No risk detected",
        next_steps: "Continue current care practices and monitor regularly"
      };
    } else {
      return {
        disease: topPrediction.name,
        confidence: topPrediction.confidence,
        severity: topPrediction.confidence > 0.7 ? "high" : "moderate",
        description: `Your crop shows signs of ${topPrediction.name.toLowerCase()}. Early detection is key to effective treatment.`,
        symptoms: [
          "Visible leaf discoloration",
          "Abnormal growth patterns",
          "Potential yield reduction"
        ],
        causes: [
          "Environmental stress factors",
          "Pathogen infection",
          "Nutrient imbalance"
        ],
        treatment: {
          immediate: "Apply appropriate fungicide/pesticide treatment",
          long_term: "Implement integrated pest management strategies"
        },
        prevention: [
          "Improve air circulation around plants",
          "Maintain proper watering practices",
          "Use disease-resistant varieties in future plantings"
        ],
        recommendations: [
          "Consult with agricultural extension service",
          "Monitor other plants in the area",
          "Consider crop rotation for next season"
        ],
        risk_level: topPrediction.confidence > 0.7 ? "high" : "moderate",
        estimated_loss: `${(topPrediction.confidence * 100).toFixed(0)}% potential yield loss`,
        next_steps: "Take immediate action to prevent spread and consult agricultural experts"
      };
    }
  }

  async generateQuickTip() {
    try {
      const prompt = `
Generate a helpful agricultural tip for farmers. Keep it concise and practical (1-2 sentences).
Examples:
- "Water your plants early in the morning to prevent fungal diseases"
- "Rotate your crops annually to maintain soil health"
- "Use organic mulch to retain moisture and suppress weeds"

Generate a new tip:
`;

      const text = await this.tryWithDifferentModels(prompt);
      return text.trim();
    } catch (error) {
      console.error('Gemini AI Tip Error:', error.message);
      return "Regular monitoring and early detection are key to healthy crops! 🌱";
    }
  }
}

module.exports = new GeminiService();
