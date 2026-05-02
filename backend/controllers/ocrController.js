const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const processOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Prepare the image to send to Python Flask
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));

    // Send to Flask (Port 5001)
    const pythonResponse = await axios.post('http://localhost:5001/predict', form, {
      headers: { ...form.getHeaders() },
    });

    // Return the recognized Amharic text to React
    res.json({ text: pythonResponse.data.text });

    // Optional: Delete the temp file from backend/uploads after sending
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error('Error contacting AI Service:', error.message);
    res.status(500).json({ error: 'AI Service is offline' });
  }
};

module.exports = { processOCR };