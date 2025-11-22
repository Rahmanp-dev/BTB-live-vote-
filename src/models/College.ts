import mongoose, { Schema } from 'mongoose';

// Delete the cached model to ensure new schema is used
if (mongoose.models.College) {
    delete mongoose.models.College;
}

const CollegeSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true }, // College-specific coupon code
    discountAmount: { type: Number, required: true },
    earnings: { type: Number, default: 0 },
    registrations: { type: Number, default: 0 }, // Count of registrations, not array
}, { timestamps: true });

export default mongoose.model('College', CollegeSchema);
