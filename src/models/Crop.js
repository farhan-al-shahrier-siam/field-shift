import mongoose from 'mongoose';

const CropSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  scientificName: String,
  category: String,
  growingSeason: [String],
  temperatureRange: {
    min: Number,
    optimal: Number,
    max: Number,
  },
  rainfallRange: {
    min: Number,
    optimal: Number,
    max: Number,
  },
  waterRequirement: String,
  droughtTolerance: String,
  heatTolerance: String,
  floodTolerance: String,
  soilPreferences: [String],
  growingDuration: Number,
  suitableRegions: [String],
  rotationBenefits: String,
  marketValue: String,
  nutritionValue: String,
  icon: String,
}, { timestamps: true });

export default mongoose.models.Crop || mongoose.model('Crop', CropSchema);
