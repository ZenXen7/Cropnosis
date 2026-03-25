const mongoose = require('mongoose');

// User Schema Migration
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    birthDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || date < new Date();
        },
        message: 'Birth date cannot be in the future'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    lastLogin: {
      type: Date
    }
  },
  { 
    timestamps: true,
    collection: 'users' // Explicit collection name
  }
);

userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Image Schema Migration
const imageSchema = new mongoose.Schema({
  img: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  predictionResults: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'images'
});

imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ contentType: 1 });
imageSchema.index({ createdAt: -1 });
imageSchema.index({ size: 1 });

// Crop Prediction History Schema
const predictionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  },
  predictions: [{
    disease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  processingTime: {
    type: Number,
    required: true
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  },
  isMockData: {
    type: Boolean,
    default: true
  },
  aiAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'prediction_history'
});

predictionHistorySchema.index({ userId: 1 });
predictionHistorySchema.index({ imageId: 1 });
predictionHistorySchema.index({ createdAt: -1 });
predictionHistorySchema.index({ 'predictions.disease': 1 });

module.exports = {
  userSchema,
  imageSchema,
  predictionHistorySchema,
  up: async function() {
    console.log('🔄 Creating initial database schema...');
    
    try {
      // Create collections with schemas
      const User = mongoose.model('User', userSchema);
      const Image = mongoose.model('Image', imageSchema);
      const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);
      
      // Build indexes from schema definitions (Mongoose 8 ignores arrays passed to createIndexes)
      console.log('📊 Creating database indexes...');

      await User.createIndexes();
      await Image.createIndexes();
      await PredictionHistory.createIndexes();

      console.log('✅ Initial schema created successfully');
      console.log('📋 Ensured collections and indexes: users, images, prediction_history');
      console.log('📊 Created indexes for optimal performance');
      
    } catch (error) {
      console.error('❌ Error creating initial schema:', error.message);
      throw error;
    }
  },

  down: async function() {
    console.log('🔄 Rolling back initial schema...');
    
    try {
      // Drop collections
      await mongoose.connection.db.dropCollection('users');
      await mongoose.connection.db.dropCollection('images');
      await mongoose.connection.db.dropCollection('prediction_history');
      
      // Remove models from mongoose
      delete mongoose.models.User;
      delete mongoose.models.Image;
      delete mongoose.models.PredictionHistory;
      
      console.log('✅ Initial schema rolled back successfully');
      
    } catch (error) {
      console.error('❌ Error rolling back initial schema:', error.message);
      throw error;
    }
  }
};
