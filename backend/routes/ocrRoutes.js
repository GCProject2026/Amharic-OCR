const express = require('express');
const router = express.Router();
const { processOCR } = require('../controllers/ocrController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // This keeps the original name and extension (e.g., image.png)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/scan', upload.single('image'), processOCR);

module.exports = router;