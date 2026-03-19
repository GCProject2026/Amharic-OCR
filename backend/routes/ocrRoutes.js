const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadAndProcessImage, transcribeAudio } = require('../controllers/ocrController');

const upload = multer({ storage: multer.memoryStorage() }).single('image');
const uploadAudio = multer({ storage: multer.memoryStorage() }).single('audio');

// Image upload route
router.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        uploadAndProcessImage(req, res, next);
    });
});

// Audio transcription route
router.post('/transcribe', (req, res, next) => {
    uploadAudio(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        transcribeAudio(req, res, next);
    });
});

module.exports = router;