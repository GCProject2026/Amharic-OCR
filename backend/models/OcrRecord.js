const mongoose = require('mongoose');

const ocrRecordSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true }, // URL from Cloudinary
    publicId: { type: String, required: true }, // Cloudinary ID (for deleting later)
    originalName: { type: String },
    ocrResultText: { type: String, default: "" }, // Will be filled by Python
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Optional for now
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OcrRecord', ocrRecordSchema);