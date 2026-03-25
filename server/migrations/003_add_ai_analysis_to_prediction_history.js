const mongoose = require('mongoose');
const { predictionHistorySchema } = require('./001_initial_schema');

/**
 * Ensures prediction_history documents can store Gemini aiAnalysis (Mixed).
 * Safe for DBs created before aiAnalysis was added to 001.
 */
module.exports = {
  up: async function () {
    console.log('🔄 Syncing PredictionHistory schema (aiAnalysis field)...');

    delete mongoose.models.PredictionHistory;
    const PredictionHistory = mongoose.model(
      'PredictionHistory',
      predictionHistorySchema
    );

    await PredictionHistory.syncIndexes();

    console.log('✅ prediction_history schema in sync');
  },

  down: async function () {
    console.log('⚠️  Skipping down: aiAnalysis field left on collection');
  },
};
