import mongoose from 'mongoose';

const ClimateDataSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  source: { type: String, default: 'NASA POWER' },
  isDemo: { type: Boolean, default: false },
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast lookup
ClimateDataSchema.index({ lat: 1, lon: 1, fetchedAt: -1 });

// Static method to check if cached data is fresh (< 24h old)
ClimateDataSchema.statics.findFresh = async function(lat, lon, maxAgeHours = 24) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  const rounded = (v) => Math.round(v * 100) / 100;
  return this.findOne({
    lat: { $gte: rounded(lat) - 0.01, $lte: rounded(lat) + 0.01 },
    lon: { $gte: rounded(lon) - 0.01, $lte: rounded(lon) + 0.01 },
    fetchedAt: { $gte: cutoff },
    isDemo: false,
  }).sort({ fetchedAt: -1 });
};

export default mongoose.models.ClimateData || mongoose.model('ClimateData', ClimateDataSchema);
