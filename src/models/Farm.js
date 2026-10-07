import mongoose from 'mongoose';

const FarmSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    name: String,
  },
  currentCrop: String,
  soilType: String,
  waterAvailability: String,
  irrigationAvailable: Boolean,
  farmingSeason: String,
  farmSize: String,
  challenges: [String],
}, { timestamps: true });

export default mongoose.models.Farm || mongoose.model('Farm', FarmSchema);
