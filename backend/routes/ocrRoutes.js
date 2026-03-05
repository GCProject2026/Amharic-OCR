const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { uploadAndProcessImage } = require('../controllers/ocrController');

const upload = multer({ storage: storage }).single('image');

router.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error("❌ Multer Error:", err.message);
            return res.status(400).json({ error: "Multer: " + err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error("❌ Unknown Upload Error:", err);
            return res.status(500).json({ error: err.message });
        }
        
        // Everything went fine, move to controller
        console.log("✅ Multer successfully parsed the body");
        uploadAndProcessImage(req, res, next);
    });
});

module.exports = router;