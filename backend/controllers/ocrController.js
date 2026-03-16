const OcrRecord = require('../models/OcrRecord');
const cloudinary = require('../config/cloudinary');

const uploadAndProcessImage = async (req, res) => {
    console.log("--- 📥 New OCR Upload Request ---");
    console.log("Request Headers:", req.headers['content-type']);
    
    try {
        // Debugging: Check if multer found the file
        if (!req.file) {
            console.error("❌ No file object found in req.file. Check the field name in Thunder Client.");
            return res.status(400).json({ 
                success: false,
                message: "No file uploaded. Ensure the field name is 'image' and the file is selected." 
            });
        }

        console.log("✅ File caught by Multer:", req.file.originalname);

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'amharic_ocr_project', allowed_formats: ['jpg', 'png', 'jpeg'] },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        console.log("☁️ Cloudinary Upload Success:", uploadResult.secure_url);

        // 1. Create the record in MongoDB
        const newRecord = new OcrRecord({
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            originalName: req.file.originalname,
            status: 'pending'
        });

        const savedRecord = await newRecord.save();
        console.log("💾 MongoDB Record Created:", savedRecord._id);

        // 2. Response
        res.status(201).json({
            success: true,
            message: "Success! Image saved to Cloudinary and MongoDB.",
            data: savedRecord
        });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Server error during upload", 
            error: error.message 
        });
    }
};

module.exports = { uploadAndProcessImage };