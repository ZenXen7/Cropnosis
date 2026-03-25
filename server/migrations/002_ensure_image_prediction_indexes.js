const mongoose = require('mongoose');
const { imageSchema, predictionHistorySchema } = require('./001_initial_schema');

/**
 * For databases that already ran 001 before indexes were declared on schemas.
 * Idempotent: safe if 001 already created these indexes.
 */
module.exports = {
  up: async function() {
    console.log('🔄 Ensuring images & prediction_history indexes...');

    const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);
    const PredictionHistory =
      mongoose.models.PredictionHistory ||
      mongoose.model('PredictionHistory', predictionHistorySchema);

    await Image.createIndexes();
    await PredictionHistory.createIndexes();

    console.log('✅ images and prediction_history indexes are in sync');
  },

  down: async function() {
    console.log('⚠️  Skipping down: index migration leaves collections as-is');
  }
};
