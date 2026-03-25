const mongoose = require("mongoose");
const Image = require("../models/Image");
const PredictionHistory = require("../models/PredictionHistory");

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function normalizeContentType(mimetype) {
  if (!mimetype) return "image/jpeg";
  const lower = String(mimetype).toLowerCase();
  if (lower === "image/jpg") return "image/jpeg";
  if (ALLOWED_TYPES.has(lower)) return lower;
  return "image/jpeg";
}

function mapPredictionsToDb(predictions) {
  return (predictions || []).map((p) => ({
    disease: p.name,
    confidence: p.confidence,
  }));
}

function fallbackAiAnalysis(doc) {
  const top = doc.predictions?.[0];
  return {
    disease: top?.disease || "Unknown",
    confidence: top?.confidence ?? 0,
    severity: "unknown",
    description: "No stored analysis for this scan.",
    risk_level: "low",
    estimated_loss: "",
  };
}

function mapDocToClient(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  const img = plain.imageId;
  const filename =
    img && typeof img === "object" && img.filename
      ? img.filename
      : "scan.jpg";

  const predictions = (plain.predictions || []).map((p) => ({
    name: p.disease,
    confidence: p.confidence,
  }));

  const aiAnalysis = plain.aiAnalysis || fallbackAiAnalysis(plain);

  return {
    id: plain._id.toString(),
    timestamp: plain.createdAt
      ? new Date(plain.createdAt).toISOString()
      : new Date().toISOString(),
    imageName: filename,
    predictions,
    aiAnalysis,
    processingTime: plain.processingTime,
    success: true,
  };
}

async function getTotalScans() {
  return PredictionHistory.countDocuments();
}

/**
 * Sequential insert: Image then PredictionHistory. Rolls back image if history insert fails.
 * Multi-document transactions need a replica set; this uses delete-one rollback instead.
 */
async function savePrediction({
  userId,
  imageBuffer,
  mimetype,
  originalname,
  predictions,
  aiAnalysis,
  processingTime,
}) {
  const contentType = normalizeContentType(mimetype);
  const filename = originalname || `scan_${Date.now()}.jpg`;

  let imageDoc = await Image.create({
    img: imageBuffer,
    contentType,
    filename,
    size: imageBuffer.length,
    uploadedBy: userId,
    predictionResults: null,
  });

  try {
    const historyDoc = await PredictionHistory.create({
      userId,
      imageId: imageDoc._id,
      predictions: mapPredictionsToDb(predictions),
      processingTime,
      isMockData: true,
      aiAnalysis,
    });

    const populated = await PredictionHistory.findById(historyDoc._id)
      .populate("imageId")
      .exec();

    return mapDocToClient(populated);
  } catch (err) {
    await Image.findByIdAndDelete(imageDoc._id);
    throw err;
  }
}

async function getAllPredictions(userId) {
  const filter = userId ? { userId } : {};
  const docs = await PredictionHistory.find(filter)
    .populate("imageId")
    .sort({ createdAt: -1 })
    .limit(50)
    .exec();

  return docs.map((d) => mapDocToClient(d));
}

async function getStatistics(userId) {
  const filter = userId ? { userId } : {};
  const total = await PredictionHistory.countDocuments(filter);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = await PredictionHistory.countDocuments({
    ...filter,
    createdAt: { $gte: oneWeekAgo },
  });

  const all = await PredictionHistory.find(filter)
    .select("aiAnalysis predictions")
    .lean();

  let healthy = 0;
  for (const p of all) {
    const disease =
      p.aiAnalysis?.disease ?? p.predictions?.[0]?.disease ?? "";
    if (disease === "Healthy") healthy++;
  }

  const diseased = total - healthy;
  const last = await PredictionHistory.findOne(filter)
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  return {
    total,
    healthy,
    diseased,
    recentCount,
    lastScan: last?.createdAt
      ? new Date(last.createdAt).toISOString()
      : null,
  };
}

async function getPredictionById(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  const filter = { _id: id };
  if (userId) {
    filter.userId = userId;
  }

  const doc = await PredictionHistory.findOne(filter)
    .populate("imageId")
    .exec();
  if (!doc) return null;
  return mapDocToClient(doc);
}

module.exports = {
  getTotalScans,
  savePrediction,
  getAllPredictions,
  getStatistics,
  getPredictionById,
  normalizeContentType,
};
