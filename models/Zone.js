import mongoose from 'mongoose';

const ZoneSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  risk_level: { type: String, enum: ['MODERATE', 'HIGH', 'CRITICAL'], required: true },
  historical_accidents: { type: Number, required: true },
  real_time_factor: { type: String, required: true },
  warning_message: { type: String, required: true }
});

export default mongoose.models.Zone || mongoose.model('Zone', ZoneSchema);