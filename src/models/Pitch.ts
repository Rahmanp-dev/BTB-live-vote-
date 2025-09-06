import mongoose, { Schema } from 'mongoose';

const PitchSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  presenter: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  ratings: { type: [Number], default: [] },
  visible: { type: Boolean, default: true },
});

export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);
