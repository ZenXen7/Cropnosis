const mongoose = require("mongoose");
const User = require("../models/User");

class PredictionUserError extends Error {
  constructor(message) {
    super(message);
    this.name = "PredictionUserError";
  }
}

/**
 * Resolves MongoDB ObjectId for storing predictions when JWT auth is not wired.
 * Set DEFAULT_PREDICTION_USER_ID or ensure DEFAULT_PREDICTION_USER_EMAIL exists in DB.
 */
async function resolvePredictionUserId(userIdFromRequest) {
  if (userIdFromRequest) {
    if (!mongoose.Types.ObjectId.isValid(userIdFromRequest)) {
      throw new PredictionUserError(
        "Invalid userId provided for prediction request."
      );
    }

    const requestUser = await User.findById(userIdFromRequest).select("_id");
    if (!requestUser) {
      throw new PredictionUserError(
        "Prediction userId not found. Please login again."
      );
    }
    return requestUser._id;
  }

  const envId = process.env.DEFAULT_PREDICTION_USER_ID;
  if (envId && mongoose.Types.ObjectId.isValid(envId)) {
    return new mongoose.Types.ObjectId(envId);
  }

  const email =
    process.env.DEFAULT_PREDICTION_USER_EMAIL || "farmer@example.com";
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "_id"
  );

  if (!user) {
    throw new PredictionUserError(
      `No user found for predictions (email: ${email}). Run npm run db:insert-users or set DEFAULT_PREDICTION_USER_ID in .env`
    );
  }

  return user._id;
}

module.exports = {
  resolvePredictionUserId,
  PredictionUserError,
};
